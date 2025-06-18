# Visualized Reports for Career Planning AI Assistant

## 1. Introduction

Visualized reports for the Career Planning AI Assistant aim to provide users with clear, insightful, and motivating overviews of their career development progress. By transforming raw data about goals, action items, and engagement into easily digestible charts and summaries, these reports will empower users to:
*   Track their achievements and identify areas for improvement.
*   Gain a better understanding of their progress over time.
*   Stay motivated by seeing tangible evidence of their efforts.
*   Make more informed decisions about their career path and future goals.

## 2. Key Metrics & Data to Visualize

The following data points and metrics are proposed for visualization:

*   **Goal Achievement:**
    *   **Overall Goal Completion Rate (%):** `(Total Completed Goals / Total Goals) * 100`.
    *   **Goal Completion Rate by Category (%):** Completion rate calculated separately for 'short-term', 'mid-term', and 'long-term' goals.
    *   **Active vs. Completed Goals:** A count of goals currently in progress versus those marked as completed.
    *   **Goals Completed Over Time:** Number of goals marked as completed, aggregated by month or quarter.
    *   **Average Time to Complete Goals:** Average duration taken to complete goals (by category if meaningful).

*   **Action Item Progress:**
    *   **Overall Action Item Completion Rate (%):** `(Total Completed Action Items / Total Action Items across all goals) * 100`.
    *   **Action Items per Goal:** Average number of action items defined per goal.
    *   **Completion Rate of Action Items within Goals:** For goals with action items, the percentage of completed action items.

*   **Skills Development (Conceptual - requires future skill tracking implementation):**
    *   **Targeted Skills:** Skills explicitly mentioned in goal text or action items.
    *   **Acquired Skills:** Skills linked to completed goals or action items (e.g., if a goal was "Learn Python," then Python becomes an "acquired" skill upon completion).
    *   **Skill Set Evolution:** Visual representation of `user.profileSkills` and how it might be expanding based on skills targeted/acquired through goals.

*   **Engagement & Activity:**
    *   **Goal/Action Item Update Frequency:** Number of times goals or action items are created, updated, or marked complete per week/month.
    *   **Dashboard Visit Frequency:** (If analytics are available) How often the user visits the `/ai/career-dashboard`.
    *   **Plan Update Frequency:** How often the user updates their main career plan inputs via `/ai/career-planner`.

*   **Career Stage Trajectory (Conceptual - requires periodic re-assessment and logging of `assessedCareerStage`):**
    *   **Stage Progression:** Visualization of changes in `user.assessedCareerStage` over time (e.g., quarterly or after significant goal achievements).

## 3. Proposed Report Types & Visualizations

*   **Overall Goal Completion Rate (%):**
    *   **Visualization:** Large Percentage Number with a Circular Progress Bar (or Gauge Chart).
    *   **Why:** Provides an immediate, high-level overview of overall progress.

*   **Goal Completion Rate by Category (%):**
    *   **Visualization:** Donut Chart or Grouped Bar Chart (one bar per category showing completed % vs. total %).
    *   **Why:** Allows users to see which types of goals (short, mid, long-term) they are most successful with or where they might be struggling.

*   **Active vs. Completed Goals:**
    *   **Visualization:** Simple Bar Chart (two bars) or Stacked Bar Chart (showing total, segmented by active/completed).
    *   **Why:** Clear comparison of ongoing efforts vs. achievements.

*   **Goals Completed Over Time:**
    *   **Visualization:** Line Chart (X-axis: Time (Month/Quarter), Y-axis: Number of Goals Completed).
    *   **Why:** Shows trends in productivity and goal achievement over a period.

*   **Overall Action Item Completion Rate (%):**
    *   **Visualization:** Large Percentage Number with a Circular Progress Bar.
    *   **Why:** Similar to overall goal completion, gives a quick sense of task execution.

