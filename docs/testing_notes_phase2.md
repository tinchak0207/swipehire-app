# Test Cases for Career Planning AI Assistant - Phase 2 Features

This document outlines test cases for features implemented in Phase 2 of the Career Planning AI Assistant. Testing should cover backend API functionality, frontend UI/UX interactions, and analytics event logging.

## I. Backend API Testing

These tests should be performed using an API client (e.g., Postman, Insomnia) or automated API tests.

**A. Onboarding (`POST /api/users/:userId/complete-career-onboarding`)**

1.  **Test Case: Submit valid onboarding data.**
    *   **Steps:**
        1.  Choose an existing `userId`.
        2.  Send a POST request with a valid JSON body containing fields like `educationLevel`, `workExperienceSummary`, `skillsString`, `interestsArray`, `valuesArray`, `initialCareerExpectations`.
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body contains a success message and updated user data.
        *   Database: The corresponding `User` document should have `hasCompletedCareerPlannerOnboarding` set to `true`.
        *   Profile fields (`profileEducationLevel`, `profileExperienceSummary`, `profileSkills`, `careerInterests`, `careerValues`, `initialCareerExpectations`) should be updated.
        *   If `user.careerGoals` was initially empty and `initialCareerExpectations` was provided, `user.careerGoals` should now be populated with `initialCareerExpectations`.
        *   Analytics: `career_planner_onboarding_completed` event logged.

2.  **Test Case: Submit request with missing required fields (if API defines any as strictly mandatory beyond basic structure).**
    *   **Steps:** Send a POST request with incomplete data (e.g., if `initialCareerExpectations` was made mandatory by a specific requirement not listed but implied).
    *   **Expected Result:** HTTP Status: 400 Bad Request (or as defined by specific field validations). Response body indicates missing fields.

3.  **Test Case: Submit request for non-existent `userId`.**
    *   **Steps:** Send a POST request using a `userId` that does not exist in the database.
    *   **Expected Result:** HTTP Status: 404 Not Found. Response body indicates user not found.

**B. Plan Generation (`POST /api/users/:userId/career-plan`) - Focus on Phase 2 additions**

1.  **Test Case: Generate a plan for a user (ensure user has some profile data).**
    *   **Steps:**
        1.  Choose an existing `userId` who has completed onboarding.
        2.  Send a POST request with necessary inputs (e.g., `careerGoals`, `careerInterests`, `careerValues` in the body, though the flow primarily uses existing user data for context).
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body contains the `aiCareerPlan` object.
        *   Database: The `User` document should have `assessedCareerStage` and `assessedCareerStageReasoning` populated based on the AI flow's output. The `aiCareerPlan` field should also be populated.
        *   Analytics: `career_plan_generated` event logged.

**C. Goal Management (`/api/users/:userId/goals/...`)**

1.  **Test Case: `POST /goals` - Add a new goal.**
    *   **Steps:**
        1.  Choose an existing `userId`.
        2.  Send POST requests to add a short-term, a mid-term, and a long-term goal, providing valid `text` and `category`. Optionally include `targetDate`.
    *   **Expected Result:**
        *   HTTP Status: 201 Created for each request.
        *   Response body contains the newly created goal object, including an `_id`, `actionItems: []`, and `isCompleted: false`.
        *   Database: The `userGoals` array in the `User` document contains the new goal with all properties correctly set.

2.  **Test Case: `PUT /goals/:goalId` - Update an existing goal.**
    *   **Steps:**
        1.  Use a `goalId` from a previously created goal.
        2.  Send a PUT request with new values for `text`, `category`, `targetDate`, and `isCompleted`.
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body contains the updated goal object.
        *   Database: The specified goal in the `userGoals` array is updated. The `updatedAt` timestamp for that goal is modified.

3.  **Test Case: `DELETE /goals/:goalId` - Delete an existing goal.**
    *   **Steps:** Use a `goalId` from a previously created goal. Send a DELETE request.
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body indicates success (e.g., message and remaining goals).
        *   Database: The specified goal is removed from the `userGoals` array.

