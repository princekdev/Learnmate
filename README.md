# LearnMate – Agentic AI for Personalized Course Pathways

> **Your AI-Powered Personalized Learning Coach** — built with MERN Stack + IBM Granite (watsonx.ai)

LearnMate is an Agentic AI learning platform that uses **IBM Granite** through **IBM Cloud/watsonx.ai** to generate personalized learning roadmaps, adapt them based on your progress, provide skill assessments, recommend resources, and coach you through a conversational AI interface.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation](#6-installation)
7. [Environment Variables](#7-environment-variables)
8. [MongoDB Setup](#8-mongodb-setup)
9. [IBM Cloud / watsonx.ai Setup](#9-ibm-cloud--watsonxai-setup)
10. [IBM Granite Configuration](#10-ibm-granite-configuration)
11. [Running the Backend](#11-running-the-backend)
12. [Running the Frontend](#12-running-the-frontend)
13. [API Overview](#13-api-overview)
14. [Authentication Flow](#14-authentication-flow)
15. [AI Architecture](#15-ai-architecture)
16. [Agentic / Adaptive Workflow](#16-agentic--adaptive-workflow)
17. [Deployment](#17-deployment)
18. [Troubleshooting](#18-troubleshooting)
19. [Security Notes](#19-security-notes)

---

## 1. Project Overview

LearnMate solves the problem of students being overwhelmed by too many online courses with no clear guidance. By using **IBM Granite** as the AI foundation, it:

- Understands student goals, interests, and skill level
- Generates a structured week-by-week learning roadmap
- Continuously adapts the roadmap based on progress and feedback
- Provides a conversational AI coach for instant help
- Generates skill assessments and evaluates answers
- Recommends curated learning resources

---

## 2. Features

| Feature | Description |
|---------|-------------|
| 🎯 Onboarding Wizard | Multi-step profile collection (goals, interests, skills, career goal) |
| 🗺️ AI Roadmap Generation | IBM Granite generates personalized week-by-week roadmaps |
| 🤖 AI Chat Coach | Conversational learning coach powered by IBM Granite |
| 🧠 Skill Assessment | AI-generated domain quizzes with evaluation |
| 📚 Smart Recommendations | AI-curated learning resources |
| 📈 Progress Tracking | Topics, tasks, streaks, study hours |
| 🔄 Adaptive Learning | Roadmap adapts based on progress, feedback, weak areas |
| 🔐 Authentication | JWT-based auth with bcrypt password hashing |
| 📱 Responsive UI | Mobile-friendly dashboard with Tailwind CSS |

---

## 3. Tech Stack

**Frontend:**
- React.js + Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router v6
- Axios
- react-hot-toast
- lucide-react

**Backend:**
- Node.js + Express.js
- JavaScript (ESM modules)
- Mongoose (MongoDB ODM)
- JWT authentication
- bcryptjs
- express-rate-limit
- axios (for IBM API calls)

**Database:**
- MongoDB (MongoDB Atlas compatible)

**AI:**
- IBM Granite (`ibm/granite-3-8b-instruct`)
- IBM watsonx.ai Text Generation API
- IBM Cloud IAM token-based authentication

---

## 4. Folder Structure

```
learnmate/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── Assessment.jsx
│   │   │   ├── AICoach.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── roadmapController.js
│   │   ├── aiController.js
│   │   ├── progressController.js
│   │   ├── assessmentController.js
│   │   └── recommendationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect + generateToken
│   │   └── errorMiddleware.js       # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Roadmap.js
│   │   ├── Progress.js
│   │   ├── Assessment.js
│   │   ├── Chat.js
│   │   └── Recommendation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── roadmapRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── assessmentRoutes.js
│   │   └── recommendationRoutes.js
│   ├── services/
│   │   └── graniteService.js        # IBM Granite AI service layer
│   ├── server.js                    # Express app entry
│   ├── package.json
│   └── .env.example
│
├── package.json                     # Root scripts
└── README.md
```

---

## 5. Prerequisites

- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **npm** v9+
- **MongoDB Atlas** account (free tier works) — or local MongoDB
- **IBM Cloud** account (free/lite tier) with access to **watsonx.ai**

---

## 6. Installation

```bash
# Clone the project
cd learnmate

# Install all dependencies (root + client + server)
npm run install:all

# OR install manually:
cd server && npm install
cd ../client && npm install
```

---

## 7. Environment Variables

Create `server/.env` by copying `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Then fill in your values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/learnmate?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_here

# IBM watsonx.ai credentials
IBM_API_KEY=your_ibm_api_key_here
IBM_PROJECT_ID=your_watsonx_project_id_here
IBM_GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
IBM_GRANITE_URL=https://us-south.ml.cloud.ibm.com
```

> **⚠️ NEVER commit `.env` to version control.**

---

## 8. MongoDB Setup

### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get the connection string and replace in `MONGODB_URI`
5. Whitelist your IP address in Network Access

### Option B: Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/learnmate
```

---

## 9. IBM Cloud / watsonx.ai Setup

1. Go to [cloud.ibm.com](https://cloud.ibm.com) and create a free account
2. Navigate to **watsonx.ai** in the IBM Cloud catalog
3. Create a **watsonx.ai** instance (Lite tier is free)
4. Create a **Project** in watsonx.ai
5. Note your **Project ID** from the project settings
6. Create an **API Key**:
   - Go to **IBM Cloud** → **Manage** → **Access (IAM)** → **API Keys**
   - Click **Create an IBM Cloud API key**
   - Copy the key (shown only once)

---

## 10. IBM Granite Configuration

Set these in `server/.env`:

| Variable | Value |
|----------|-------|
| `IBM_API_KEY` | Your IBM Cloud API key |
| `IBM_PROJECT_ID` | Your watsonx.ai project ID |
| `IBM_GRANITE_MODEL_ID` | `ibm/granite-3-8b-instruct` |
| `IBM_GRANITE_URL` | `https://us-south.ml.cloud.ibm.com` |

**Available Granite models:**
- `ibm/granite-3-8b-instruct` (recommended)
- `ibm/granite-3-2b-instruct` (faster, smaller)
- `ibm/granite-13b-instruct-v2`

**Note:** If your watsonx.ai instance is in a different region, update `IBM_GRANITE_URL`:
- US South: `https://us-south.ml.cloud.ibm.com`
- EU: `https://eu-de.ml.cloud.ibm.com`
- Tokyo: `https://jp-tok.ml.cloud.ibm.com`

---

## 11. Running the Backend

```bash
cd server
npm run dev
```

The server starts on `http://localhost:5000`.

You should see:
```
🚀 LearnMate server running on port 5000
📡 Client URL: http://localhost:5173
🤖 IBM Granite: ✅ Configured
🗄️  MongoDB: Connecting...
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

## 12. Running the Frontend

```bash
cd client
npm run dev
```

The frontend starts on `http://localhost:5173`.

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`.

---

## 13. API Overview

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |

### Roadmap
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/roadmap/generate` | Generate AI roadmap |
| GET | `/api/roadmap` | Get active roadmap |
| GET | `/api/roadmap/:id` | Get roadmap by ID |
| PUT | `/api/roadmap/:id/progress` | Mark topic/task complete |
| POST | `/api/roadmap/adapt` | Adapt roadmap with AI |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/chat` | Chat with AI coach |
| GET | `/api/ai/chats` | Get all chat sessions |
| GET | `/api/ai/chat/:chatId` | Get chat history |
| DELETE | `/api/ai/chat/:chatId` | Delete chat |
| POST | `/api/ai/recommend` | Get AI recommendations |
| GET | `/api/ai/analyze` | Analyze progress with AI |

### Assessment
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/assessment/generate` | Generate questions |
| POST | `/api/assessment/submit` | Submit + evaluate |
| GET | `/api/assessment/history` | Assessment history |

### Progress & Recommendations
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/progress` | Get progress |
| PUT | `/api/progress` | Update progress |
| GET | `/api/recommendations` | Get recommendations |
| POST | `/api/recommendations/generate` | Generate AI recs |
| PUT | `/api/recommendations/:id/save` | Save/unsave rec |

---

## 14. Authentication Flow

1. User registers → password hashed with bcrypt → JWT token returned
2. Token stored in `localStorage` on frontend
3. Every API request includes `Authorization: Bearer <token>`
4. Backend `protect` middleware verifies JWT on protected routes
5. Token expires in 30 days

---

## 15. AI Architecture

All AI functionality goes through `server/services/graniteService.js`:

```
Frontend → Backend API → graniteService.js → IBM IAM (token) → watsonx.ai → IBM Granite
```

### Functions:
- `generateLearningRoadmap(userProfile)` — generates structured JSON roadmap
- `generateCourseRecommendations(profile, progress)` — recommends resources
- `generateSkillAssessment(domain, level)` — creates quiz questions
- `evaluateAssessment(domain, questions, answers)` — scores and analyzes answers
- `generateAIChatResponse(message, profile, history, progress)` — chat coach
- `analyzeLearningProgress(profile, roadmap, progress)` — progress insights
- `adaptLearningRoadmap(profile, roadmap, progress, feedback)` — updates future weeks

**Token Management:** IBM IAM tokens are cached and reused until near expiry (avoids repeated token requests).

---

## 16. Agentic / Adaptive Workflow

LearnMate demonstrates agentic behavior through:

1. **Profile Collection** → AI understands student context
2. **Initial Roadmap** → IBM Granite generates structured week-by-week plan
3. **Progress Tracking** → User marks topics/tasks complete
4. **AI Analysis** → `analyzeLearningProgress()` generates insights, next steps, weak areas
5. **Roadmap Adaptation** → `adaptLearningRoadmap()` updates future weeks based on:
   - Completed topics
   - Assessment results and weak areas
   - User feedback
   - Learning pace
6. **Continuous Coaching** → AI chat coach has access to user profile + progress for contextual answers

The **Adapt Roadmap** feature (on the Roadmap page) allows users to provide free-text feedback and IBM Granite will rewrite future weeks accordingly.

---

## 17. Deployment

### Backend (e.g., Railway, Render, Heroku)
1. Set all environment variables from `.env.example` in your platform's settings
2. Deploy `server/` directory
3. Update `CLIENT_URL` to your frontend URL

### Frontend (e.g., Vercel, Netlify)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set environment variable: `VITE_API_URL` if needed (currently uses Vite proxy)
4. For production, update `client/src/services/api.js` baseURL to your backend URL

---

## 18. Troubleshooting

### "IBM Granite is not configured"
- Check that `IBM_API_KEY` and `IBM_PROJECT_ID` are set in `server/.env`
- Verify the API key is active in IBM Cloud IAM

### "IBM Granite returned an empty response"
- Try a different model in `IBM_GRANITE_MODEL_ID`
- Check your IBM Cloud account has watsonx.ai access

### MongoDB connection fails
- Check `MONGODB_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Check the database user has the correct permissions

### Frontend shows "Network Error"
- Ensure the backend is running on port 5000
- Check the Vite proxy in `vite.config.js` points to `http://localhost:5000`

### JWT errors
- Ensure `JWT_SECRET` is set and is a strong random string
- Clear localStorage and log in again

---

## 19. Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) before storage
- Plain-text passwords are never stored or logged
- JWT tokens expire in **30 days**
- IBM API credentials are **only in server `.env`** — never exposed to frontend
- Rate limiting is applied to AI endpoints (20 req/min for chat, 10/5min for assessments)
- CORS is configured to only allow requests from `CLIENT_URL`
- MongoDB injection is mitigated by Mongoose schema validation
- `.env` is excluded from version control via `.gitignore`
- All error responses sanitize sensitive server details in production

---

## License

MIT — Built for IBM Cloud / Edunet internship project.
