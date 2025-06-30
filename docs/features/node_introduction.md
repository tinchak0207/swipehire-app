Swipehire Workflow Dashboard Card System Overview
I. Card Classification Framework
The Swipehire Workflow Dashboard employs a structured card system categorized by functional roles and workflow logic, enabling users to build customized recruitment processes through visual drag-and-drop operations. The card system is divided into 7 primary categories with distinct capabilities:

plaintext
┌────────────┬──────────┬─────────────────────────────────┐
│ Category     │ # of Cards │ Core Functionality              │
├────────────┼──────────┼─────────────────────────────────┤
│ Trigger Cards    │ 5        │ Initiate workflows via events/data changes │
│ Action Cards     │ 12       │ Execute operational tasks             │
│ Decision Cards   │ 3        │ Control workflow branches             │
│ Data Cards       │ 4        │ Provide metrics and variable references│
│ Integration Cards│ 6        │ Connect with third-party services     │
│ Extension Cards  │ 3        │ Support custom logic and template reuse│
└────────────┴──────────┴─────────────────────────────────┘
II. Trigger Cards (5 Types)
2.1 New Resume Submission Trigger
Type: Event-driven
Input Support:
Resume formats: PDF/Word/video resumes
Trigger conditions: Automatic activation upon new resume receipt
Key Feature: Starts resume screening workflows, filterable by job position
2.2 Job Status Change Trigger
Type: State-monitoring
Input Support:
Status types: Posted/Paused/Closed
Activation: Manual or system-driven status updates
Key Feature: Monitors job status shifts to trigger linked processes (e.g., notifying candidates when a job is closed)
2.3 Data Metric Trigger
Type: Data-driven
Input Support:
Metric types: Company reach/resume count/match score average
Trigger conditions: Month-over-month decline/below threshold/goal achievement
Key Feature: Enables data-driven workflows (e.g., "If resume count drops 15% week-over-week, switch recruitment template")
2.4 Scheduled Trigger
Type: Time-driven
Input Support:
Frequency: Daily/weekly/monthly/custom intervals
Execution time: Specific time points or windows
Key Feature: Automates recurring tasks (e.g., generating weekly recruitment reports) with timezone support
2.5 Manual Trigger
Type: User-initiated
Input Support:
Activation: Dashboard button/quick menu
Parameters: Manual input or selection
Key Feature: Allows on-demand workflow activation for urgent recruitment needs
III. Action Cards (12 Types)
3.1 Resume Analysis Card
Type: AI-processing
Input Support:
Resume types: Text/video/platform-stored
Filter criteria: Education/experience/skills (multi-condition combinations)
AI options: Basic keyword extraction/video emotion analysis
Output Variables:
{match_score}: Candidate-fit score (0-100)
{skills}: Extracted skill keywords array
{video_confidence}: Video tone confidence score
Key Feature: Enables bulk resume screening with AI analysis
3.2 Interview Invitation Card
Type: Notification-interaction
Input Support:
Candidate scope: Single/batch selection
Template types: Technical/operational/custom
Interview details: Time/format/attachments (supports variable insertion)
Variable References:
{candidate_name}, {interview_template}, {ai_suggestion}
Key Feature: Sends personalized interview invitations at scale
3.3 Resume Status Update Card
Type: Data-operation
Input Support:
Status options: Shortlisted/Under Review/Rejected/Hired
Update scope: Single/batch resumes
Notes: Text input with variable referencing
Linked Functionality: Triggers subsequent processes (e.g., rejection feedback) and updates dashboard statistics
3.4 Job Posting Card
Type: Business-operation
Input Support:
Job details: Title/responsibilities/requirements (template-loading supported)
Posting platforms: Swipehire/LinkedIn/company website (multi-platform sync)
Schedule: Immediate/scheduled posting
Output Variables: {position_id}, {posting_time}
Key Feature: Enables one-click multi-platform job distribution
3.5 Data Export Card
Type: Data-processing
Input Support:
Data scope: Resume data/recruitment metrics/workflow logs
Export formats: Excel/PDF/CSV
Filters: Time range/job type/data status
Output: Custom-named files (e.g., "2025 Jun Recruitment Report_{company_name}.pdf")
3.6 Talent Pool Management Card
Type: Resource-management
Input Support:
Actions: Add/tag/remove
Candidate sources: Screening results/historical resumes
Tag system: Customizable labels (e.g., "High Potential", "Reserve Talent")
Key Feature: Builds enterprise-specific talent repositories
3.7 Salary Inquiry Card
Type: Data-inquiry
Input Support:
Inquiry dimensions: Job role/location/experience level
Data sources: Platform big data/industry reports
Time range: Past 1 year/3 years
Output Variables: {salary_range}, {market_avg}
Key Feature: Provides data-driven salary benchmarking for recruitment decisions
3.8 Feedback Collection Card
Type: Interaction-gathering
Input Support:
Feedback targets: Candidates/interviewers/HR
Formats: Surveys/ratings/text inputs
Triggers: Post-interview/post-offer/post-rejection
Data Processing: Automatic keyword analysis and statistical reporting
3.9 Task Allocation Card
Type: Collaboration-management
Input Support:
Task types: Resume review/interview scheduling/background checks
Assignees: HR team members/interview panels
Priority levels: High/Medium/Low
Linked Functionality: Automated notifications and overdue reminders
3.10 Template Application Card
Type: Process-reuse
Input Support:
Template sources: Official/custom templates
Application scope: Current workflow/global application
Parameter configuration: Customizable template variables
Key Feature: Enables rapid reuse of proven recruitment workflows
3.11 Notification Dispatch Card
Type: Message-delivery
Input Support:
Notification channels: Email/SMS/in-platform messages
Recipients: Candidates/enterprise members
Content formats: Text/HTML (variable insertion supported)
Example Content:
plaintext
Dear {recruiter_name}, you have 5 resumes pending review.
View here: {review_link}

