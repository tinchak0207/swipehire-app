import type React from 'react';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { CollaborativeSuggestion, Comment } from '../types';

interface CommentsProps {
  comments: Comment[];
  suggestions: CollaborativeSuggestion[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>) => void;
  onAddReply: (reply: Omit<Comment, 'id' | 'timestamp' | 'replies'>, parentId: string) => void;
  onVoteSuggestion: (suggestionId: string, vote: 'up' | 'down') => void;
  socket: Socket | null;
}

const Comments: React.FC<CommentsProps> = ({
  comments,
  suggestions,
  onAddComment,
  onAddReply,
  onVoteSuggestion,
  socket,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (comment: Comment) => {
      onAddComment(comment);
    };

    const handleNewReply = (reply: Comment) => {
      // Assuming the server sends the parentId along with the reply
      onAddReply(reply, (reply as any).parentId);
    };

    const handleSuggestionVote = (vote: { suggestionId: string; vote: 'up' | 'down' }) => {
      onVoteSuggestion(vote.suggestionId, vote.vote);
    };

    socket.on('new-comment', handleNewComment);
    socket.on('new-reply', handleNewReply);
    socket.on('suggestion-vote', handleSuggestionVote);

    return () => {
      socket.off('new-comment', handleNewComment);
      socket.off('new-reply', handleNewReply);
      socket.off('suggestion-vote', handleSuggestionVote);
    };
  }, [
    socket,
    onAddComment, // Assuming the server sends the parentId along with the reply
    onAddReply,
    onVoteSuggestion,
  ]);

  const handleAddComment = () => {
    if (newComment.trim() !== '' && socket) {
      const commentData = {
        content: newComment,
        author: { id: '1', name: 'User' } as any,
        position: {} as any,
        replies: [],
      };
      onAddComment(commentData);
      socket.emit('new-comment', {
        ...commentData,
        id: Date.now().toString(),
        timestamp: new Date(),
      });
      setNewComment('');
    }
  };

  const handleAddReply = (parentId: string) => {
    if (replyContent.trim() !== '' && socket) {
      const replyData = {
        content: replyContent,
        author: { id: '1', name: 'User' } as any,
        position: {} as any,
        replies: [],
      };
      onAddReply(replyData, parentId);
      socket.emit('new-reply', {
        ...replyData,
        id: Date.now().toString(),
        timestamp: new Date(),
        parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleVoteSuggestion = (suggestionId: string, vote: 'up' | 'down') => {
    if (socket) {
      onVoteSuggestion(suggestionId, vote);
      socket.emit('suggestion-vote', { suggestionId, vote });
    }
  };

  return (
    <div className="rounded-lg bg-base-200 p-4">
      <h3 className="mb-4 font-bold text-lg">Comments and Suggestions</h3>

      <div className="mb-4">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="btn btn-primary btn-sm mt-2" onClick={handleAddComment}>
          Add Comment
        </button>
      </div>

      {/* Render suggestions */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="rounded-lg bg-base-100 p-4">
            <p>{suggestion.description}</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                className="btn btn-sm"
                onClick={() => handleVoteSuggestion(suggestion.id, 'up')}
              >
                Upvote ({suggestion.votes.up})
              </button>
              <button
                className="btn btn-sm"
                onClick={() => handleVoteSuggestion(suggestion.id, 'down')}
              >
                Downvote ({suggestion.votes.down})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render comments */}
      <div className="mt-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg bg-base-100 p-4">
            <p>{comment.content}</p>
            <button className="btn btn-sm mt-2" onClick={() => setReplyingTo(comment.id)}>
              Reply
            </button>
            {replyingTo === comment.id && (
              <div className="mt-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Add a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm mt-2"
                  onClick={() => handleAddReply(comment.id)}
                >
                  Add Reply
                </button>
              </div>
            )}
            {comment.replies.map((reply) => (
              <div key={reply.id} className="mt-2 ml-4 rounded-lg bg-base-200 p-4">
                <p>{reply.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
