
# Swipehire Workflow Dashboard: Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Completed  
**Author:** qodo  
**Date:** 2024-07-01

---

## 1. Introduction & Core Vision

### 1.1. The Idea

Recruitment today is often a fragmented process, with tools for sourcing, applicant tracking, and analytics operating in silos. This creates inefficiencies, manual data entry, and a lack of a holistic view of the hiring pipeline. 

Inspired by the visual, intuitive nature of low-code platforms like n8n and Zapier, the **Swipehire Workflow Dashboard** aims to revolutionize the recruitment process. We will create a low-code, drag-and-drop interface that empowers HR professionals to design, automate, and monitor their entire hiring workflow. By connecting modular "cards" on a visual canvas, users can build custom pipelines that integrate resume management, job posting, candidate analysis, and communication into a single, seamless system.

### 1.2. Core Goals

*   **Boost Recruiting Efficiency:** Automate repetitive tasks (e.g., screening, sending emails, updating statuses) to reduce manual effort by an estimated 40%.
*   **Enhance Process Flexibility:** Provide a fully customizable workflow builder that allows companies to tailor hiring processes to their unique needs, roles, and company culture.
*   **Enable Data-Driven Decisions:** Integrate key performance indicators (KPIs) and data variables directly into the workflow, allowing for real-time analytics and process optimization.
*   **Lower the Technical Barrier:** Employ a "Scratch-like" visual programming paradigm, making sophisticated automation accessible to all HR professionals, regardless of their technical expertise.

---

## 2. Functional Architecture & Core Modules

### 2.1. The Workflow Engine: Foundation

The engine is the heart of the dashboard, enabling the creation, execution, and monitoring of workflows.

#### 2.1.1. Card Component System (The Building Blocks)

Workflows are constructed from a library of modular cards. Each card represents a specific action, trigger, or piece of logic.

*   **Trigger Cards (Initiate a workflow):**
    *   `New Candidate`: Fires when a new resume is received for a specific job.
    *   `Job Status Change`: Fires when a job is opened, paused, or closed.
    *   `Data Threshold Alert`: Fires when a data variable crosses a set threshold (e.g., `company_reach` drops by 20%).
    *   `Scheduled Trigger`: Fires at a specific time/date (e.g., every Monday at 9 AM).

*   **Operation Cards (Perform an action):**
    *   `Analyze Resume`: Parses a resume (text or video), extracts key info, and scores it.
    *   `Send Communication`: Sends an email, SMS, or platform message using a template.
    *   `Update Candidate Status`: Changes a candidate's stage in the pipeline (e.g., "Screening" -> "Interview").
    *   `Invoke AI`: Calls an external AI model (e.g., Mistral) with a dynamic prompt for tasks like generating interview questions.
    *   `Add to Talent Pool`: Tags and adds a candidate to a specific talent database.

*   **Logic Cards (Control the flow):**
    *   `Condition (If/Else)`: Creates branches in the workflow based on logical conditions (e.g., `IF {match_score} > 80`). Supports AND/OR combinations.
    *   `Delay`: Pauses the workflow for a specified duration.
    *   `Loop`: (Future consideration) Iterate over a list of items.

*   **Data Cards (Provide dynamic information):**
    *   `Company Stats`: Provides access to variables like `{company_reach}`.
    *   `Resume Stats`: Provides access to `{resume_count}`.

#### 2.1.2. Visual Editor

The editor is the canvas where users build their workflows.

*   **UI/UX:** A drag-and-drop interface based on **ReactFlow**.
*   **Interaction:** Users drag cards from a sidebar onto the canvas and connect them by dragging from output handles to input handles.
*   **Configuration:** Clicking a card opens a modal or sidebar to configure its specific parameters (e.g., setting the match score threshold on an `Analyze Resume` card).
*   **Variable System:** Users can reference variables from previous cards using `{variable_name}` syntax within card configurations. An autocomplete feature should assist in finding available variables.

#### 2.1.3. Execution & Monitoring

*   **Engine Logic:** The backend will represent the workflow as a Directed Acyclic Graph (DAG) and execute the nodes in order.
*   **Real-time Monitoring:** The UI will visually indicate the status of a running workflow (e.g., highlighting the currently executing card, showing success/error states).
*   **History & Logs:** A detailed log of each workflow execution will be available for debugging, including timestamps, card inputs/outputs, and any errors.
*   **Error Handling:** Robust error handling and retry mechanisms (e.g., retry a failed API call up to 3 times with exponential backoff).

### 2.2. Resume Analysis Core Process