4.  **Test Case: Operations on non-existent `userId` or `goalId`.**
    *   **Steps:**
        1.  Attempt POST, PUT, DELETE with an invalid `userId`.
        2.  Attempt PUT, DELETE with a valid `userId` but an invalid `goalId`.
    *   **Expected Result:** HTTP Status: 404 Not Found for all attempts.

**D. Action Item Management (`/api/users/:userId/goals/:goalId/actions/...`)**

1.  **Test Case: `POST /actions` - Add an action item to a goal.**
    *   **Steps:**
        1.  Choose an existing `userId` and a `goalId` from that user.
        2.  Send a POST request with valid `text` for the action item.
    *   **Expected Result:**
        *   HTTP Status: 201 Created.
        *   Response body contains the updated parent goal and the newly added action item (with `_id`, `text`, `isCompleted: false`).
        *   Database: The action item is added to the `actionItems` array of the specified goal. The parent goal's `updatedAt` timestamp is updated.

2.  **Test Case: `PUT /actions/:actionId` - Update an action item.**
    *   **Steps:**
        1.  Use existing `userId`, `goalId`, and an `actionId` from that goal.
        2.  Send a PUT request to update the `text` and `isCompleted` status.
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body contains the updated parent goal and action item.
        *   Database: The specified action item's properties are updated. The parent goal's `updatedAt` timestamp is updated.

3.  **Test Case: `DELETE /actions/:actionId` - Delete an action item.**
    *   **Steps:** Use existing `userId`, `goalId`, and an `actionId`. Send a DELETE request.
    *   **Expected Result:**
        *   HTTP Status: 200 OK.
        *   Response body indicates success (e.g., message and updated parent goal).
        *   Database: The action item is removed from the goal's `actionItems` array. The parent goal's `updatedAt` timestamp is updated.

4.  **Test Case: Operations on non-existent `userId`, `goalId`, or `actionId`.**
    *   **Steps:**
        1.  Attempt POST, PUT, DELETE with an invalid `userId`.
        2.  Attempt POST, PUT, DELETE with a valid `userId` but an invalid `goalId`.
        3.  Attempt PUT, DELETE with valid `userId` and `goalId` but an invalid `actionId`.
    *   **Expected Result:** HTTP Status: 404 Not Found for all attempts.

**E. Career Dialogue (`POST /api/users/:userId/career-chat`)**

1.  **Test Case: Send a message requiring basic advice.**
    *   **Steps:** Send a POST request with a `userMessage` like "What are some common interview questions?"
    *   **Expected Result:** HTTP Status: 200 OK. `aiResponse` contains relevant advice.

2.  **Test Case: Send a message that should trigger a contextual goal suggestion.**
    *   **Steps:** Send a POST request with `userMessage` like "I want to learn Python for data analysis."
    *   **Expected Result:** HTTP Status: 200 OK. `aiResponse` addresses the query AND includes a phrase like "Considering your interest in Python for data analysis, you might want to add a new career goal..."
    *   *(Refer to test cases documented in Subtask 2.7 for more examples)*

3.  **Test Case: Send a message with chat history.**
    *   **Steps:** Send a POST request with a `userMessage` and a `chatHistory` array containing previous user/model turns.
    *   **Expected Result:** HTTP Status: 200 OK. AI's response shows consideration of the provided history.

