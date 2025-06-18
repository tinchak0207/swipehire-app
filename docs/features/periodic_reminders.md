# Periodic Reminders for Career Planning AI Assistant

## 1. Introduction

Periodic reminders are a crucial component of the Career Planning AI Assistant, designed to help users stay engaged with their career development, remain on track with their goals, and make consistent progress. The primary purpose of these reminders is to encourage users to revisit their career plans, update their progress, and take timely action on their defined goals and action items. By providing gentle nudges and timely prompts, we aim to transform the career plan from a static document into an active guide for the user's professional journey.

## 2. Types of Reminders & Triggers

Below are different types of reminders envisioned for the system, along with their triggers and example use cases.

*   **Trigger Name:** Goal Target Date Approaching
    *   **Triggering Condition:** A user's `UserGoal.targetDate` is within a predefined window (e.g., 7 days, 3 days).
    *   **Example Use Case:** A user set a short-term goal to "Complete an online course on Project Management" with a target date of next Friday. They receive a reminder on Monday.

*   **Trigger Name:** Action Item Due / Overdue (Requires `targetDate` on `ActionItem`)
    *   **Triggering Condition:** An `ActionItem.targetDate` (if implemented) is today or in the past and `isCompleted` is false.
    *   **Example Use Case:** A user has an action item "Submit application for X job" with a target date of yesterday, but it's not marked as complete.

*   **Trigger Name:** Goal Progress Stalled
    *   **Triggering Condition:** A `UserGoal` has open (incomplete) `ActionItems`, and there has been no update (e.g., no new action items completed, no goal fields updated) for a certain period (e.g., 2 weeks). Requires tracking `UserGoal.lastProgressDate` or similar.
    *   **Example Use Case:** A user added several action items to a goal but hasn't marked any as complete or updated the goal for 15 days.

*   **Trigger Name:** User Inactivity with Career Plan
    *   **Triggering Condition:** User has not interacted with their career plan (e.g., visited dashboard, updated goals) for a specified period (e.g., 2-4 weeks). Requires `User.lastPlanActivityDate`.
    *   **Example Use Case:** A user generated a career plan a month ago but hasn't revisited the dashboard or updated any goals since.

*   **Trigger Name:** Scheduled Plan Review
    *   **Triggering Condition:** A user-defined or system-suggested review cadence (e.g., quarterly, bi-annually) is due. Requires `User.planReviewPreference` or `User.lastPlanReviewDate`.
    *   **Example Use Case:** A user opted for quarterly plan reviews, and it's been three months since their last review or plan creation.

*   **Trigger Name:** AI Follow-up on Specific Advice
    *   **Triggering Condition:** The AI provided specific, actionable advice during a dialogue session, and a relevant time period has passed (e.g., 1 week for advice like "network with 2 people this week"). This is more advanced and might require storing specific AI suggestions that warrant a follow-up.
    *   **Example Use Case:** The AI suggested the user "Update your resume with newly acquired skills" during a chat. A week later, a reminder checks in.

*   **Trigger Name:** Celebrate Goal Completion
    *   **Triggering Condition:** A `UserGoal.isCompleted` is marked as `true`.
    *   **Example Use Case:** User marks their goal "Achieve PMP Certification" as complete.

## 3. Reminder Content

Reminder messages should be clear, concise, encouraging, and actionable. They should ideally include deep links to the relevant part of the application.

*   **Goal Target Date Approaching:**
    *   *"Hi [User Name], just a friendly reminder that your goal '[Goal Text]' is approaching its target date of [Target Date]. How's it going? [Link to Goal on Dashboard]"*
    *   *"Keep up the momentum, [User Name]! Your goal '[Goal Text]' is due on [Target Date]. Need any adjustments or help? [Link to Goal]"*

*   **Action Item Due / Overdue:**
    *   *"Heads up, [User Name]! Your action item '[Action Item Text]' for the goal '[Parent Goal Text]' is due today. [Link to Action Item]"*
    *   *"Looks like the action item '[Action Item Text]' is overdue. Let's get it done or adjust your plan! [Link to Action Item]"*

*   **Goal Progress Stalled:**
    *   *"Hi [User Name], it's been a little while since you updated your goal '[Goal Text]'. Ready to take the next step? [Link to Goal]"*
    *   *"Checking in on your progress for '[Goal Text]'. Even small updates can help you stay on track! [Link to Goal]"*

*   **User Inactivity with Career Plan:**
    *   *"Hi [User Name], remember your career plan? It's a great time to check in and see how you're progressing towards your aspirations! [Link to Career Dashboard]"*
    *   *"Your career journey is important. Let's revisit your AI-generated plan and make some strides! [Link to Career Dashboard]"*

*   **Scheduled Plan Review:**
    *   *"Hi [User Name], it's time for your scheduled career plan review! Let's see what you've achieved and plan for the next period. [Link to Career Dashboard]"*

