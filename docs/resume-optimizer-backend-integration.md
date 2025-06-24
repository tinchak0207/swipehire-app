# Resume Optimizer Backend API Integration

## Overview

This document describes the implementation of Task #17: "Integrate with Backend API for Analysis Request" for the SwipeHire Resume Optimizer feature. The integration provides comprehensive backend AI analysis capabilities with robust error handling and fallback mechanisms.

## Architecture

### Service Layer Architecture

```
Frontend Components
       ↓
Custom Hooks (useResumeAnalysis)
       ↓
Service Layer (resumeOptimizerService)
       ↓
Backend AI API ← → Local Fallback API
```

### Key Components

1. **Service Functions** (`resumeOptimizerService.ts`)
   - `analyzeResume()` - Main analysis function with backend integration
   - `reanalyzeResume()` - Re-analysis with updated content
   - `checkBackendAvailability()` - Health check for backend service

2. **Custom Hooks** (`useResumeAnalysis.ts`)
   - `useResumeAnalysis()` - Advanced hook with full state management
   - `useSimpleResumeAnalysis()` - Simplified interface for basic needs

3. **Demo Component** (`ResumeAnalysisDemo.tsx`)
   - Complete demonstration of API integration
   - Error handling showcase
   - Loading state management

## API Integration Details

### Backend Endpoint

**Primary Endpoint:** `POST /api/resume/analyze`
**Fallback Endpoint:** `POST /api/resume-optimizer/analyze`

### Request Payload

```typescript
interface BackendAnalysisRequest {
  resumeText: string;
  targetJob: {
    title: string;
    keywords: string;
    description?: string;
    company?: string;
  };
  analysisOptions?: {
    includeATSAnalysis?: boolean;
    includeKeywordAnalysis?: boolean;
    includeGrammarCheck?: boolean;
    includeQuantitativeAnalysis?: boolean;
    includeFormatAnalysis?: boolean;
  };
  userId?: string;
  templateId?: string;
}
```

### Response Structure

```typescript
interface BackendAnalysisResponse {
  success: boolean;
  data?: {
    analysisId: string;
    overallScore: number;
    atsCompatibilityScore: number;
    keywordAnalysis: KeywordAnalysis;
    grammarAnalysis: GrammarAnalysis;
    formatAnalysis: FormatAnalysis;
    quantitativeAnalysis: QuantitativeAnalysis;
    optimizationSuggestions: OptimizationSuggestion[];
    processingTime: number;
    createdAt: string;
  };
  error?: string;
  message?: string;
}
```

## Error Handling Strategy

### Error Types and Handling

1. **Network Errors**
   - Connection failures
   - Timeout errors (60-second limit)
   - DNS resolution issues
   - **Action:** Automatic fallback to local analysis

2. **HTTP Status Errors**
   - `400 Bad Request` - Validation errors
   - `401 Unauthorized` - Authentication required
   - `429 Too Many Requests` - Rate limiting
   - `500+ Server Errors` - Backend service issues
   - **Action:** Specific error messages or fallback

3. **Response Format Errors**
   - Invalid JSON responses
   - Missing required fields
   - Malformed data structures
   - **Action:** Error reporting with fallback

### Error Recovery Flow

```
Backend Request
      ↓
   Success? → Yes → Transform Response
      ↓ No
   Network Error? → Yes → Fallback to Local API
      ↓ No
   Server Error? → Yes → Fallback to Local API
      ↓ No
   Client Error? → Yes → Show Error Message
      ↓
   Unexpected Error → Show Generic Error
```

## Loading States and Progress Tracking

### Progress Stages

1. **Parsing** (10% - 25%)
   - Resume text validation
   - Request preparation
   - Initial processing

2. **Analyzing** (25% - 75%)
   - Backend AI analysis
   - Keyword matching
   - Grammar checking

3. **Generating Suggestions** (75% - 95%)
   - Optimization recommendations
   - Score calculations
   - Report compilation

4. **Finalizing** (95% - 100%)
   - Response transformation
   - Final validation
   - State updates

### Progress Callback Interface

```typescript
interface AnalysisLoadingState {
  isLoading: boolean;
  progress?: number;
  stage?: 'parsing' | 'analyzing' | 'generating_suggestions' | 'finalizing';
  message?: string;
}
```

## Usage Examples

### Basic Usage with Simple Hook

```typescript
import { useSimpleResumeAnalysis } from '@/hooks/useResumeAnalysis';

function ResumeAnalyzer() {
  const { isAnalyzing, analysisResult, error, analyze } = useSimpleResumeAnalysis();

  const handleAnalyze = async () => {
    await analyze(
      resumeText,
      'Senior Software Engineer',
      'React, Node.js, TypeScript'
    );
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
      </button>
      {error && <div className="alert alert-error">{error.message}</div>}
      {analysisResult && <ResumeReport result={analysisResult} />}
    </div>
  );
}
```

### Advanced Usage with Full Hook

```typescript
import { useResumeAnalysis } from '@/hooks/useResumeAnalysis';

function AdvancedResumeAnalyzer() {
  const {
    isAnalyzing,
    analysisResult,
    error,
    loadingState,
    isBackendAvailable,
    startAnalysis,
    startReanalysis,
    cancelAnalysis,
  } = useResumeAnalysis();

  const handleAnalyze = async () => {
    const request: ResumeAnalysisRequest = {
      resumeText,
      targetJob: {
        title: 'Senior Software Engineer',
        keywords: 'React, Node.js, TypeScript',
        description: jobDescription,
        company: 'Tech Corp',
      },
      userId: 'user-123',
      templateId: 'software-engineer',
    };

    await startAnalysis(request);
  };

  return (
    <div>
      {/* Backend status indicator */}
      <div className={`alert ${isBackendAvailable ? 'alert-success' : 'alert-warning'}`}>
        Backend: {isBackendAvailable ? 'Available' : 'Unavailable (using fallback)'}
      </div>

      {/* Progress indicator */}
      {isAnalyzing && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${loadingState.progress}%` }} />
          <p>{loadingState.message}</p>
          <button onClick={cancelAnalysis}>Cancel</button>
        </div>
      )}

      {/* Analysis controls */}
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        Analyze Resume
      </button>

      {analysisResult && (
        <button onClick={() => startReanalysis(updatedResumeText, analysisResult.id, targetJob)}>
          Re-analyze
        </button>
      )}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { analyzeResume } from '@/services/resumeOptimizerService';

