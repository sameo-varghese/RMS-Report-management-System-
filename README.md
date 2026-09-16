# UCC SCA Department Archive & Activity Report Management System (RMS)

> **School of Computer Applications — Union Christian College, Aluva (Autonomous)**  
> **MCA CP 307 Mini Project | 2026**

---

##  Project Overview

The **Department Archive & Activity Report Management System (RMS)** is a comprehensive academic activity logging, report synthesis, and archiving platform built for the School of Computer Applications at Union Christian College, Aluva. 

It streamlines the complete lifecycle of departmental documentation—allowing faculty and administrative heads (HOD) to record events, upload multimedia proof, auto-generate formal academic reports using AI, and produce accreditation-ready PDF summaries.

---

##  Key Features

-  **Activity Archiving & Tracking**: Record and manage departmental workshops, FDPs, seminars, webinars, and cultural activities sorted by academic year and category.
-  **AI Narrative Generation**: Synthesize formal academic activity narratives and annual departmental reports automatically via **Google Gemini AI** (with an integrated built-in offline narrative engine fallback).
-  **Cloud Media Storage**: Securely store event photos and documentations via **Cloudinary** integration (with automatic fallback to mock media URLs in offline mode).
-  **PDF Report Engine**: Generate structured, printable PDF activity reports and annual performance summaries complete with official headers, tables, and attached image grids.
-  **Multi-Role Authentication**: Secure JWT-based authorization tailored for **Admin (HOD)** and **Faculty** members with predefined permission levels.
-  **Web & Mobile Frontends**: Includes a modern **React 18 + Vite** web portal, a cross-platform **Expo React Native** mobile app, and a zero-dependency standalone `preview.html` file.
-  **Offline Demo Resilience**: Full operational capability out of the box using in-memory mock data stores if external cloud service credentials are unconfigured.

---

##  Tech Stack

| Component | Technology / Library |
| --- | --- |
| **Backend API** | Python 3.11 + FastAPI + Motor (Async MongoDB) |
| **Database** | MongoDB Atlas (Async Motor client) / In-Memory Mock Fallback |
| **Media Storage** | Cloudinary (Free Tier) / Fallback Mock Provider |
| **AI Synthesis Engine** | Google Gemini REST API / Built-in Academic Narrative Engine |
| **PDF Generation** | WeasyPrint (HTML to PDF converter) / HTML Printable View |
| **Web Frontend** | React 18 + Vite + TailwindCSS + Lucide Icons |
| **Mobile App** | Expo SDK 50 + React Native + NativeWind + Expo Router |
| **Security & Auth** | OAuth2 Password Bearer + JWT (`python-jose`) + `passlib` (bcrypt) |

---

##  Repository Structure

```text
rms-project/
├── .gitignore             # Git exclusion rules for Python, Node, Expo, and secrets
├── README.md              # Project documentation and setup guide
├── backend/               # FastAPI asynchronous backend application
│   ├── .env.example       # Environment variables configuration template
│   ├── .env               # Active environment credentials (git-ignored)
│   ├── main.py            # FastAPI entry point & API route wiring
│   ├── requirements.txt   # Python dependency declarations
│   ├── core/              # Security, JWT, CORS, and Pydantic configuration
│   ├── models/            # Pydantic schema definitions (User, Activity, Media, Reports)
│   ├── routers/           # Endpoint handlers (auth, activities, reports, media)
│   └── services/          # Services (Gemini AI, Cloudinary, PDF Generator)
├── web/                   # React 18 + Vite web application
│   ├── index.html         # Web application HTML wrapper
│   ├── preview.html       # Standalone zero-dependency HTML demo preview
│   ├── package.json       # Frontend dependencies and npm scripts
│   └── src/               # React components, pages, hooks, and assets
└── mobile/                # Expo React Native mobile application
    ├── app.json           # Expo project configuration
    ├── package.json       # Mobile dependencies
    └── app/               # React Native screens & navigation structure
```

---

##  Quick Start Guide

### 1. Backend Setup (FastAPI)

#### Prerequisites:
- Python 3.11 or higher installed on your system.

#### Installation & Execution:
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Configure environment variables (copy template)
copy .env.example .env

# Start the uvicorn development server
python -m uvicorn main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative API Specification (ReDoc)**: `http://localhost:8000/redoc`

---

### 2. Web Frontend Setup (React + Vite)

#### Prerequisites:
- Node.js 18+ and npm installed.

#### Installation & Execution:
```bash
# Navigate to the web directory
cd web

# Install npm packages
npm install

# Start the Vite development server
npm run dev
```

- **Local Web App URL**: `http://localhost:5173`

> **Note (Zero-Dependency Demo)**: If Node.js is not installed, simply open `web/preview.html` directly in any web browser to view the interactive application demo.

---

### 3. Mobile App Setup (Expo React Native)

#### Prerequisites:
- Node.js 18+ and `expo-cli` installed.
- Expo Go application installed on iOS / Android device.

#### Execution:
```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies if required
npm install

# Start the Expo development server
npx expo start
```

- Scan the generated QR code using the **Expo Go** app on your phone to launch the application.

---

##  Default Demo Credentials

When running in offline/demo mode, the application auto-seeds the following test accounts:

| Role | Email | Password | Access Level |
| --- | --- | --- | --- |
| **Admin (HOD)** | `admin@ucc.edu.in` | `admin123` | Full administrative control, activity approval, annual report synthesis |
| **Faculty** | `faculty@ucc.edu.in` | `faculty123` | Activity logging, media uploads, report downloads |

---

##  Environment Variables Reference

Edit `backend/.env` to configure external service integrations:

| Variable | Description | Default / Fallback |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas cluster connection URI | In-Memory Mock Database |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account Cloud Name | Mock Media URL Engine |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Mock Media URL Engine |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret Key | Mock Media URL Engine |
| `GEMINI_API_KEY` | Google AI Studio API Key for Gemini 1.5/2.0 Flash | Built-in Academic Narrative Generator |
| `JWT_SECRET` | Secret key used for signing JWT tokens | Default dev secret key |
| `FRONTEND_URL` | CORS allowed origin URL | `http://localhost:5173` |

---

##  Security & Privacy Notice

- Never commit the `.env` file containing live credentials or API secrets to version control.
- Always keep `.env` listed in `.gitignore`.
- Use `.env.example` as a template for sharing non-sensitive configuration keys.

---

##  License & Credits

Developed as part of the **MCA CP 307 Mini Project (2026)**  
**School of Computer Applications, Union Christian College, Aluva (Autonomous)**  
*All Rights Reserved.*