3.12 Workflow Log Card
Type: Log-recording
Input Support:
Log types: Workflow nodes/operation logs/exception records
Recording modes: Automatic/manual tagging
Storage cycles: Daily/weekly/monthly archiving
Key Feature: Provides data traceability for process optimization
IV. Decision Cards (3 Types)
4.1 Conditional Branch Card
Type: Logic-judgment
Input Support:
Variable types: Numeric/text/boolean
Comparison operators: >/</=/≥/≤/contains/does not contain
Logical combinations: AND/OR/NOT
Example Configuration:
plaintext
IF {match_score} > 80 AND {degree} = "Master"
THEN execute "Send Interview Invitation"
ELSE execute "Add to Talent Pool"

4.2 Loop Execution Card
Type: Process-control
Input Support:
Loop conditions: Unmet screening quota/insufficient candidates
Iterations: Fixed cycles/until condition met
Intervals: Time gaps between iterations
典型场景: "If valid resume count < 50, auto-retry job posting"
4.3 Priority Judgment Card
Type: Decision-support
Input Support:
Priority dimensions: Match score/urgency/job importance
Sorting rules: Ascending/descending/custom weights
Thresholds: High-priority trigger conditions
Output: Priority labels (High/Medium/Low) with corresponding actions
V. Data Cards (4 Types)
5.1 Data Metric Reference Card
Type: Variable-provider
Supported Metrics:
Recruitment efficiency: Company reach/resume count/interview conversion
Workflow metrics: Execution frequency/average processing time
Talent quality: Average match score/skill coverage rate
Reference Modes:
Conditional use: IF {company_reach} < 1000
Content insertion: Monthly resume count: {resume_count}
5.2 Data Visualization Card
Type: Chart-generator
Input Support:
Data dimensions: Time series/comparative analysis/trend forecasting
Chart types: Bar/line/pie
Display ranges: Daily/weekly/monthly/custom
Output Modes: Embedded in workflow reports or synced to dashboard
5.3 Data Calculation Card
Type: Logic-calculation
Supported Operations:
Basic: +-*/rounding/percentages
Statistical: Average/max/min
Custom formulas: Simple function support
Example Application: {offer_rate} = {hired_count} / {interview_count} * 100
5.4 Data Filter Card
Type: Data-processing
Input Support:
Data sources: Resume library/recruitment records/workflow logs
Filters: Time/job status/custom labels
Output formats: Structured data/variable arrays
Key Feature: Provides precise data subsets for subsequent analysis
VI. Integration Cards (6 Types)
6.1 AI Capability Call Card
Type: Intelligent-service
Supported Models:
Mistral NLP: Resume keyword extraction/match scoring
Speech recognition: Video resume transcription
Emotion analysis: Interview tone assessment
Input Parameters: Text content/audio files/resume IDs with model configuration
Output Variables: {ai_keywords}, {ai_score}
6.2 Video Interview Integration Card
Type: Tool-docking
Supported Platforms: Zoom/Teams/enterprise video systems
Input Support: Interview scheduling (time/participants) with integration parameters
Linked Functionality: Auto-generates invitations and saves post-interview records
6.3 Background Check Card
Type: Third-party-service
Integrated Services: Background check API/credit reporting systems
Input Support: Candidate information (name/ID/past employers) with check scope
Output: Background report summaries and risk tags
6.4 Enterprise OA Integration Card
Type: System-docking
Supported Systems: HRMS/ERP/internal approval systems
Data Interaction: Syncs hiring info to OA and retrieves internal job quota data
Security: API key authentication and encrypted data transmission
6.5 Social Media Integration Card
Type: Channel-extension
Supported Platforms: LinkedIn/Weibo/WeChat Official Account
Functionality: Job posting synchronization, candidate social profile scraping, and employer branding
6.6 Cloud Storage Integration Card
Type: File-management
Supported Services: Alibaba Cloud/Tencent Cloud/enterprise private clouds
Operations: Automatic resume attachment archiving, batch report storage, and permission control
VII. Extension Cards (3 Types)
7.1 Custom Function Card
Type: Advanced-extension
Supported Languages: JavaScript/Python (sandboxed environment)
IO Capability: Custom parameter input and variable output
Use Case: Implements enterprise-specific resume scoring algorithms
7.2 Subworkflow Call Card
Type: Process-reuse
Application Scenarios: Invokes common modules (e.g., background check subworkflows) and nested logic
Data Passing: Parent-to-child parameter transmission and child-to-parent result returns
7.3 External API Card
Type: Open-interface
Configuration Support: API endpoints/methods/authentication with request/response parsing rules
Use Case: Connects to proprietary systems or third-party services
VIII. Core Characteristics of the Card System
8.1 Compatibility Design
Multi-format Support:
Text: PDF/Word/TXT
Multimedia: MP4/WAV/WEBM
Data: JSON/CSV/Excel
Multi-scenario Adaptation:
SMEs: Simple templates and basic cards
Enterprises: Custom functions and complex workflows
8.2 Extensibility Planning
Card Marketplace: Supports third-party developer contributions with official industry updates
Versioning: Incremental card updates with deprecated card transition mechanisms
8.3 Operational Threshold Control
Tiered Presentation: Basic users see common cards; advanced users unlock full functionality
Intelligent Recommendation: Suggests applicable cards and auto-fills common parameters based on workflow context

This comprehensive card system empowers Swipehire Workflow Dashboard to cover recruitment scenarios from simple screening to complex strategic processes. It balances low operational thresholds with flexible extensibility, providing enterprises with truly "on-demand" recruitment process automation capabilities.