4.  **Test Case: Request for non-existent `userId`.**
    *   **Steps:** Send POST request with an invalid `userId`.
    *   **Expected Result:** HTTP Status: 404 Not Found (or as specifically handled by the flow's error management for user fetching).

## II. Frontend UI/UX Testing (Manual Test Cases for `/ai/career-dashboard` and related components)

These tests are performed by interacting with the web application in a browser.

**A. Onboarding Questionnaire Flow (triggered from `/ai/career-planner`)**

1.  **Test Case: New user (or user with `hasCompletedCareerPlannerOnboarding: false`) accesses `/ai/career-planner`.**
    *   **Expected:** `CareerOnboardingModal` automatically appears.
2.  **Test Case: Complete all steps of the questionnaire with valid data.**
    *   **Steps:** Navigate through each step, entering appropriate information. Click "Finish & Save" on the final step.
    *   **Expected:**
        *   Data is submitted to `POST /api/users/:userId/complete-career-onboarding`.
        *   Modal closes.
        *   A success message/toast is shown (if implemented).
        *   The `hasCompletedCareerPlannerOnboarding` flag for the user is now true (subsequent visits to `/ai/career-planner` for this user should not auto-trigger the modal if the main page logic relies on this flag).
        *   Relevant profile fields and `careerGoals` (if initially empty) are updated on the user's profile.
3.  **Test Case: Navigate "Next" and "Previous" through questionnaire steps.**
    *   **Expected:** Correct step content is displayed for each step. Data entered in previous steps persists when navigating back and forth.
4.  **Test Case: Attempt to submit with invalid data in a step (if client-side validation is implemented in step components).**
    *   **Expected:** Validation messages are shown within the step component; navigation to "Next" might be blocked until valid data is entered. *(Note: Current implementation relies on modal-level validation before final `onComplete`)*.

**B. Career Dashboard Display (`/ai/career-dashboard`)**

1.  **Test Case: User with `hasCompletedCareerPlannerOnboarding: false`.**
    *   **Steps:** Navigate to `/ai/career-dashboard`.
    *   **Expected:** Page displays an error/prompt message: "Please complete your career profile and onboarding first..." with a link/button to `/ai/career-planner`.
2.  **Test Case: User with completed onboarding but no `aiCareerPlan` generated yet.**
    *   **Steps:** Navigate to `/ai/career-dashboard`.
    *   **Expected:** Page displays a message like "You haven't generated a career plan yet." with a link/button to `/ai/career-planner`.
3.  **Test Case: User with an existing `aiCareerPlan` and `assessedCareerStage`.**
    *   **Steps:** Navigate to `/ai/career-dashboard`.
    *   **Expected:**
        *   "Current Career Stage" card displays the `assessedCareerStage` and `assessedCareerStageReasoning`.
        *   "Recommended Career Paths" card displays paths from `aiCareerPlan`.
        *   "My Goals & Action Plans" card displays user-defined goals (if any) and AI-suggested goals from `aiCareerPlan` (if logic to merge/display them exists - current implementation focuses on user-defined goals here).
        *   "General Advice" and "Helpful Resources" cards display relevant info from `aiCareerPlan`.
        *   Placeholders for "Progress Tracking" are visible.
4.  **Test Case: User with user-defined `userGoals`.**
    *   **Steps:** Navigate to `/ai/career-dashboard` (ensure user has goals).
    *   **Expected:** User-defined goals are correctly displayed under "Short-Term Goals," "Mid-Term Goals," and "Long-Term Goals" sections, each rendered by a `GoalItem` component.

**C. Interactive Goal Management (Dashboard)**

1.  **Test Case: Add a new short-term, mid-term, and long-term goal.**
    *   **Steps:** Click "Add [Category] Goal" button for each category. Fill out the `GoalFormModal` and submit.
    *   **Expected:** Modal opens with correct category pre-selected. After submission, goal appears in the correct section on the dashboard. API call to `POST /api/users/:userId/goals` is successful.
2.  **Test Case: Edit an existing goal (text, category, target date, completion status).**
    *   **Steps:** Click "Edit Goal" on a `GoalItem`. Modify fields in `GoalFormModal` and submit.
    *   **Expected:** Modal opens pre-filled with goal data. Changes are saved via `PUT /api/users/:userId/goals/:goalId` and reflected on the dashboard.
3.  **Test Case: Delete a goal (with confirmation).**
    *   **Steps:** Click "Delete Goal" on a `GoalItem`. Confirm deletion in the dialog.
    *   **Expected:** Goal is removed from the dashboard. API call to `DELETE /api/users/:userId/goals/:goalId` is successful.

**D. Interactive Action Item Management (within a Goal on Dashboard)**

1.  **Test Case: Add a new action item to a goal.**
    *   **Steps:** Click "Add Action Item" on a `GoalItem`. Fill out the `ActionItemFormModal` and submit.
    *   **Expected:** Modal opens. After submission, action item is displayed under the correct goal. API call to `POST /api/users/:userId/goals/:goalId/actions` is successful. Parent goal's `updatedAt` timestamp is updated.
2.  **Test Case: Edit an existing action item's text.**
    *   **Steps:** Click "Edit" (pencil icon) on an `ActionItemDisplay`. Modify text in `ActionItemFormModal` and submit.
    *   **Expected:** Modal opens with action item text. Changes are saved via `PUT /api/users/:userId/goals/:goalId/actions/:actionId` and reflected. Parent goal's `updatedAt` is updated.
3.  **Test Case: Toggle `isCompleted` for an action item using the checkbox.**
    *   **Steps:** Click the checkbox next to an action item.
    *   **Expected:** Status updates immediately (optimistic update). API call to `PUT /api/users/:userId/goals/:goalId/actions/:actionId` with `isCompleted` status is successful. UI reflects change (e.g., strikethrough). Goal progress bar/summary updates. Parent goal's `updatedAt` is updated.
4.  **Test Case: Delete an action item (with confirmation).**
    *   **Steps:** Click "Delete" (trash icon) on an `ActionItemDisplay`. Confirm deletion.
    *   **Expected:** Action item removed from its goal. API call to `DELETE /api/users/:userId/goals/:goalId/actions/:actionId` is successful. Goal progress bar/summary updates. Parent goal's `updatedAt` is updated.

**E. Progress Display in `GoalItem.tsx`**

1.  **Test Case: Goal with multiple action items, some completed.**
    *   **Steps:** Ensure a goal has several action items. Mark some as complete.
    *   **Expected:**
        *   Progress summary text (e.g., "Progress: 2 / 5 actions completed") is accurate.
        *   `Progress` bar visually reflects the correct completion percentage.
2.  **Test Case: Goal with no action items.**
    *   **Expected:** Progress summary text shows "Progress: No actions defined" (or similar). `Progress` bar might be hidden or show 0%.
3.  **Test Case: Mark a goal as complete (via Edit Goal modal).**
    *   **Steps:** Edit a goal and toggle its main `isCompleted` status.
    *   **Expected:** The `GoalItem` card visually changes (e.g., background, strikethrough on title) to reflect the goal's completion.

**III. Analytics Event Logging Verification**

Verify that console logs (for both frontend and backend) show the correct event names and properties at the specified trigger points.

*   **Frontend (`logAnalyticsEvent`):**
    1.  `view_career_planner_page` (on `/ai/career-planner` load)
    2.  `career_planner_session_start` (on `/ai/career-planner` load)
    3.  `career_planner_session_end` (on `/ai/career-planner` unmount)
    4.  `career_onboarding_modal_triggered` (when onboarding modal is shown on `/ai/career-planner`)
    5.  `career_onboarding_completed` (after successful onboarding submission from modal on `/ai/career-planner`)
    6.  `view_career_dashboard_page` (on `/ai/career-dashboard` load)
    7.  `add_goal_modal_opened` (on `/ai/career-dashboard` when adding a goal)
    8.  `edit_goal_modal_opened` (on `/ai/career-dashboard` when editing a goal)
    9.  `goal_deleted` (on `/ai/career-dashboard` after goal deletion)
    10. `goal_added` / `goal_updated` (on `/ai/career-dashboard` after goal form submission)
    11. `add_action_item_clicked_placeholder` (currently, when "Add Action Item" is clicked in `GoalItem` - will evolve when full UI is built)
        *(More granular action item analytics like `action_item_added`, `action_item_updated`, `action_item_deleted` would be logged from within `GoalItem.tsx` if a `logAnalyticsEvent` call was added there for each specific action.)*

*   **Backend (`logBackendAnalyticsEvent`):**
    1.  `career_planner_onboarding_completed` (in `POST /api/users/:userId/complete-career-onboarding`)
    2.  `career_plan_generated` (in `POST /api/users/:userId/career-plan`)
    3.  `career_plan_suggestion_adopted` (in `POST /api/users/:userId/career-plan/feedback` when `feedbackType` is 'adopted')

This comprehensive list should cover the primary functionalities and edge cases for the Phase 2 features.
