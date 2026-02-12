# Project Frontend

## 📂 Services
- **Frontend (codeuniverse)**: React + Vite frontend for the Collaboration Platform. Provides the user interface for task management, the integrated code editor, the audited terminal, and direct integration with the AI Assistant.

---

## 🔗 Associated Repositories

- [Backend (codeuniverse-demo-backend)](https://github.com/arispretz/codeuniverse-demo-backend.git)
- [AI Assistant (codeuniverse-demo-ai_assistant)](https://github.com/arispretz/codeuniverse-demo-ai_assistant.git)
- [Codeuniverse-Demo (codeuniverse-demo)](https://github.com/arispretz/codeuniverse-demo.git)

---

## Features
- Kanban board for task management
- Code editor integration
- AI Assistant integration (FastAPI backend)
- Firebase authentication
- Dashboard with role-based access

---

## Tech Stack
- React + Vite
- Firebase
- Socket.io
- REST APIs (Express backend)
- FastAPI (AI Assistant)

---

## Installation
```bash
git clone https://github.com/arispretz/codeuniverse.git
cd codeuniverse
npm install
cp .env.example .env
npm run dev
`````

---

## 🔑 Environment Variables
See .env.example for required variables.

---

## 🚀 Deployment
Vercel: Production deployment does not use Docker.
Local Development / Docker Compose: Dockerfiles are included for integration with the backend and AI Assistant.

---

## 🐳 Docker Usage
### Development
```bash
docker build -f dockerfile.dev -t frontend-dev .
docker run -p 5173:5173 frontend-dev
`````

### Production
```bash
docker build -f dockerfile.prod -t frontend-prod .
docker run -p 3000:3000 frontend-prod
`````

ℹ️ Note:
- Use the Development configuration for local testing with the Vite dev server (port 5173).
- Use the Production configuration if you want to run the compiled app locally with Docker (port 3000), although production deployment is handled via Vercel.

---

## 📜 License
Apache 2.0

---

