# GRAP – SOP Management Dashboard (POC)

A Proof of Concept (POC) for Axis Bank RetailOps - GRAP Dashboard, designed for authorised users to upload, review, and publish Standard Operating Procedure (SOP) documents.

## 🚀 Technical Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Angular** | 17.0.0+ | Frontend Framework (Standalone Components) |
| **TypeScript** | 5.2.2 | Programming Language |
| **Node.js** | v18/v20+ | Runtime Environment |
| **RxJS** | 7.8.0 | Reactive State Management |
| **SCSS** | - | Styling (Component-scoped) |
| **HTML5** | - | UI Markup with File API & Drag-and-Drop |

---

## 🛠️ Key Features & Enhancements

1. **SSO Simulation**: Simulated Microsoft/Axis Bank SSO with role-based access for **Maker** and **Reviewer** personas.
2. **Dynamic Dashboard**: Responsive listing with My SOPs, For My Review, and real-time status-based KPIs.
3. **Advanced File Handling**:
   - Genuine file picker and drag-and-drop support.
   - Client-side validation for `.pdf`, `.doc`, and `.docx` (10MB limit).
   - **Live PDF Preview**: Real-time rendering of uploaded PDFs using Browser Blob URLs.
4. **Lifecycle Workflow**: Full implementation of the `Draft → Submitted → Requested Modification → Resubmitted → Approved/Rejected` flow.
5. **Activity Timeline**: Chronological, newest-first history of all actions taken on an SOP.
6. **Branding**: Precise Axis Bank branding (Maroon/Burgundy palette) with custom high-fidelity vector icons and favicon.

---

## 🏃 How to Run the Project

Follow these steps to get the application running on your local machine:

### 1. Navigate to Project Directory
```bash
cd grap-sop-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run start
```

### 4. Access in Browser
Open [http://localhost:4200](http://localhost:4200) in your web browser.

---

## 📝 Simulated Interactions (POC Scope)
- **Authentication**: Simulated SSO. Selecting a persona during login toggles role-specific permissions.
- **Persistence**: All data is managed in-memory via `SopService`. Browser refreshes will reset data to the initial mock state.
- **Document Management**: File metadata and PDF previews are handled locally in the browser. Permanent server-side storage and Live Knowledge Base publishing are simulated for this POC.

---
*Axis Bank RetailOps – GRAP | Draft v0.1*
