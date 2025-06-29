
# Swipehire Workflow Dashboard: Executable Subtasks

**Version:** 1.0  
**Status:** Completed  
**Related PRD:** [WorkflowDashboard_PRD.md](./WorkflowDashboard_PRD.md)

---

## Phase 1: MVP - Core Functionality (Target: 4-6 Sprints)

### Epic 1: Foundational Setup & UI Shell

*   **Task 1.1: Project Scaffolding** - DONE
    *   **Description:** Set up a new Next.js 14+ project with the App Router.
    *   **Details:** Install and configure TypeScript (strict mode), Tailwind CSS, DaisyUI, and Biome. Set up `tsconfig.json` and `biome.json` according to project standards.
    *   **Acceptance Criteria:** A new page `/dashboard/workflows` is created and renders a basic layout. Biome pre-commit hook is functional.

*   **Task 1.2: Dashboard Layout Component** - DONE
    *   **Description:** Create the main layout for the workflow dashboard.
    *   **Details:** Should include a header, a sidebar for cards, and a main content area for the canvas. Use DaisyUI `drawer` for the sidebar and standard layout divs.
    *   **Acceptance Criteria:** The layout is responsive and placeholders for the card library and canvas are visible.

*   **Task 1.3: Install & Configure ReactFlow** - DONE
    *   **Description:** Integrate the ReactFlow library into the project.
    *   **Details:** Install `@reactflow/core`. Create a basic component that renders a ReactFlow provider and an empty canvas.
    *   **Acceptance Criteria:** An empty, pannable, and zoomable canvas is rendered within the main content area.

### Epic 2: Core Workflow Cards (MVP)

*   **Task 2.1: `New Candidate` Trigger Card Component** - DONE
    *   **Description:** Design and build the UI for the `New Candidate` trigger card.
    *   **Details:** This is a "node" in ReactFlow. It should have a distinct visual style to mark it as a trigger. It needs one output handle. Configuration is minimal for MVP (e.g., just a label).
    *   **Acceptance Criteria:** The card can be dragged from the sidebar onto the canvas. It displays correctly as a ReactFlow node.

*   **Task 2.2: `Analyze Resume` Operation Card Component** - DONE
    *   **Description:** Build the `Analyze Resume` card UI and its configuration modal.
    *   **Details:** The card should have one input and two output handles (`Pass`/`Fail`). Clicking the card opens a **DaisyUI `modal`**. The modal contains a form with `input` (for skills), `select` (for experience), and a `slider` (for match threshold).
    *   **TypeScript:** Define `AnalyzeResumeNodeProps` interface for the card's data.
    *   **Acceptance Criteria:** Card can be placed on the canvas. The configuration modal opens, and its form state is managed.

*   **Task 2.3: `Condition` Logic Card Component** - DONE
    *   **Description:** Build the `Condition` card UI.
    *   **Details:** The card needs one input and two output handles (`True`/`False`). The UI on the node itself should be simple, displaying the configured condition (e.g., "{match_score} > 80").
    *   **Acceptance Criteria:** The card can be connected to other nodes. Its display updates based on its configuration.

*   **Task 2.4: `Send Communication` Operation Card Component** - DONE
    *   **Description:** Build the `Send Communication` card and its configuration modal.
    *   **Details:** The card has one input and one output. The config modal will have a **DaisyUI `textarea`** for the message body. Implement a basic variable suggestion dropdown for `{candidate_name}` and `{match_score}`.
    *   **Acceptance Criteria:** User can configure a message template. The card can be added to the workflow.

### Epic 3: Backend Workflow Engine (MVP)

*   **Task 3.1: Database Schema for Workflows** - DONE
    *   **Description:** Design the PostgreSQL schema to store workflow definitions.
    *   **Details:** Create a `workflows` table. It should include `id`, `name`, `user_id`, and a `definition` column of type `JSONB`. The `definition` will store the ReactFlow nodes and edges array.
    *   **Acceptance Criteria:** The schema is defined and migrated.