async function performAnalysis() {
  try {
    const result = await analyzeResume(
      {
        resumeText: 'John Smith...',
        targetJob: {
          title: 'Software Engineer',
          keywords: 'React, Node.js',
        },
      },
      (progress) => {
        console.log(`Progress: ${progress.progress}% - ${progress.message}`);
      }
    );

    console.log('Analysis complete:', result);
  } catch (error) {
    if (error instanceof ResumeAnalysisError) {
      console.error('Analysis failed:', error.message, error.code);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# Backend AI service URL
NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://localhost:5000

# API base URL for fallback
NEXT_PUBLIC_API_URL=/api
```

### Request Configuration

- **Timeout:** 60 seconds
- **Retry Logic:** Automatic fallback to local API
- **Authentication:** Cookies included (`credentials: 'include'`)
- **Request ID:** Auto-generated for tracking

## Testing Strategy

### Unit Tests

- Service function validation
- Error handling scenarios
- Input parameter validation
- Response transformation

### Integration Tests

- Backend API communication
- Fallback mechanism testing
- Network error simulation
- Concurrent request handling

### Test Coverage Areas

1. **Successful Analysis Flow**
   - Valid request/response cycle
   - Progress tracking
   - Result transformation

2. **Error Scenarios**
   - Network failures
   - HTTP status errors
   - Invalid responses
   - Timeout handling

3. **Fallback Mechanisms**
   - Backend unavailable
   - Server errors
   - Local API fallback

4. **Edge Cases**
   - Large resume content
   - Concurrent requests
   - Malformed data

### Running Tests

```bash
# Run all tests
npm test

# Run integration tests specifically
npm test resumeOptimizerService.integration.test.ts

# Run with coverage
npm test -- --coverage
```

## Performance Considerations

### Optimization Strategies

1. **Request Optimization**
   - Payload compression
   - Request deduplication
   - Intelligent retry logic

2. **Response Handling**
   - Streaming for large responses
   - Progressive result updates
   - Efficient data transformation

3. **Caching Strategy**
   - Backend availability caching
   - Result caching for re-analysis
   - Template caching

4. **Error Recovery**
   - Fast fallback switching
   - Graceful degradation
   - User feedback optimization

### Performance Metrics

- **Analysis Time:** Target < 30 seconds
- **Fallback Time:** < 5 seconds
- **Memory Usage:** Optimized for large resumes
- **Concurrent Requests:** Support for multiple users

## Security Considerations

### Data Protection

1. **Request Security**
   - HTTPS enforcement
   - Request signing
   - Rate limiting compliance

2. **Data Handling**
   - No sensitive data logging
   - Secure error messages
   - PII protection

3. **Authentication**
   - Cookie-based auth
   - Session validation
   - CORS configuration

## Monitoring and Debugging

### Logging Strategy

```typescript
// Request logging
console.log('Starting analysis:', {
  requestId: 'resume-analysis-123',
  userId: 'user-456',
  resumeLength: resumeText.length,
  targetJob: targetJob.title,
});

// Error logging
console.error('Analysis failed:', {
  error: error.message,
  code: error.code,
  statusCode: error.statusCode,
  requestId: 'resume-analysis-123',
});
```

### Debug Information

- Request/response payloads (development only)
- Performance timing
- Backend availability status
- Fallback trigger events

## Future Enhancements

### Planned Improvements

1. **Advanced Features**
   - Real-time analysis streaming
   - Collaborative editing support
   - Multi-language analysis

2. **Performance Optimizations**
   - WebSocket connections
   - Progressive analysis
   - Intelligent caching

3. **Enhanced Error Handling**
   - Retry with exponential backoff
   - Circuit breaker pattern
   - Health check automation

4. **Analytics Integration**
   - Usage metrics
   - Performance monitoring
   - Error tracking

## Troubleshooting

### Common Issues

1. **Backend Unavailable**
   - Check `NEXT_PUBLIC_CUSTOM_BACKEND_URL`
   - Verify backend service status
   - Confirm network connectivity

2. **Authentication Errors**
   - Verify cookie configuration
   - Check session validity
   - Confirm CORS settings

3. **Timeout Issues**
   - Check network latency
   - Verify backend performance
   - Consider timeout adjustments

4. **Fallback Not Working**
   - Verify local API endpoints
   - Check fallback logic
   - Confirm error handling

### Debug Commands

```bash
# Check backend availability
curl -X GET http://localhost:5000/api/health

# Test analysis endpoint
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"test","targetJob":{"title":"test","keywords":"test"}}'

# Check local fallback
curl -X POST http://localhost:3000/api/resume-optimizer/analyze \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"test","targetJob":{"title":"test","keywords":"test"}}'
```

## Conclusion

The backend API integration for resume analysis provides a robust, scalable solution with comprehensive error handling and fallback mechanisms. The implementation follows best practices for TypeScript, React, and Next.js development while ensuring excellent user experience through proper loading states and error feedback.

The modular architecture allows for easy testing, maintenance, and future enhancements while providing both simple and advanced interfaces for different use cases.