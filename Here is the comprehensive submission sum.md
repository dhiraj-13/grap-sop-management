
GRAP SOP Management Dashboard — Candidate POC Submission


1. Project Location & Tech Stack
Project Directory: Desktop\new_folder\grap-sop-management
Tech Stack: Angular 17+ (Standalone Components, TypeScript, Reactive Forms, SCSS)
2. Run Instructions
Open terminal at: Desktop/new_folder/grap-sop-management
Install dependencies: npm install
Start server: npm run start
Browser: http://localhost:4200
3. Key Improvements Over Original Mockup
Real File System Integration: Upgraded the upload mechanism from a "random fake click" to a genuine HTML5 File Picker and Drag-and-Drop system.
Client-Side File Validation: Implemented real-time checks for file extensions (.pdf, .doc, .docx) and file size (10MB limit) with instant feedback.
Live Document Rendering: Integrated PDF Blob Previewing. When a user uploads a PDF, the application creates a secure browser Blob URL and renders the actual document content in a live preview iframe.
Branding Excellence: Replaced default assets with high-fidelity, custom-vector Axis Bank branding (Converging "A" logo) for both the UI and browser favicon.
Modular Refactoring: Decoupled styles into component-scoped .scss files, significantly improving maintainability compared to the single monolithic mockup.
4. What Interactions are Simulated (POC Scope)
SSO Authentication: Microsoft/Axis SSO simulation with switchable Maker/Reviewer personas for role-based permission testing.
File Processing: Real client-side file reading, metadata extraction, and blob-based rendering (server-side permanent storage is simulated).
Versioning & Workflow: Functional state-machine tracking the lifecycle of an SOP from Draft through Approval or Resubmission based on reviewer remarks.
Data Persistence: Uses a reactive in-memory data store managed by SopService. Refreshing the browser resets to the initial demo state.