*   **Action Items per Goal & Completion Rate (Average):**
    *   **Visualization:** Could be text callouts (e.g., "Avg. 3 actions per goal") or a combined chart if more detail is needed, perhaps a Scatter Plot (X-axis: number of actions, Y-axis: completion rate for that goal), though this might be too complex. A simple Bar Chart showing avg. completed vs. avg. total actions per goal might be better.
    *   **Why:** Helps understand if users are creating manageable goals with appropriate numbers of action items.

*   **Current Skills Overview (Conceptual):**
    *   **Visualization:** Radar Chart (if skills have proficiency levels that can be mapped) or a Tag Cloud (weighted by frequency or self-assessed importance).
    *   **Why:** Provides a holistic view of the user's current skill landscape.

*   **Engagement Metrics (e.g., Goal Update Frequency):**
    *   **Visualization:** Activity Heatmap (calendar-style) or a simple Bar Chart showing activity counts per week/month.
    *   **Why:** Visualizes consistency and patterns of engagement.

*   **Career Stage Trajectory (Conceptual):**
    *   **Visualization:** Stepped Line Chart or Timeline display.
    *   **Why:** Clearly shows progression through different career stages over time.

## 4. Data Sources

The primary data for these reports will come from the `User` model and its subdocuments:

*   **`User.userGoals` array:**
    *   `goal.text`, `goal.category`, `goal.targetDate`, `goal.isCompleted`, `goal.createdAt`, `goal.updatedAt`
*   **`User.userGoals.actionItems` array (within each goal):**
    *   `actionItem.text`, `actionItem.isCompleted`
*   **`User.profileSkills`:** For current skills overview.
*   **`User.assessedCareerStage` (and historical logs if implemented):** For career stage trajectory.
*   **`User.aiCareerPlan.suggestedPaths`:** (Potentially to correlate with user-defined goals).
*   **Analytics Events (if captured and processed):**
    *   `view_career_dashboard_page`
    *   `career_plan_generated`
    *   `goal_added`, `goal_updated`, `goal_deleted`
    *   `action_item_added`, `action_item_updated`, `action_item_deleted` (if these granular events are added)

## 5. User Interface & Presentation

*   **Location:** A new dedicated "Reports" or "My Progress" tab within the Career Dashboard (`/ai/career-dashboard`).
*   **Layout:** Use a responsive grid layout to display multiple charts and metric callouts on a single page.
*   **Filtering:**
    *   Allow users to filter reports by date range (e.g., Last 30 days, Last 3 months, Year-to-date, Custom Range).
    *   Potentially filter goal-related reports by `category` (short-term, mid-term, long-term).
*   **Clarity:**
    *   Each chart/visualization should have a clear title and labels.
    *   Provide brief explanations or tooltips for how metrics are calculated if not immediately obvious.
    *   Use colors and visual cues effectively to highlight key information without overwhelming the user.
    *   Ensure reports are accessible and understandable.

## 6. Technical Considerations

*   **Data Aggregation:**
    *   Some metrics (e.g., completion rates over time, averages) will require backend aggregation logic. This could be done via Mongoose aggregation pipelines or dedicated API endpoints.
    *   For simpler metrics, frontend calculation might be feasible if the dataset per user (number of goals/actions) is not excessively large.
*   **Charting Library:**
    *   A robust frontend charting library will be needed. Options include:
        *   **Chart.js:** Popular, versatile, good documentation.
        *   **Recharts:** Composable charting library built with React.
        *   **Nivo:** Rich set of React components for dataviz, built on D3.
    *   The choice will depend on ease of use, customization options, performance, and bundle size.
*   **Performance:**
    *   For users with a large number of goals and action items, generating reports could become slow if queries are not optimized.
    *   Consider database indexing on frequently queried fields (e.g., `userId`, `userGoals.category`, `userGoals.isCompleted`, timestamps).
    *   Backend pagination or pre-aggregation might be necessary for historical data views (e.g., "goals completed per month over the last year").
*   **Data Snapshots (for Trajectory):** For metrics like "Career Stage Trajectory," a system for periodically snapshotting or logging changes to `assessedCareerStage` would be needed, as the `User` model typically only stores the current value.

This conceptual design document provides a roadmap for developing a valuable visualized reports feature, enhancing the user's ability to track and understand their career progression.
