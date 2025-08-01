import type React from 'react';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { CollaborativeSuggestion, UserProfile } from '../types';

interface PeerReviewProps {
  socket: Socket | null;
  currentUser: UserProfile;
  resumeContent: string;
  onReviewSubmit: (
    review: Omit<CollaborativeSuggestion, 'id' | 'author' | 'votes' | 'comments'>
  ) => void;
}

interface Review {
  id: string;
  reviewer: UserProfile;
  rating: number;
  comment: string;
  timestamp: Date;
}

const PeerReview: React.FC<PeerReviewProps> = ({
  socket,
  currentUser,
  resumeContent,
  onReviewSubmit,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    const handleNewReview = (review: Review) => {
      setReviews((prev) => [...prev, review]);
    };

    socket.on('new-review', handleNewReview);

    return () => {
      socket.off('new-review', handleNewReview);
    };
  }, [socket]);

  const handleSubmitReview = () => {
    if (rating === 0 || !comment.trim() || !socket || isSubmitting) return;

    setIsSubmitting(true);

    const newReview: Review = {
      id: Date.now().toString(),
      reviewer: currentUser,
      rating,
      comment,
      timestamp: new Date(),
    };

    // Add locally first for immediate feedback
    setReviews((prev) => [...prev, newReview]);

    // Emit to other users
    socket.emit('new-review', newReview);

    // Create a suggestion based on the review
    const suggestion: Omit<CollaborativeSuggestion, 'id' | 'author' | 'votes' | 'comments'> = {
      type: 'content-enhancement',
      priority: rating >= 4 ? 'high' : 'medium',
      category: 'content',
      title: `Peer Review: ${rating}/5 stars`,
      description: comment,
      impact: {
        scoreIncrease: rating,
        atsCompatibility: rating,
        readabilityImprovement: rating,
        keywordDensity: rating,
      },
      effort: {
        timeMinutes: 10,
        difficulty: 'medium',
        requiresManualReview: true,
      },
      beforePreview: `${resumeContent.substring(0, 100)}...`,
      afterPreview: comment,
      isApplied: false,
      canAutoApply: false,
    };

    onReviewSubmit(suggestion);

    // Reset form
    setRating(0);
    setComment('');
    setIsSubmitting(false);
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isSubmitting}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-xl">Peer Review</h2>

      <div className="mb-6">
        <h3 className="mb-2 font-semibold">Rate this resume</h3>
        {renderStars()}
      </div>

      <div className="mb-6">
        <label htmlFor="review-comment" className="mb-2 block font-medium">
          Your feedback
        </label>
        <textarea
          id="review-comment"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Share your detailed feedback on the resume's content, structure, and presentation..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button
        className={`rounded-md px-4 py-2 font-medium ${
          rating === 0 || !comment.trim() || isSubmitting
            ? 'cursor-not-allowed bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        onClick={handleSubmitReview}
        disabled={rating === 0 || !comment.trim() || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>

      {reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-semibold">Peer Reviews ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                      {review.reviewer.name.charAt(0)}
                    </div>
                    <span className="font-medium">{review.reviewer.name}</span>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mb-2 text-gray-700">{review.comment}</p>
                <p className="text-gray-500 text-sm">{review.timestamp.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerReview;
