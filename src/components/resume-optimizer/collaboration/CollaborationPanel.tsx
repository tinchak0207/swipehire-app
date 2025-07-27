import type React from 'react';
import type { Socket } from 'socket.io-client';
import type { CollaborativeSuggestion, Comment, UserProfile } from '../types';
import Comments from './Comments';

interface CollaborationPanelProps {
  comments: Comment[];
  suggestions: CollaborativeSuggestion[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>) => void;
  onAddReply: (reply: Omit<Comment, 'id' | 'timestamp' | 'replies'>, parentId: string) => void;
  onVoteSuggestion: (suggestionId: string, vote: 'up' | 'down') => void;
  socket: Socket | null;
  currentUser: UserProfile;
  collaborationUsers: UserProfile[];
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  comments,
  suggestions,
  onAddComment,
  onAddReply,
  onVoteSuggestion,
  socket,
}) => {
  return (
    <div className="h-full overflow-y-auto rounded-lg bg-base-200 p-4">
      <h3 className="mb-4 font-bold text-lg">Collaboration</h3>
      {/* Add other collaboration features here in the future */}
      <Comments
        comments={comments}
        suggestions={suggestions}
        onAddComment={onAddComment}
        onAddReply={onAddReply}
        onVoteSuggestion={onVoteSuggestion}
        socket={socket}
      />
    </div>
  );
};

export default CollaborationPanel;
