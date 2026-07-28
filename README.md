<div align="center">

  <h1>
    <img src="./public/favicon.svg" width="28" style="vertical-align: middle;" />
    ZenSpace
  </h1>

  <p><b>A premium, full-stack project management SaaS platform designed for high-performance teams.</b></p>
  <p><i>Find your flow in the chaos.</i></p>

  <p>
    <a href="#-key-features">Features</a> •
    <a href="#%EF%B8%8F-technology-stack">Tech Stack</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-getting-started">Installation</a>
  </p>

  <br />

  <!-- Tech Icons -->
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Prisma.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/ExpressJS-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Redux.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Git.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Github-Dark.svg" width="42" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Supabase-Dark.svg" width="42" />

</div>

---

## 🚀 Overview

ZenSpace combines a sleek, state-of-the-art **glassmorphic UI** with powerful **AI-assisted workflows**, **real-time collaboration**, and **robust data management**. Built to handle the demands of modern cross-functional teams, it enables you to manage your projects, tasks, and team interactions seamlessly.

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.17.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-FF7B00?style=for-the-badge&logo=groq&logoColor=white)

---

## ✨ Key Features

### 🏢 Workspace & Project Architecture
* **Multi-Workspace Support**: Organize different business units or teams into isolated workspaces effortlessly.
* **Granular Project Control**: Comprehensive project tracking with diverse lifecycle statuses (`Active`, `Planning`, `Completed`, `On Hold`, `Cancelled`).
* **Visual Progress Tracking**: Real-time percentage-based progression and robust Priority Matrices (Low, Medium, High).

### ✅ Advanced Task Management
* **Kanban-Style Statuses**: Fluid workflows navigating through `To Do` → `In Progress` → `Done`.
* **Categorized Task Types**: Effectively manage distinct task entities like `Tasks`, `Bugs`, `Features`, and `Improvements`.
* **Smart Assignments**: Instantly assign tasks to specific team members, assign deadlines, and detail the scope.

### 🤖 ZenAI Assistant
* **AI Chatbot Context**: Context-aware assistant powered by **Groq** (using Llama 3.3).
* **Intelligent Suggestions**: Ask the AI to brainstorm or even generate actionable JSON-mapped tasks dynamically based on project descriptions.

### 👥 Collaboration & Security
* **Role-Based Access Control (RBAC)**: Enforced internal security differentiating `Admin`, `Owner`, and `Member` privileges.
* **Secure Invites**: Token-based architecture to seamlessly onboard new team members.
* **Persistent Discussions**: Dynamic, threaded comments tied to projects and specific tasks ensuring deep collaboration.

### 🎨 Premium Aesthetics (UX/UI)
* **Glassmorphism**: High-end frosted glass elements with ultra-modern UI design languages.
* **Complex UI Graphics**: GSAP and Framer Motion powered transitions across pages and interactions.
* **Visual Calendar**: A beautiful integrated calendar system mapping out schedules interactively.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, GSAP, Framer Motion |
| **Backend** | Node.js (Node 20+), Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT (Cookie-based), bcryptjs |
| **AI Integration** | Groq SDK (Llama 3.3-70b/8b) |

---

## 🧭 System Architecture

```mermaid
graph TD
    %% Frontend Node
    Client["🖥️ React 19 SPA<br>(Vite + Tailwind)"]
    
    %% API Gateway Layer
    Gateway["🌐 Express Server<br>(REST API)"]
    
    %% Backend Services
    Auth["🛡️ Auth Service<br>(JWT + bcrypt)"]
    Projects["📁 Project & Task<br>Management"]
    AI_Agent["🤖 ZenAI Agent"]
    
    %% Database Connection Layer
    ORM["🔷 Prisma ORM"]
    
    %% Data Stores
    DB[("🐘 PostgreSQL<br>Database")]
    LLM["🧠 Groq API<br>(Llama 3.3)"]
    
    %% Relationships
    Client <-->|Axios / JSON| Gateway
    Gateway --> Auth
    Gateway --> Projects
    Gateway --> AI_Agent
    
    Auth --> ORM
    Projects --> ORM
    
    ORM <--> DB
    AI_Agent <-->|Prompts / Streaming| LLM
```

### 🗄️ Database Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : "creates & owns"
    USER ||--o{ PROJECT : "leads"
    USER ||--o{ TASK : "is assigned"
    USER ||--o{ COMMENT : "authors"
    
    WORKSPACE ||--o{ PROJECT : "contains"
    
    PROJECT ||--o{ TASK : "houses"
    PROJECT ||--o{ PROJECT_INVITE : "issues"
    PROJECT ||--o{ FILE_ASSET : "attaches"
    
    TASK ||--o{ COMMENT : "contains"
    PROJECT ||--o{ COMMENT : "contains"
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js 20+**
* **PostgreSQL** Database 
* **Groq API Key** (or use Google Gemini fallback if configured)

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/zenspace.git
   cd zenspace
   
   # Install Frontend Dependencies
   npm install
   
   # Install Backend Dependencies
   cd server
   npm install
   cd ..
   ```

2. **Environment Setup**
   Ensure `.env` files are correctly set up in the root and `/server` directory.

   **Root `.env` (Frontend):**
   ```env
   VITE_API_URL=http://localhost:4000
   ```

   **Server `.env` (`/server/.env`):**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/zenspace"
   DIRECT_URL="postgresql://user:password@localhost:5432/zenspace"
   JWT_SECRET="your_very_secure_secret"
   GROQ_API_KEY="your_groq_api_key_here"
   PORT=4000
   ```

3. **Database Initialization**
   ```bash
   cd server
   
   # Apply Prisma migrations
   npx prisma migrate dev --name init
   
   # Optional: Seed the database with sample data
   npm run db:seed 
   cd ..
   ```

4. **Run Development Servers**
   To experience the full capability, run both client and server instances concurrently.
   
   ```bash
   # Terminal 1: Frontend Server
   npm run dev

   # Terminal 2: Backend API
   cd server
   npm run dev
   ```

---

## 📁 Project Structure

```text
zenspace/
├── components/          # Reusable UI (BlobCursor, VisualCalendar, ZenAIChat)
├── pages/               # Main Views (Dashboard, ProjectDetails, Tasks, etc.)
├── store/               # Frontend State Management hook architectures
├── public/              # Static Frontend Assets
├── server/              # Express Backend Ecosystem
│   ├── prisma/          # Prisma schema & seeding strategy
│   ├── routes/          # Isolated API endpoint configurations
│   ├── utils/           # Shared utility classes & helpers
│   └── index.ts         # High-level server bootstrap
├── types.ts             # Shared global TS interfaces
└── tailwind.config.cjs  # Custom theme & animation constants
```

---

## 📈 Roadmap

- [x] Initial React 19 Migration & UI Rewrite.
- [x] AI agent integration via Groq for generative tasks.
- [x] Full DB relations with Tasks, Comments & Projects.
- [ ] Real-time WebSockets setup for live collaboration UI updates.
- [ ] Drag-and-drop Kanban interface components.
- [ ] Comprehensive File/Asset cloud storage (AWS S3) configuration.
- [ ] Cross-platform React Native companion app.

---

## 🤝 Contributing

We welcome community contributions to ZenSpace! 

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

<div align="center">
  <b>Built with pride for the modern workforce.</b>
  <br>
  <i>Copyright © 2026 ZenSpace Ecosystem</i>
</div>