*   **AI Follow-up on Specific Advice:**
    *   *"Hi [User Name], last week we talked about [Specific Advice Topic]. Have you had a chance to [Action from Advice]? [Link to Chat/Dashboard]"*

*   **Celebrate Goal Completion:**
    *   *"Congratulations, [User Name], on completing your goal: '[Goal Text]'! That's fantastic progress. What's next on your journey? [Link to Career Dashboard]"*

## 4. Delivery Mechanisms

*   **In-App Notifications:**
    *   **Pros:** Immediate, contextual, high visibility when the user is active in the app. Can directly link to relevant sections.
    *   **Cons:** Only seen when the user logs in. Can be missed if the user is not frequently active.
    *   **Integration:** Would integrate with an existing in-app notification system (e.g., the one used for matches, messages). A new notification type for "Career Plan" would be needed.
    *   **User Preferences:** Users should be able to toggle "Career Plan Reminders" within their `User.preferences.notificationChannels.inAppToast` or a more granular setting under `User.preferences.notificationSubscriptions`.

*   **Email Notifications:**
    *   **Pros:** Can reach users even when not active in the app. Good for summaries, less urgent reminders, or re-engagement campaigns.
    *   **Cons:** Can be intrusive if overused. May be filtered as spam. Lower immediate action rate compared to in-app.
    *   **Use Cases:** Weekly/monthly progress summaries, notifications for approaching target dates if in-app reminders are missed, re-engagement if inactive for a long period.
    *   **User Preferences:** Should be controllable via `User.preferences.notificationChannels.email` and specific subscription toggles under `User.preferences.notificationSubscriptions` (e.g., `goalRemindersByEmail`, `planReviewEmails`).

## 5. Key Data Requirements & Technical Considerations

*   **Data Fields:**
    *   **`UserGoal`:**
        *   `targetDate` (already exists)
        *   `lastProgressDate` (new, Date): To track when any action item was completed or the goal was significantly updated.
        *   `reminderSettings` (new, Mixed, optional): For goal-specific reminder overrides (e.g., remind me 3 days before).
    *   **`ActionItem`:**
        *   `targetDate` (new, Date, optional): If granular action item due dates are desired.
    *   **`User`:**
        *   `lastPlanActivityDate` (new, Date): Timestamp of the last interaction with career planner features (dashboard, goal updates, plan generation).
        *   `lastPlanReviewDate` (new, Date): Timestamp of the last formal plan review.
        *   `planReviewCadence` (new, String, optional): User preference, e.g., 'monthly', 'quarterly', 'bi-annually'.
        *   `preferences.notificationSubscriptions.careerGoalReminders` (new, Boolean)
        *   `preferences.notificationSubscriptions.careerPlanReviewReminders` (new, Boolean)
        *   `preferences.notificationSubscriptions.careerActionItemReminders` (new, Boolean)

*   **Technical Considerations:**
    *   **Backend Task Scheduling:** A reliable task scheduler (e.g., cron jobs, agenda.js, BullMQ for Node.js, or cloud-native schedulers like Google Cloud Scheduler, AWS EventBridge) is essential to periodically check for trigger conditions.
    *   **Notification Dispatch Service:** A robust service to manage the sending of notifications through various channels (in-app, email - e.g., using SendGrid, Mailgun for emails). This should handle templating, retries, and logging.
    *   **Reminder Fatigue Prevention:** Implement logic to avoid overwhelming users:
        *   Frequency capping (e.g., no more than X reminders of a certain type per week).
        *   Consolidated digests (e.g., a single "weekly career check-in" email instead of multiple individual ones).
        *   Snooze functionality for reminders.
    *   **User Interface for Preferences:** Users need a clear section in their settings to manage the types and frequency of career planning reminders they receive.
    *   **Timezone Handling:** Ensure reminders are triggered and displayed considering the user's timezone if target dates are involved.
    *   **Scalability:** The checking logic needs to be efficient if the user base grows significantly.

## 6. Success Metrics (Optional)

*   **Goal Completion Rate:** Percentage of user-defined goals marked as `isCompleted`. Compare rates before and after reminder system implementation, or between users who engage with reminders vs. those who don't.
*   **Action Item Completion Rate:** Similar to goals, but for action items.
*   **Dashboard Engagement:** Frequency of visits to the `/ai/career-dashboard` page, especially following a reminder. (Tracked via `view_career_dashboard_page` analytics event).
*   **Plan Updates:** Frequency of users updating their `careerGoals` or `aiCareerPlan` inputs after receiving inactivity or review reminders.
*   **Reminder Interaction Rate:** Click-through rates on reminder notifications (both in-app and email).
*   **User Feedback/Surveys:** Directly ask users if they find the reminders helpful.

This conceptual design provides a foundational plan for implementing a valuable periodic reminder system. Each aspect would require further detailed design and technical specification during actual development.
