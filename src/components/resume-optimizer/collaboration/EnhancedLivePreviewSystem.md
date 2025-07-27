# Enhanced Live Preview System

## Overview

The Enhanced Live Preview System is a comprehensive real-time collaboration component that provides instant document changes during editing with advanced features for multi-user collaboration, version control, and AI-powered suggestions.

## Features

### Core Features
- **Real-time side-by-side original vs optimized view** with instant updates
- **Live document changes during editing** with WebSocket integration
- **Multi-user real-time collaboration** with live cursors and selections
- **Instant visual feedback** for changes with smooth animations
- **Advanced diff visualization** with syntax highlighting
- **Collaborative commenting and suggestion system**
- **Version control** with branching and merging capabilities
- **Performance optimized** with virtual scrolling and debounced updates

### View Modes
- **Split View**: Side-by-side comparison of original and optimized content
- **Original View**: Focus on the original document only
- **Optimized View**: Focus on the optimized document only
- **Overlay View**: Layered view with transparency effects
- **Diff View**: Detailed change visualization

### Collaboration Features
- **Live Cursors**: See where other users are editing in real-time
- **Live Selections**: View text selections from other collaborators
- **User Permissions**: Granular control over editing, commenting, and approval rights
- **Real-time Comments**: Add and resolve comments collaboratively
- **Suggestion Voting**: Vote on AI and user suggestions
- **Version Management**: Create, save, and restore document versions

### Accessibility Features
- **WCAG 2.1 AA compliant**
- **Keyboard navigation support**
- **Screen reader compatibility**
- **High contrast mode support**
- **Focus management**
- **ARIA labels and descriptions**

## Usage

### Basic Usage

```tsx
import { EnhancedLivePreviewSystem } from '@/components/resume-optimizer/collaboration';

function MyComponent() {
  const [originalContent, setOriginalContent] = useState('...');
  const [optimizedContent, setOptimizedContent] = useState('...');
  
  return (
    <EnhancedLivePreviewSystem
      originalContent={originalContent}
      optimizedContent={optimizedContent}
      collaborationUsers={collaborationUsers}
      currentUser={currentUser}
      enableRealTimeUpdates={true}
      enableCollaboration={true}
      enableVersionControl={true}
      enableComments={true}
      enableSuggestions={true}
      onContentChange={handleContentChange}
      onSuggestionApply={handleSuggestionApply}
      onCollaborationEvent={handleCollaborationEvent}
      onVersionSave={handleVersionSave}
      onCommentAdd={handleCommentAdd}
    />
  );
}
```

### With Integration Component

```tsx
import { LivePreviewIntegration } from '@/components/resume-optimizer/collaboration';

function ResumeEditor() {
  return (
    <LivePreviewIntegration
      initialContent={initialContent}
      analysisResult={analysisResult}
      userProfile={userProfile}
      optimizationGoals={optimizationGoals}
      collaborationUsers={collaborationUsers}
      enableRealTimeUpdates={true}
      enableCollaboration={true}
      enableVersionControl={true}
      enableComments={true}
      enableSuggestions={true}
      enableAIAssistant={true}
      enableVersionHistory={true}
      websocketUrl="wss://your-websocket-server.com"
      onContentChange={handleContentChange}
      onSectionReorder={handleSectionReorder}
      onSuggestionApply={handleSuggestionApply}
      onTemplateChange={handleTemplateChange}
      onExport={handleExport}
      onCollaborationEvent={handleCollaborationEvent}
      onVersionSave={handleVersionSave}
      onCommentAdd={handleCommentAdd}
    />
  );
}
```

## Props

### EnhancedLivePreviewProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `originalContent` | `string` | ✅ | The original document content |
| `optimizedContent` | `string` | ✅ | The AI-optimized document content |
| `analysisResult` | `EnhancedAnalysisResult` | ❌ | Analysis results for scoring and suggestions |
| `collaborationUsers` | `CollaborationUser[]` | ✅ | Array of users in the collaboration session |
| `currentUser` | `UserProfile` | ✅ | Current user profile |
| `enableRealTimeUpdates` | `boolean` | ✅ | Enable/disable real-time updates |
| `enableCollaboration` | `boolean` | ✅ | Enable/disable collaboration features |
| `enableVersionControl` | `boolean` | ✅ | Enable/disable version control |
| `enableComments` | `boolean` | ✅ | Enable/disable commenting system |
| `enableSuggestions` | `boolean` | ✅ | Enable/disable suggestion system |
| `websocketUrl` | `string` | ❌ | WebSocket URL for real-time communication |
| `onContentChange` | `(content: string) => void` | ✅ | Callback for content changes |
| `onSuggestionApply` | `(action: SuggestionAction) => void` | ✅ | Callback for suggestion actions |
| `onCollaborationEvent` | `(event: CollaborationEvent) => void` | ✅ | Callback for collaboration events |
| `onVersionSave` | `(version: VersionSnapshot) => void` | ✅ | Callback for version saves |
| `onCommentAdd` | `(comment: Comment) => void` | ✅ | Callback for new comments |