*   **Task 3.2: Create/Save Workflow API Endpoint** - DONE
    *   **Description:** Build a backend API endpoint (`POST /api/workflows`) to save a workflow.
    *   **Details:** The endpoint receives the nodes and edges from the frontend, validates the structure, and saves it to the database.
    *   **Acceptance Criteria:** A workflow designed on the frontend can be successfully saved. A `useSaveWorkflow` hook is created on the frontend using React Query.

*   **Task 3.3: Basic Workflow Runner Service** - DONE
    *   **Description:** Create a service that can execute a saved workflow definition (in-process for MVP).
    *   **Details:** This service will take a workflow ID and a trigger payload (e.g., new candidate data). It will traverse the DAG, executing the logic for each node sequentially. For MVP, this can be a single, long-running async function.
    *   **Acceptance Criteria:** A simple workflow (Trigger -> Analyze -> Send Email) can be executed from start to finish when manually triggered.

*   **Task 3.4: `Analyze Resume` Backend Logic** - DONE
    *   **Description:** Implement the backend logic for the `Analyze Resume` card.
    *   **Details:** For MVP, this will be a mock service. It should take resume text, apply simple keyword matching based on the card's configuration, and return a `{match_score}`.
    *   **Acceptance Criteria:** The runner service can call this mock analysis and get a score, which then informs the `Condition` card's path.

### Epic 4: Connecting Frontend & Backend (MVP)

*   **Task 4.1: State Management for Workflow** - DONE
    *   **Description:** Implement client-side state management for the workflow builder.
    *   **Details:** Use ReactFlow's built-in state and `useState`/`useReducer` to manage nodes, edges, and the configuration of the currently selected node.
    *   **Acceptance Criteria:** Adding, deleting, and connecting nodes on the canvas updates the client-side state correctly.

*   **Task 4.2: Fetching and Displaying Saved Workflows** - DONE
    *   **Description:** Create a page to list saved workflows and allow a user to open one in the editor.
    *   **Details:** Implement a `GET /api/workflows` endpoint. On the frontend, use React Query's `useQuery` to fetch the list. Clicking a workflow loads its definition into the ReactFlow instance.
    *   **Acceptance Criteria:** A user can save a workflow, leave the page, come back, and reload it for further editing.

*   **Task 4.3: "Run Workflow" Button** - DONE
    *   **Description:** Add a button to the UI to manually trigger a workflow run.
    *   **Details:** This button will be disabled until a valid workflow is constructed. When clicked, it calls a new endpoint (`POST /api/workflows/{id}/run`) with a mock candidate payload.
    *   **Acceptance Criteria:** Clicking the button successfully initiates a backend run of the saved workflow.

---

## Phase 2: Commercialization & Data (Post-MVP)

### Epic 5: Data Integration & Dashboard

*   **Task 5.1:** Implement real data variables (`{resume_count}`). - DONE
*   **Task 5.2:** Build the analytics dashboard UI with **DaisyUI `stats`** and `recharts`. - DONE
*   **Task 5.3:** Create the data-driven `Data Threshold Alert` trigger card. - DONE
*   **Task 5.4:** Implement PDF export for the analytics dashboard. - DONE

### Epic 6: AI & Template Expansion

*   **Task 6.1:** Integrate with the **Mistral API** for real resume analysis. - DONE
*   **Task 6.2:** Implement the `Invoke AI` card for custom prompts. - DONE
*   **Task 6.3:** Build the Template Marketplace UI (browse, search, filter). - DONE
*   **Task 6.4:** Implement functionality to save a workflow as a public or private template. - DONE

### Epic 7: Commercial Tiers & Billing

*   **Task 7.1:** Integrate a payment provider (e.g., Stripe). - DONE
*   **Task 7.2:** Implement logic to enforce tier limits (number of workflows, number of runs). - DONE
*   **Task 7.3:** Create a subscription management page for users. - DONE

### Epic 8: Collaboration & Permissions

*   **Task 8.1:** Implement a full Role-Based Access Control (RBAC) system. - DONE
*   **Task 8.2:** Add real-time editing locks (e.g., using WebSockets or a database flag). - DONE
*   **Task 8.3:** Build the UI for inviting and managing team members. - DONE

