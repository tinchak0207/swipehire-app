# SwipeHire Onboarding Issue Fix Guide

## Problem Summary
The company onboarding process fails with a 400 Bad Request error when submitting the final step. The error occurs because:

1. **Missing Database Fields**: The User model in `swipehire-backend/models/User.js` was missing critical fields like `companyProfileComplete` and other company-related fields.

2. **Backend Server Not Running**: The backend server at `http://localhost:5000` may not be running or accessible.

3. **Database Connection Issues**: MongoDB connection might be failing.

## Fixes Applied

### 1. Updated User Model Schema
✅ **Fixed**: Updated `swipehire-backend/models/User.js` to include all required fields:
- `companyProfileComplete` (Boolean)
- `companyScale`, `companyAddress`, `companyWebsite`, `companyDescription`
- `companyCultureHighlights`, `companyVerificationDocuments`
- Enhanced error handling and validation

### 2. Enhanced Backend Error Handling
✅ **Fixed**: Updated `swipehire-backend/controllers/users/userController.js`:
- Added detailed logging for debugging
- Improved error messages
- Added validation for required fields
- Better handling of different error types

### 3. Improved Frontend Error Handling
✅ **Fixed**: Updated `src/services/recruiterService.ts`:
- Enhanced error logging
- Better error messages for users
- Network error detection
- More detailed request/response logging

### 4. Environment Configuration
✅ **Fixed**: Created `.env.local` with proper backend URL configuration.

## Steps to Resolve the Issue

### Step 1: Start the Backend Server
```powershell
# Navigate to backend directory
cd swipehire-backend

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

The server should start on `http://localhost:5000` and show:
- MongoDB connection success message
- Server running message

### Step 2: Verify Database Connection
The backend will automatically connect to MongoDB. Look for this message:
```
Connected to MongoDB at mongodb+srv://tinchak0207:****@swipehire.fwxspbu.mongodb.net/...
```

### Step 3: Test the Frontend
1. Start the Next.js development server:
```powershell
npm run dev
```

2. Navigate to the recruiter onboarding page
3. Complete all steps and submit

### Step 4: Monitor Logs
Check both frontend (browser console) and backend (terminal) logs for detailed error information.

## Troubleshooting

### If Backend Won't Start
1. Check if port 5000 is available:
```powershell
netstat -an | findstr :5000
```

2. If port is in use, kill the process or change the port in `swipehire-backend/config/constants.js`

### If Database Connection Fails
1. Verify MongoDB URI in `swipehire-backend/config/database.js`
2. Check network connectivity
3. Verify MongoDB Atlas cluster is running

### If Frontend Can't Connect to Backend
1. Verify `.env.local` has correct `NEXT_PUBLIC_CUSTOM_BACKEND_URL`
2. Check CORS settings in `swipehire-backend/config/constants.js`
3. Ensure backend server is running and accessible

## Testing the Fix

### Manual Test
1. Complete recruiter onboarding flow
2. Submit the final step
3. Verify success message appears
4. Check that `companyProfileComplete` is set to `true` in the database

### API Test
You can test the API directly:
```javascript
// Test in browser console
fetch('http://localhost:5000/api/users/YOUR_USER_ID/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'Test Company',
    companyIndustry: 'Technology',
    companyProfileComplete: true
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Expected Behavior After Fix
1. ✅ Backend server starts without errors
2. ✅ MongoDB connection succeeds
3. ✅ Onboarding form submits successfully
4. ✅ User profile is updated with company information
5. ✅ `companyProfileComplete` flag is set to `true`
6. ✅ User is redirected to dashboard
7. ✅ Job posting functionality becomes available

## Additional Notes
- The fix maintains backward compatibility with existing user data
- All new fields have appropriate default values
- Enhanced logging helps with future debugging
- Error messages are more user-friendly

If issues persist, check the browser console and backend terminal for specific error messages and refer to the enhanced logging output.