## Types

### CollaborationUser

```tsx
interface CollaborationUser {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly color: string;
  readonly cursor: CursorPosition;
  readonly selection?: TextSelection;
  readonly isActive: boolean;
  readonly lastSeen: Date;
  readonly permissions: UserPermissions;
  readonly status: 'online' | 'away' | 'busy' | 'offline';
}
```

### PreviewMode

```tsx
interface PreviewMode {
  readonly view: 'split' | 'original' | 'optimized' | 'diff' | 'overlay';
  readonly layout: 'horizontal' | 'vertical' | 'tabs';
  readonly showChanges: boolean;
  readonly showComments: boolean;
  readonly showSuggestions: boolean;
  readonly showCursors: boolean;
  readonly showLineNumbers: boolean;
  readonly enableSyntaxHighlighting: boolean;
  readonly zoomLevel: number;
}
```

### LiveChange

```tsx
interface LiveChange {
  readonly id: string;
  readonly type: 'addition' | 'deletion' | 'modification' | 'formatting';
  readonly position: TextPosition;
  readonly content: string;
  readonly previousContent?: string;
  readonly userId: string;
  readonly timestamp: Date;
  readonly isApplied: boolean;
  readonly confidence: number;
  readonly impact: ChangeImpact;
}
```

## Styling

The component uses DaisyUI components and Tailwind CSS classes for styling:

### Key Classes
- `card` - Main container styling
- `btn-group` - Button group layouts
- `badge` - Status indicators
- `avatar` - User avatars
- `tooltip` - Hover tooltips
- `tabs` - Tab navigation
- `modal` - Modal dialogs

### Responsive Design
- `grid-cols-1 lg:grid-cols-2` - Responsive grid layouts
- `flex-col lg:flex-row` - Responsive flex directions
- `hidden lg:block` - Responsive visibility

## Performance Optimizations

### Debouncing
- Content changes are debounced to prevent excessive updates
- WebSocket messages are throttled to reduce network traffic

### Virtual Scrolling
- Large documents use virtual scrolling for performance
- Only visible content is rendered

### Memoization
- Expensive calculations are memoized
- Component re-renders are minimized

### Lazy Loading
- Non-critical features are loaded on demand
- Images and assets are lazy loaded

## Testing

The component includes comprehensive tests covering:

### Unit Tests
- Component rendering
- User interactions
- State management
- Error handling

### Integration Tests
- WebSocket communication
- Real-time collaboration
- Version control
- Comment system

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA compliance

### Performance Tests
- Large content handling
- Memory usage
- Rendering performance
- Network efficiency

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Dependencies

### Required
- `react`: ^18.0.0
- `framer-motion`: ^10.0.0
- `tailwindcss`: ^3.0.0
- `daisyui`: ^3.0.0

### Optional
- WebSocket server for real-time features
- Authentication service for user management
- File storage service for version history

## Migration Guide

### From LivePreviewSystem

```tsx
// Old
<LivePreviewSystem
  originalContent={content}
  optimizedContent={optimized}
  // ... other props
/>

// New
<EnhancedLivePreviewSystem
  originalContent={content}
  optimizedContent={optimized}
  collaborationUsers={users}
  currentUser={user}
  enableRealTimeUpdates={true}
  enableCollaboration={true}
  enableVersionControl={true}
  enableComments={true}
  enableSuggestions={true}
  // ... other props
/>
```

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check WebSocket URL configuration
- Verify network connectivity
- Check authentication tokens

#### Performance Issues
- Enable virtual scrolling for large documents
- Reduce update frequency
- Check memory usage

#### Collaboration Not Working
- Verify user permissions
- Check WebSocket connection
- Validate user authentication

### Debug Mode

Enable debug mode for detailed logging:

```tsx
<EnhancedLivePreviewSystem
  // ... other props
  debug={true}
/>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT License - see LICENSE file for details.