This is a critical operation card that showcases the power of the platform.

*   **Input:** Accepts PDF, DOCX, and video file formats.
*   **Processing:**
    *   **Text Resumes:** Use OCR (if needed) to extract text. Use a fine-tuned **Mistral NLP model** to parse, categorize, and extract entities (skills, experience, education).
    *   **Video Resumes:** Use a speech-to-text service to get a transcript. Analyze the transcript for keywords and the audio for sentiment/confidence scoring.
*   **Configuration:**
    *   `Education Level`: Dropdown (e.g., Bachelor's, Master's).
    *   `Years of Experience`: Number input.
    *   `Required Skills`: Tag input field.
    *   `Enable AI Video Analysis`: Checkbox.
    *   `Match Score Threshold`: A slider (0-100%).
*   **Output:**
    *   Categorization: `Passed`, `For Review`, `Rejected`.
    *   Variables for subsequent cards: `{match_score}`, `{extracted_skills}`, `{education_level}`, `{video_confidence}`.

### 2.3. Data Variables & Visualization

Data is a first-class citizen in the workflow.

*   **Core Metrics:**
    *   `{company_reach}`: Unique users who viewed a job posting in the last 30 days.
    *   `{resume_count}`: Number of valid applications received.
    *   `{match_score}`: AI-generated score for candidate-job fit.
*   **Data-Driven Workflows:**
    *   Use data in `Condition` cards (e.g., `IF {company_reach} < 500`).
    *   Use AI to recommend workflow template changes based on performance data.
*   **Dashboard Visualization:**
    *   A dedicated analytics dashboard will present these metrics.
    *   **DaisyUI Component:** Use `stats` component to show key metrics.
    *   **Charts:** Use a library like `recharts` to display bar charts comparing company data to industry benchmarks.
    *   **Alerts:** Use the **DaisyUI `alert` component** with a red color (`alert-error`) to display urgent warnings (e.g., "Job reach has dropped 30% this week!").
    *   **Reporting:** Allow exporting the dashboard view as a PDF.

### 2.4. Template Ecosystem & Collaboration

*   **Template System:**
    *   **Official Templates:** Curated, high-performance workflows designed by industry experts.
    *   **Community Templates:** User-submitted templates that can be shared, reviewed, and rated.
    *   **Categorization:** Templates will be filterable by industry, role, and complexity.
*   **Collaboration:**
    *   **Editing Lock:** Prevent simultaneous edits to the same workflow.
    *   **Role-Based Access Control (RBAC):**
        *   `Admin`: Can create, edit, delete all workflows and manage users.
        *   `HR Manager`: Can create/edit workflows for their assigned departments.
        *   `Hiring Manager`: View-only access to relevant workflows and candidate progress.

---

## 3. Key Function & UI/UX Design

### 3.1. Card Configuration Interaction

*   **Analyze Resume Card:**
    *   **DaisyUI Components:** Use `form-control`, `input`, `checkbox`, `select`, and `slider` for the configuration modal.
    *   **Layout:**
        ```plaintext
        ┌──────────────────────────────┐
        │        Analyze Resume        │
        ├──────────────────────────────┤
        │ ▢ Education: [Select: Bachelor's] │
        │ ▢ Experience (yrs): [Input: 3] │
        │ ▢ Skills: [Tag Input: Python, SQL] │
        │ ▢ Enable Video AI [Checkbox: checked] │
        │ ▢ Match Threshold: [Slider: 70%]  │
        └──────────────────────────────┘
        ```

*   **Condition Card:**
    *   **UI:** A simple, sentence-like builder.
    *   **Layout:**
        ```plaintext
        ┌──────────────────────────────────┐
        │   Condition: If...               │
        ├──────────────────────────────────┤
        │   [Select Variable: {match_score}] │
        │   [Select Operator: >]           │
        │   [Input Value: 80]              │
        └──────────────────────────────────┘
        ```

### 3.2. Variable System Design

*   **Global Variables:** `{company_reach}`, `{current_date}`
*   **Workflow-Specific (from cards):**
    *   `{match_score}`: Number (0-100)
    *   `{candidate_name}`: String
    *   `{candidate_email}`: String
    *   `{extracted_skills}`: Array<string>
    *   `{video_confidence}`: Number (0-100)
    *   `{ai_suggestion}`: String

### 3.3. AI & Template Integration

*   **Dynamic Templates:** Communication templates should be able to inject variables.
    ```
    Subject: Your application for {position_name} at Swipehire

    Hi {candidate_name},

    Thank you for your interest. Your profile is a strong match for this role, with a score of {match_score}.
    Based on our AI analysis, we'd love to discuss your experience with {ai_suggestion}.
    ```
