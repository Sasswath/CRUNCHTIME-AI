# CrunchTime AI ⚡
> **An emergency deadline-salvage assistant designed to convert peak anxiety into intense, structured, high-momentum execution.**

[![Application URL](https://img.shields.io/badge/Live-Preview-FF3B30?style=for-the-badge)](https://ai.studio/build)
[![Google Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TS-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

---

## 📋 Table of Contents
- [Problem Statement Selected](#-problem-statement-selected)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Technologies Used](#-technologies-used)
- [Google Technologies Utilized](#-google-technologies-utilized)
- [Project Architecture](#-project-architecture)
- [Local Installation & Setup](#-local-installation--setup)
- [Exporting to GitHub](#-exporting-to-github)

---

## 🔍 Problem Statement Selected
**The High-Stakes, Last-Minute Deadline Management Dilemma.**

Standard productivity tools and planner apps are built on the assumption of long-term planning (weeks or months). When users face a looming **11th-hour deadline**, traditional task systems increase anxiety rather than solving it. 
In these crunch periods:
1. **Decision Paralysis & Panic** set in due to elevated cortisol levels, making simple organizing impossible.
2. **Estimates Fail**: Overwhelmed users cannot accurately assess which tasks can actually be completed in the remaining hours.
3. **Procrastination Taxes Accumulate**: Time spent panicking or engaging in low-impact multi-tasking further erodes the remaining time window.

CrunchTime AI addresses this specific high-stress temporal window, bridging the gap between clinical stress reduction and brutal, dynamic descope-and-sprint task management.

---

## 💡 Solution Overview
**CrunchTime AI** is a fully integrated full-stack, emergency response platform that rescues drowning users by transforming panic into precise execution. 

Instead of adding to-do lists, CrunchTime AI works like a **tactical operations room**:
- **De-escalation First**: Before users touch a keyboard, the app features an **SOS Anti-Panic Breather** utilizing the scientific *physiological sigh* (the fastest autonomic technique to lower heart rate and adrenaline).
- **Interactive Stress Telemetry**: An intelligent **Crisis Analyzer** computes real-time stress levels, estimated survival rates, and procrastination tax rates based on hours left, workload, caffeine, and sleep.
- **Dynamic Rescue Planner**: It automatically recommends brutal descoping (shedding 50% of the project) and generates a hyper-focused **Emergency Action Plan (EAP)** to build immediate momentum.

---

## 🚀 Key Features

### 1. 🚨 SOS Anti-Panic Coach
*   **Scientific De-escalation**: Implements the *physiological sigh* (double inhale followed by an extended, slow exhale).
*   **Audio Synthesizer**: Utilizes the native browser **Web Audio API** to generate real-time, calming sound frequency sweeps synchronized with breathing expansion.
*   **Dynamic Visual Guide**: Interactive concentric waves expand and contract to visually direct inhalation, exhalation, and settle hold phases.

### 2. 📊 Interactive Crisis & Procrastination Telemetry
*   **Real-Time Analytics**: Calculates dynamic metrics (Panic Level Index, Estimated Survival Rate, Procrastination Hourly Cost) as you slide/toggle parameters.
*   **Brutal Descoping Logic**: Triage warnings trigger explicit instructions when risk thresholds are breached, helping users understand when they must descope their feature list.

### 3. 🎯 Emergency Action Plan (EAP)
*   **15-Minute Atomic Steps**: Converts overwhelming milestones into low-friction, bite-sized tasks to prevent executive dysfunction.
*   **Focus Room integration**: Integrates directly with a focused Pomodoro timer to maintain maximum momentum without screen noise.

---

## 🛠️ Technologies Used
- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Atomic Design System, dark high-contrast cockpit theme)
- **State Management**: React Context & Hooks
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (Micro-interactions, modal fade-ins, and ripples)
- **Synthesizer Engine**: Native HTML5 Web Audio API
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🌐 Google Technologies Utilized

### 🤖 Google Gemini 3.5 AI Action Framework
-   Runs secure, server-side requests via the **`@google/genai`** SDK.
-   Maintains private API key isolation (fully hidden from client-side DevTools).
-   Responsible for taking chaotic, multi-sentence stress dumps and restructuring them into prioritized, prioritized Emergency Action Plans.

### 🔒 Firebase Authentication & Firestore
-   Secures user profiles and persists task queues, active crunches, and historically resolved emergencies.

---

## 🏗️ Project Architecture
```text
├── server.ts                 # Full-stack Express server with Vite Dev Middleware & Gemini SDK proxy
├── src/
│   ├── App.tsx               # Main layout entry & application cockpit shell
│   ├── types.ts              # Strongly typed shared models (Tasks, Habits, Plans, User profiles)
│   ├── components/
│   │   ├── AntiPanicCoach.tsx # Web Audio-powered breathing de-escalation coach
│   │   ├── CrisisCalculator.tsx # Interactive Stress telemetry & survival metric simulator
│   │   ├── Dashboard.tsx     # Unified core dashboard with interactive widgets
│   │   ├── FocusZone.tsx     # Minimal focus room and atomic Pomodoro timer
│   │   └── VoiceAssistant.tsx # Quick-chat conversational system
│   └── index.css             # Root Tailwind CSS system
```

---

## 💻 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sasswath/CrunchTime-AI.git
   cd CrunchTime-AI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📤 Exporting to GitHub

To push this entire workspace directly into your newly created GitHub repository at **`https://github.com/Sasswath/CrunchTime-AI`**, follow these simple steps inside the Google AI Studio interface:

1. Click on the **Settings Gear Icon** ⚙️ located in the top-right corner of the **AI Studio Build** panel.
2. Under the **Export Options**, click on **Export to GitHub**.
3. Authorize your GitHub account (if you haven't already).
4. Select or enter the repository name: `Sasswath/CrunchTime-AI`.
5. Click **Export** to instantly push all files, code structure, assets, and this `README.md` directly into your repository!

---
*Created with care by Sasswath & CrunchTime AI. Fueling calm, logical execution during your darkest deadlines.*
