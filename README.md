# Campus Gate Pass System

An AI-powered, full-stack application built to streamline and digitize the gate pass request, approval, and verification process for campus students, faculty heads, and security personnel.

🔗 **Live Host Link:** [https://campus-gate-pass-a5e0294a.base44.app](https://campus-gate-pass-a5e0294a.base44.app)

---

## 🚀 Key Features

The system supports role-based dashboards and features:

### 👨‍🎓 Student Dashboard
- **Apply for Gate Pass:** Submit digital gate pass requests specifying departure date, time, expected return, reason, and optional attachments (e.g., medical certificates).
- **Pass History & Status:** Track pending, approved, and rejected gate passes.
- **Digital QR Code Pass:** Once approved, students receive a unique QR code to present at the campus gate.
- **Profile Management:** View department, branch, and personal details.

### 🏢 Head of Department (HOD) Dashboard
- **Request Review:** View details of incoming student requests.
- **Approval Actions:** Approve or reject passes with custom remarks.

### 🛡️ Admin & Security Dashboard
- **Admin Controls:** Oversee all system activities.
- **Pass Verification:** Scan and verify student QR codes digitally at the campus exit gates.
- **Exit Logs:** View real-time exit/entry logs and history.

---

## 📂 Project Structure

- **/Components:** Shared components like `QRCodeDisplay` and `ApprovalModel`.
- **/Entities:** Core data models defined as JSON schemas (e.g., `GatePass` and `ExitLog`).
- **/Pages:** Individual page layouts for all roles (Students, HODs, Admins, Security).
- `Layout.js`: Navigation wrapper implementing role-based menus.

---

## 🛠️ Built With

- **Base44 Platform:** High-performance low-code application builder.
- **React & React Router:** Robust frontend components and routing.
- **Tailwind CSS:** Modern, responsive layout design.
- **Lucide Icons:** Clean iconography.
