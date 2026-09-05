# 🎓 MCA Connect

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**An intelligent academic networking and career platform connecting MCA scholars, alumni mentors, and faculty.**

[Live Demo](https://mca-connect-eight.vercel.app) • [Features](#-core-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Role Matrix](#-user-roles--access)

</div>

---

## 🌟 Overview

**MCA Connect** is an all-in-one digital ecosystem tailored for MCA students and alumni. It bridges the gap between academic curriculum and high-growth tech careers through peer discussions, curated notes, real placement debriefs, team project recruitment, 1-on-1 mentorship bookings, and AI-driven career tools.

---

## 🚀 Core Features

### 📚 1. Knowledge Base & Roadmaps
- **Curated Study Guides**: High-yield MCA semester notes and system design guides with full Markdown rendering.
- **Career Roadmaps**: Step-by-step milestone roadmaps from programming fundamentals to cloud-native deployments.
- **Category & Difficulty Filters**: Filter easily across Semester, DSA, System Design, Web, AI/ML, and Cloud.

### 💼 2. Alumni Placement Intelligence
- **Real Interview Experiences**: Detailed round-by-round interview debriefs shared by seniors placed at tier-1 tech firms.
- **Interview Question Bank**: Specific technical coding and system architecture questions asked by top companies.
- **CTC & Difficulty Breakdown**: Compensation details, difficulty ratings, and curated tips for juniors.

### 🚀 3. Scholar Project Showcase & Teammate Finder
- **Interactive Project Showcase**: Explore live demos, GitHub repositories, and architectural breakdowns.
- **Recruit Teammates**: Filter projects actively recruiting peer contributors for hackathons and capstone projects.
- **Applaud & Star**: Community upvotes and feedback.

### 👥 4. 1-on-1 Alumni Mentorship Portal
- **Verified Mentors Directory**: Search mentors by company (Microsoft, Google, TCS), years of experience, and domain expertise.
- **Direct Session Booking**: Students schedule 1-on-1 mock interviews, resume reviews, or career roadmap sessions.
- **Mentor Approval Dashboard**: Mentors review requests, schedule Google Meet / Zoom links, or decline.
- **Undo / Role Reset**: Flexibility for users to activate or deactivate mentor status anytime.

### 💬 5. Academic Q&A Discussion Forum
- **Code Debugging**: Syntax-highlighted code blocks for sharing and debugging code.
- **Verified Mentor Badges**: Highlights answers written by verified alumni or faculty.
- **Resolve Toggle**: Authors or mentors can mark discussions as solved.

### 🤖 6. AI Career Suite (Powered by Google Gemini)
- **Resume Matcher & Gap Analyzer**: Evaluates student resumes against job descriptions with percentage match and action plans.
- **Code Complexity Explainer**: Explains time and space complexity ($O(N)$, $O(\log N)$) with step-by-step optimization hints.
- **Smart Flashcards**: Generates instant revision cards for DBMS, OS, Computer Networks, and System Design.

### 🔍 7. Global Instant Search (`Ctrl+K`)
- Unified multi-database search across articles, questions, projects, placement logs, and mentors simultaneously.

---

## 🛠️ Tech Stack

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS ] 
                         │ (REST API /api/...)
[ Backend: Python 3 + Django 5 + Django REST Framework ]
                         │ (ORM Queries)
[ Database: PostgreSQL (Production) / SQLite (Local) ]
                         │
[ AI Engine: Google Gemini Generative AI SDK ]
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11+, Django 5, Django REST Framework, WhiteNoise, Gunicorn
- **Database**: PostgreSQL (Cloud / Production), SQLite (Local Dev)
- **AI Integration**: Google Gemini Generative AI SDK
- **Deployment**: Vercel (Frontend SPA) + Render (Backend Web Service)

---

## 👥 User Roles & Access

| Feature | Guest | Student (`ananya_roy`) | Alumni Mentor (`rahul_verma`) | Admin (`admin`) |
|---|:---:|:---:|:---:|:---:|
| Browse Hubs & Global Search (`Ctrl+K`) | ✅ | ✅ | ✅ | ✅ |
| AI Career Suite (Resume, Code Explainer) | ✅ | ✅ | ✅ | ✅ |
| Ask / Answer Q&A Discussions | 🔒 | ✅ | ✅ *(Mentor Badge)* | ✅ |
| Showcase Projects & Recruit Teammates | 🔒 | ✅ | ✅ | ✅ |
| Share Placement Interview Logs | 🔒 | ✅ | ✅ | ✅ |
| Book 1-on-1 Mentorship Sessions | 🔒 | ✅ | ❌ | ❌ |
| Publish Official Study Guides | ❌ | ❌ | ✅ | ✅ |
| Confirm Mentorship Slots with Meet Links | ❌ | ❌ | ✅ | ✅ |
| Platform-Wide Content Moderation | ❌ | ❌ | ❌ | ✅ |

---

## 💻 Quick Start (Run Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/karan-dikole/MCA-Connect.git
cd MCA-Connect
```

### 2. Backend Setup (Django)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed initial demo accounts and sample curriculum data
python manage.py seed_production_data

# Start the Django backend server
python manage.py runserver
```
*Backend runs at `http://127.0.0.1:8000/`*

### 3. Frontend Setup (React + Vite)
```bash
# Open a new terminal in the frontend folder
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
*Frontend runs at `http://localhost:5173/`*

---

## 🔑 Fast-Access Demo Accounts

You can log in instantly via the 1-Click Fast Access selector on the login modal:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **MCA Student** | `ananya_roy` | `pass1234` | Project showcasing, Q&A, booking mentors |
| **Alumni Mentor** | `rahul_verma` | `pass1234` | Publishing study guides, approving mentorship sessions |
| **Administrator** | `admin` | `admin123` | Full system administration and moderation |

---

## 🧪 Automated Testing

MCA Connect includes an automated 16-point test suite covering RBAC, CRUD, deletion, and AI integrations:

```bash
python test_all_apis.py
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.