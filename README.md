# Agentopia 🤖

**Gamified AI Agent Office Simulation**

Agentopia is an interactive 3D office environment where AI agents live and work. Built with React and Three.js, it lets you visualize, manage, and interact with AI agents in a beautiful real-time 3D workspace. Click on agents, change their states, hire new ones, or fire underperformers — all in a game-like interface.

> **Note:** This is the frontend-only MVP. Backend integration is planned for the next phase.

---

## Features

- 🏢 **Full 3D Office Environment** — Realistic office with workstations, meeting rooms, lounge area, plants, and artwork — all rendered with Three.js
- 🤖 **Animated AI Agents** — Procedurally generated robot characters with floating, spinning, and shaking animations that reflect their current state
- 🎮 **5 Agent States** — Sleeping 😴 · Active ✨ · Thinking 💭 · Working ⚡ · Error ⚠️
- 🖱️ **Interactive Controls** — Click agents to open a detail panel, hover to see names, orbit/zoom/pan the camera freely
- 👥 **Agent Management** — Hire new agents (dynamically added to the 3D scene), fire existing ones, rename agents, change state
- 🔑 **API Key Fields** — Per-agent API key input (ready for backend integration)
- 🎬 **Smooth Animations** — Framer Motion UI transitions + Three.js animation loops

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | 19.0 | UI framework |
| Three.js | 0.183 | 3D rendering engine |
| Zustand | 5.0 | State management |
| Framer Motion | 12 | UI animations |
| Tailwind CSS | 3.4 | Styling |
| React Router | 7.5 | Client-side routing |
| CRACO | 7.1 | CRA config override |

---

## Project Structure

```
Agentopia/project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThreeScene.js        # 3D world — office + robots + animations
│   │   │   ├── AgentHoverMessage.jsx # Hover tooltip
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   ├── WelcomeOverlay.jsx   # Welcome modal on /app
│   │   │   └── ui/
│   │   │       ├── SidePanel.js     # Agent detail & control panel
│   │   │       ├── StatusBadge.js   # State badge component
│   │   │       ├── button.jsx       # shadcn/ui button
│   │   │       ├── input.jsx        # shadcn/ui input
│   │   │       └── toast.jsx        # shadcn/ui toast
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Landing page
│   │   │   ├── AboutPage.jsx        # About page
│   │   │   ├── FeaturesPage.jsx     # Features page
│   │   │   └── SimulationPage.jsx   # Main simulation view
│   │   ├── store/
│   │   │   └── gameStore.js         # Zustand agent state store
│   │   ├── App.js                   # Router + routes
│   │   └── index.js                 # Entry point
│   ├── public/
│   ├── .env                         # Local environment variables
│   ├── .env.example                 # Example env variables
│   ├── package.json
│   └── craco.config.js
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ (LTS recommended) |
| npm / yarn | yarn 1.22+ |

---

## Setup & Run

```bash
# 1. Navigate to the frontend
cd Agentopia/project/frontend

# 2. Install dependencies
yarn install

# 3. Copy env file
copy .env.example .env

# 4. Start the dev server
yarn start
```

The app will open at **http://localhost:3000**

| Route | Description |
|---|---|
| `/` | Landing page |
| `/features` | Feature overview |
| `/about` | About page |
| `/app` | 3D simulation |

### Production Build

```bash
yarn build
# Output: frontend/build/
```

---

## Controls (in the simulation)

| Action | Result |
|---|---|
| Left-click drag | Rotate camera |
| Right-click drag | Pan camera |
| Scroll wheel | Zoom in/out |
| Click on a robot | Open agent side panel |
| Hover over a robot | See agent name tooltip |
| **Hire Agent** button | Add a new robot to the scene |
| **Fire Agent** in panel | Remove the selected agent |

---

## Backend Integration Plan

The following features are planned for the backend phase:

### REST API Endpoints Needed

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/agents` | GET | Load all agents on startup |
| `/api/agents` | POST | Create/hire a new agent |
| `/api/agents/:id` | PATCH | Update name, state, API key |
| `/api/agents/:id` | DELETE | Fire an agent |
| `/api/agents/:id/run` | POST | Trigger an agent task |

### Where to Integrate in Code

| File | Integration Point |
|---|---|
| `store/gameStore.js` | Replace hardcoded mock agents with API calls |
| `components/ui/SidePanel.js` | PATCH agent on name/state/key save |
| `pages/SimulationPage.jsx` | Add agent via POST instead of local `addAgent()` |
| `ThreeScene.js` | WebSocket listener to push live state changes into scene |

### WebSocket / Real-Time

- Agent state changes from the server should push into Zustand via a WebSocket connection
- `useEffect` + WebSocket in `gameStore.js` or a new `useAgentSocket.js` hook

### Environment Variable

When you add a backend, set in `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Functional vs. Visual (Current State)

| Feature | Status |
|---|---|
| 3D office rendering | ✅ Fully functional |
| Robot animations | ✅ Fully functional |
| Click/hover interaction | ✅ Fully functional |
| Camera orbit controls | ✅ Fully functional |
| Side panel (open/close) | ✅ Fully functional |
| State buttons (sleeping/active/etc.) | ✅ Visual only (local state) |
| Hire Agent | ✅ Adds robot to 3D scene (local) |
| Fire Agent | ✅ Removes robot from 3D scene (local) |
| Rename Agent | ✅ Local only |
| API Key field | 🔜 Stored locally — backend needed to use |
| Agent task execution | 🔜 Needs backend |
| Persistent agent data | 🔜 Needs backend + DB |

---

## License

MIT
