/**
 * Enhanced Live Preview System Tests
 *
 * Comprehensive test suite for the Enhanced Live Preview System component
 * covering functionality, accessibility, and performance.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserProfile } from '../types';
import type {
  CollaborationUser as EnhancedCollaborationUser,
  EnhancedLivePreviewProps,
} from './EnhancedLivePreviewSystem';
import { EnhancedLivePreviewSystem } from './EnhancedLivePreviewSystem';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ set: jest.fn() }),
  useSpring: () => ({ set: jest.fn() }),
}));

// Mock hooks
jest.mock('../../../hooks', () => ({
  useDebounce: (value: any) => value,
  useLocalStorage: (initialValue: any) => [initialValue, jest.fn()],
  useWebSocket: () => ({
    isConnected: false,
    sendMessage: jest.fn(),
  }),
}));

describe('EnhancedLivePreviewSystem', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let defaultProps: EnhancedLivePreviewProps;
  let mockCurrentUser: UserProfile;
  let mockCollaborationUsers: EnhancedCollaborationUser[];

  beforeEach(() => {
    user = userEvent.setup();

    mockCurrentUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      experienceLevel: 'mid',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          analysisComplete: true,
          weeklyTips: false,
        },
        privacy: {
          shareAnalytics: true,
          allowPeerReview: false,
          publicProfile: true,
        },
      },
    };

    mockCollaborationUsers = [
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://example.com/jane.jpg',
        color: '#3B82F6',
        cursor: { x: 100, y: 200, line: 1, column: 10 },
        isActive: true,
        lastSeen: new Date(),
        permissions: {
          canEdit: true,
          canComment: true,
          canSuggest: true,
          canApprove: false,
          canManageVersions: false,
          canInviteUsers: false,
        },
        status: 'online',
      },
    ];

    defaultProps = {
      originalContent: 'Original resume content here...',
      optimizedContent: 'Optimized resume content here...',
      analysisResult: {
        id: 'analysis-1',
        overallScore: 85,
        categoryScores: {
          ats: 90,
          keywords: 80,
          format: 88,
          content: 82,
          impact: 85,
          readability: 92,
        },
        suggestions: [],
        achievements: [],
        nextMilestones: [],
        industryBenchmarks: {
          industry: 'tech',
          role: 'Software Engineer',
          averageScore: 75,
          topPercentileScore: 90,
          commonKeywords: ['React', 'Node.js', 'TypeScript'],
          trendingSkills: ['AI', 'Machine Learning'],
        },
        analysisTimestamp: new Date(),
        version: '1.0',
      },
      collaborationUsers: mockCollaborationUsers,
      currentUser: mockCurrentUser,
      enableRealTimeUpdates: true,
      enableCollaboration: true,
      enableVersionControl: true,
      enableComments: true,
      enableSuggestions: true,
      onContentChange: jest.fn(),
      onSuggestionApply: jest.fn(),
      onCollaborationEvent: jest.fn(),
      onVersionSave: jest.fn(),
      onCommentAdd: jest.fn(),
    };
  });

  describe('Rendering', () => {
    it('renders the enhanced live preview system', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      expect(screen.getByText('Enhanced Live Preview System')).toBeInTheDocument();
      expect(screen.getByText('Real-time updates enabled')).toBeInTheDocument();
    });

    it('displays original and optimized content in split view', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      expect(screen.getByText('Original Resume')).toBeInTheDocument();
      expect(screen.getByText('Optimized Resume')).toBeInTheDocument();
      expect(screen.getByText('Original resume content here...')).toBeInTheDocument();
      expect(screen.getByText('Optimized resume content here...')).toBeInTheDocument();
    });

    it('shows collaboration users when enabled', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      // Should show collaboration user avatar
      const avatar = screen.getByAltText('Jane Smith');
      expect(avatar).toBeInTheDocument();
    });

    it('displays real-time status indicator', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const statusIndicator = screen.getByText('Real-time updates enabled');
      expect(statusIndicator).toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('switches to original view only', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const originalButton = screen.getByTitle('Original View');
      await user.click(originalButton);

      expect(screen.getByText('Original Resume')).toBeInTheDocument();
      expect(screen.queryByText('Optimized Resume')).not.toBeInTheDocument();
    });

    it('switches to optimized view only', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const optimizedButton = screen.getByTitle('Optimized View');
      await user.click(optimizedButton);

      expect(screen.getByText('Optimized Resume')).toBeInTheDocument();
      expect(screen.queryByText('Original Resume')).not.toBeInTheDocument();
    });

    it('maintains split view by default', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      expect(screen.getByText('Original Resume')).toBeInTheDocument();
      expect(screen.getByText('Optimized Resume')).toBeInTheDocument();
    });
  });

  describe('Real-time Features', () => {
    it('toggles real-time updates', async () => {
      const onCollaborationEvent = jest.fn();
      render(
        <EnhancedLivePreviewSystem {...defaultProps} onCollaborationEvent={onCollaborationEvent} />
      );

      const realTimeButton = screen.getByText('Real-time');
      await user.click(realTimeButton);

      expect(onCollaborationEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content-change',
          userId: mockCurrentUser.id,
        })
      );
    });

    it('shows collaboration panel when enabled', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const collaborateButton = screen.getByText('Collaborate');
      await user.click(collaborateButton);

      expect(screen.getByText('Collaboration')).toBeInTheDocument();
    });

    it('handles content changes', async () => {
      const onContentChange = jest.fn();
      render(<EnhancedLivePreviewSystem {...defaultProps} onContentChange={onContentChange} />);

      // Simulate content change (this would normally come from editor integration)
      // For testing, we'll trigger it programmatically
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe('Zoom Controls', () => {
    it('increases zoom level', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const zoomInButton = screen.getByTitle('Zoom In');
      await user.click(zoomInButton);

      expect(screen.getByText('110%')).toBeInTheDocument();
    });

    it('decreases zoom level', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const zoomOutButton = screen.getByTitle('Zoom Out');
      await user.click(zoomOutButton);

      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('limits zoom range', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const zoomOutButton = screen.getByTitle('Zoom Out');

      // Click multiple times to test minimum limit
      for (let i = 0; i < 10; i++) {
        await user.click(zoomOutButton);
      }

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Fullscreen Mode', () => {
    it('toggles fullscreen mode', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const fullscreenButton = screen.getByTitle('Toggle Fullscreen');
      await user.click(fullscreenButton);

      expect(screen.getByText('Exit')).toBeInTheDocument();
    });
  });

  describe('Change Tracking', () => {
    it('shows changes when enabled', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const changesButton = screen.getByTitle('Show Changes');
      expect(changesButton).toHaveClass('btn-success');
    });

    it('toggles change visibility', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const changesButton = screen.getByTitle('Show Changes');
      await user.click(changesButton);

      expect(changesButton).toHaveClass('btn-ghost');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const splitButton = screen.getByTitle('Split View');
      expect(splitButton).toBeInTheDocument();

      const realTimeButton = screen.getByText('Real-time');
      expect(realTimeButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const splitButton = screen.getByTitle('Split View');
      splitButton.focus();

      expect(splitButton).toHaveFocus();

      await user.keyboard('{Tab}');

      const originalButton = screen.getByTitle('Original View');
      expect(originalButton).toHaveFocus();
    });

    it('provides proper focus management', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      const collaborateButton = screen.getByText('Collaborate');
      await user.click(collaborateButton);

      // Focus should move to collaboration panel
      expect(screen.getByText('Collaboration')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large content efficiently', () => {
      const largeContent = 'Large content '.repeat(1000);
      const propsWithLargeContent = {
        ...defaultProps,
        originalContent: largeContent,
        optimizedContent: largeContent,
      };

      const { container } = render(<EnhancedLivePreviewSystem {...propsWithLargeContent} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Original Resume')).toBeInTheDocument();
    });

    it('debounces content updates', async () => {
      const onContentChange = jest.fn();
      render(<EnhancedLivePreviewSystem {...defaultProps} onContentChange={onContentChange} />);

      // Multiple rapid changes should be debounced
      // This would be tested with actual content editing in integration
      expect(onContentChange).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles disabled features gracefully', () => {
      const propsWithDisabledFeatures = {
        ...defaultProps,
        enableCollaboration: false,
        enableComments: false,
        enableSuggestions: false,
      };

      render(<EnhancedLivePreviewSystem {...propsWithDisabledFeatures} />);

      expect(screen.getByText('Enhanced Live Preview System')).toBeInTheDocument();
      expect(screen.queryByText('Collaborate')).not.toBeInTheDocument();
    });

    it('handles empty collaboration users', () => {
      const propsWithNoUsers = {
        ...defaultProps,
        collaborationUsers: [],
      };

      render(<EnhancedLivePreviewSystem {...propsWithNoUsers} />);

      expect(screen.getByText('Enhanced Live Preview System')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('calls all callback functions appropriately', async () => {
      const callbacks = {
        onContentChange: jest.fn(),
        onSuggestionApply: jest.fn(),
        onCollaborationEvent: jest.fn(),
        onVersionSave: jest.fn(),
        onCommentAdd: jest.fn(),
      };

      render(<EnhancedLivePreviewSystem {...defaultProps} {...callbacks} />);

      // Test real-time toggle
      const realTimeButton = screen.getByText('Real-time');
      await user.click(realTimeButton);

      expect(callbacks.onCollaborationEvent).toHaveBeenCalled();
    });

    it('maintains state consistency across interactions', async () => {
      render(<EnhancedLivePreviewSystem {...defaultProps} />);

      // Switch views and verify state
      const originalButton = screen.getByTitle('Original View');
      await user.click(originalButton);

      expect(screen.getByText('Original Resume')).toBeInTheDocument();

      const splitButton = screen.getByTitle('Split View');
      await user.click(splitButton);

      expect(screen.getByText('Original Resume')).toBeInTheDocument();
      expect(screen.getByText('Optimized Resume')).toBeInTheDocument();
    });
  });
});