*   **AI Prompt Example:**
    ```
    You are a senior engineering manager hiring for a {position_name} role. The candidate's key skills are {extracted_skills}.
    Generate three insightful, open-ended interview questions that probe their expertise in {most_critical_skill}.
    ```

---

## 4. Technical Requirements & Implementation

### 4.1. Frontend (Next.js)

*   **Framework:** Next.js 14+ with App Router.
*   **Language:** TypeScript (strict mode enabled).
*   **Styling:** Tailwind CSS with DaisyUI component library.
*   **State Management:** React Hooks (`useState`, `useContext`, `useReducer`). For complex client-side state, consider `zustand`.
*   **Drag-and-Drop Engine:** **ReactFlow** is mandatory for the workflow canvas. It provides nodes, edges, and a viewport that are easily customizable.
*   **Data Fetching:** Use React Query (`@tanstack/react-query`) for server state management, caching, and optimistic updates.
*   **Linting/Formatting:** **Biome** configured as a pre-commit hook.
*   **Accessibility:** Ensure all components are keyboard-navigable and screen-reader friendly (use `aria` attributes). Use `jest-axe` for automated a11y testing.
*   **Responsive Design:** The workflow view should be readable on mobile, with interactions adapted for touch (e.g., tap to select, tap to connect). The editor itself may be limited to tablet/desktop.

### 4.2. Backend

*   **Language:** Node.js with TypeScript or Go (for performance).
*   **Framework:** NestJS (if Node.js) for a structured, modular architecture.
*   **Workflow Engine:**
    *   Represent workflows as a **DAG** stored in a database (e.g., PostgreSQL with JSONB for the graph structure).
    *   Use a message queue (e.g., RabbitMQ, BullMQ) to manage the execution of workflow steps asynchronously. This ensures scalability and resilience.
*   **AI Integration:** Create a dedicated service to manage interactions with the **Mistral API**.
*   **Database:** PostgreSQL for relational data (users, jobs) and workflow definitions. Redis for caching and session management.

### 4.3. Data & Security

*   **Encryption:** All sensitive data at rest must be encrypted using AES-256. All data in transit must use TLS 1.2+.
*   **Permissions:** Implement robust Role-Based Access Control (RBAC) at the API gateway and database levels.
*   **Compliance:** Design with GDPR in mind, providing a clear process for data access and deletion requests.

---

## 5. Go-to-Market & Success Metrics

### 5.1. MVP Scope

*   **Core Cards:** `New Candidate` (Trigger), `Analyze Resume`, `Condition`, `Send Communication`.
*   **Basic Variables:** `{match_score}`, `{candidate_name}`, `{candidate_email}`, `{extracted_skills}`.
*   **Templates:** 3-5 official templates for common roles (e.g., Software Engineer, Sales Rep).
*   **Dashboard:** Basic display of `{resume_count}`.
*   **Functionality:** Users can create, save, and manually run one workflow at a time.

### 5.2. Key Metrics for Validation

*   **Activation Rate:** % of new users who successfully build and run a workflow within their first 7 days.
*   **Time-to-Value:** Average time it takes a user to configure their first workflow. (Target: < 15 minutes).
*   **Template Adoption:** % of workflows created from a template vs. from scratch.
*   **Efficiency Gain (Qualitative):** User surveys and interviews to measure perceived time savings.
*   **User Satisfaction (CSAT/NPS):** Regular surveys to gauge satisfaction with the visual editor.

### 5.3. Risks & Mitigation

*   **Technical Risk:** Workflow engine stability and scalability.
    *   **Mitigation:** Start with a simple, in-process engine for the MVP. Build a robust, queue-based system post-launch based on usage patterns.
*   **Adoption Risk:** Users may find the concept of workflows unfamiliar or complex.
    *   **Mitigation:** Invest heavily in high-quality onboarding, interactive tutorials, and a rich template library to guide users.
*   **Usability Risk:** A poorly designed canvas can be more frustrating than helpful.
    *   **Mitigation:** Conduct extensive user testing on the drag-and-drop interface. Prioritize intuitive defaults and clear visual feedback.

---

## 6. Commercialization

*   **Free Tier:** 3 active workflows, 50 workflow runs/month, basic templates.
*   **Pro Tier:** 20 active workflows, 1,500 runs/month, access to premium industry templates, advanced AI cards.
*   **Enterprise Tier:** Unlimited workflows, custom run limits, private template repository, SSO, dedicated support, option for private model training.
