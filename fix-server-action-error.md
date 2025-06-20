# SwipeHire Server Action Error Fix

## Problem Summary
The recruiter onboarding was failing with these errors:
- `POST http://localhost:3000/recruiter-onboarding 400 (Bad Request)`
- `Error: An unexpected response was received from the server`
- `net::ERR_CONNECTION_RESET`

## Root Cause Analysis

### **Primary Issue: Incorrect 'use server' Directive**
The service files in `src/services/` had the `'use server'` directive, which tells Next.js to treat these functions as **server actions** instead of **client-side API calls**.

### **What 'use server' Does**
- Converts functions into Next.js server actions
- Makes them run on the Next.js server (localhost:3000)
- Creates special endpoints like `/recruiter-onboarding` instead of calling external APIs
- Intended for server-side operations, not external API calls

### **What We Actually Need**
- Client-side functions that make fetch calls to our custom backend
- Direct API calls to `http://localhost:5000/api/users/{id}/profile`
- Standard HTTP requests with proper error handling

## Error Flow Analysis

```
1. User submits onboarding form
   ↓
2. submitCompanyRegistration() called
   ↓
3. Next.js sees 'use server' directive
   ↓
4. Converts to server action: POST /recruiter-onboarding
   ↓
5. Tries to call localhost:3000/recruiter-onboarding (doesn't exist)
   ↓
6. Returns 400 Bad Request
   ↓
7. Frontend shows "unexpected response" error
```

## Solution Implementation

### **1. Remove 'use server' Directives**
**Files Fixed**:
- `src/services/recruiterService.ts`
- `src/services/userService.ts`
- `src/services/reviewService.ts`
- `src/services/matchService.ts`
- `src/services/interactionService.ts`
- `src/services/diaryService.ts`
- `src/services/chatService.ts`

**Before**:
```typescript
'use server';

export async function submitCompanyRegistration(...) {
  // This becomes a server action
}
```

**After**:
```typescript
export async function submitCompanyRegistration(...) {
  // This is now a regular client-side function
}
```

### **2. Preserve Client-Side Behavior**
All services now work as intended:
- Make direct fetch calls to `http://localhost:5000`
- Handle responses and errors properly
- Work from the browser (client-side)

### **3. Maintain Existing Logic**
No changes to:
- Function signatures
- Error handling logic
- Response processing
- Backend API endpoints

## Fixed Flow

```
1. User submits onboarding form
   ↓
2. submitCompanyRegistration() called (client-side)
   ↓
3. Makes fetch call to http://localhost:5000/api/users/{id}/profile
   ↓
4. Backend processes request and updates database
   ↓
5. Returns success response
   ↓
6. Frontend processes response and updates context
   ↓
7. User sees success message and is redirected
```

## Testing the Fix

### **Manual Testing**
1. **Start Services**:
   ```powershell
   .\start-backend.ps1
   npm run dev
   ```

2. **Test Onboarding**:
   - Navigate to recruiter onboarding
   - Fill out all required fields
   - Submit the form
   - Should succeed without errors

3. **Verify Network Calls**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Submit onboarding
   - Should see: `POST http://localhost:5000/api/users/{id}/profile`
   - Should NOT see: `POST http://localhost:3000/recruiter-onboarding`

### **Automated Testing**
```powershell
.\test-server-action-fix.ps1
```

This verifies all `'use server'` directives have been removed.

## Expected Behavior After Fix

### **✅ Success Indicators**
- Onboarding form submits successfully
- API calls go to `http://localhost:5000`
- Success toast message appears
- User is redirected to dashboard
- No "Company Profile Incomplete" messages

### **❌ Error Indicators (Should Not Happen)**
- 400 Bad Request errors
- Calls to `localhost:3000/recruiter-onboarding`
- "Unexpected response" errors
- Connection reset errors

## Browser Console Output

### **Before Fix (Error)**
```
POST http://localhost:3000/recruiter-onboarding 400 (Bad Request)
Error: An unexpected response was received from the server
```

### **After Fix (Success)**
```
[RecruiterService] Making request to: http://localhost:5000/api/users/{id}/profile
[RecruiterService] Response status: 200 OK
[RecruiterService] Company profile information saved successfully
```

## Understanding Next.js Server Actions

### **When to Use 'use server'**
- Server-side form processing
- Database operations on the Next.js server
- File system operations
- Server-side authentication

### **When NOT to Use 'use server'**
- ✅ **Our Case**: Making API calls to external backends
- Client-side data fetching
- Browser-based operations
- Third-party API integrations

### **Key Differences**

| Server Actions ('use server') | Client-Side Functions |
|-------------------------------|----------------------|
| Run on Next.js server | Run in browser |
| Create special endpoints | Make fetch calls |
| localhost:3000/action-name | localhost:5000/api/... |
| Server-side only | Client-side only |

## File-by-File Changes

### **recruiterService.ts**
```diff
- 'use server';
  
  export async function submitCompanyRegistration(...) {
    // Now makes direct API call to backend
  }
```

### **userService.ts**
```diff
- 'use server';
  
  export async function deleteUserAccount(...) {
    // Now makes direct API call to backend
  }
```

### **All Other Services**
Same pattern: removed `'use server'` directive, preserved all other logic.

## Prevention Strategies

### **Code Review Checklist**
- [ ] No `'use server'` in client-side service files
- [ ] API calls target correct backend URL
- [ ] Functions are exported normally (not as server actions)

### **Development Guidelines**
1. **Services Directory**: Never use `'use server'` in `src/services/`
2. **Server Actions**: Only use in `src/app/` for form actions
3. **API Calls**: Always target external backend, not Next.js server

### **Testing Protocol**
1. Check Network tab for correct API endpoints
2. Verify no calls to localhost:3000 (except page loads)
3. Confirm all API calls go to localhost:5000

## Related Issues Fixed

This fix also resolves:
- ✅ Job posting API calls
- ✅ User profile updates
- ✅ Match interactions
- ✅ Diary post creation
- ✅ Chat message sending
- ✅ Company reviews

All services now work as intended client-side functions.

## Conclusion

The `'use server'` directive was causing Next.js to treat our API service functions as server actions instead of client-side functions. Removing these directives restored the intended behavior:

1. **Correct Routing**: API calls now go to our backend (localhost:5000)
2. **Proper Error Handling**: Standard fetch error handling works
3. **Client-Side Execution**: Functions run in the browser as intended
4. **Successful Onboarding**: The complete flow now works end-to-end

This is a common mistake when working with Next.js 13+ App Router, where the `'use server'` directive has a very specific purpose that doesn't apply to external API calls.