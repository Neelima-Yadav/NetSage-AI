# NetSage AI

### AI-powered Cisco Packet Tracer Troubleshooting Assistant

NetSage AI is a full-stack troubleshooting workspace that helps learners and network engineers interpret Cisco Packet Tracer symptoms and `show` command output. It produces structured diagnostic findings, recommended Cisco IOS changes, rule-validation evidence, and a human review workflow for validating AI recommendations.

## Project Overview

Network troubleshooting in labs is often iterative and time-consuming: users must correlate symptoms, command output, topology context, and OSI-layer behavior before locating a likely configuration fault. NetSage AI turns that process into a guided, auditable workflow—from diagnosis submission through result review and history reporting.

## Problem Statement

Cisco Packet Tracer users frequently struggle to identify the source of issues such as VLAN mismatches, OSPF adjacency failures, DHCP exhaustion, ACL blocks, NAT configuration errors, and wireless authentication problems. Manual troubleshooting requires familiarity with many commands and a systematic validation process, which can be difficult for learners and slow for operators.

## Solution

NetSage AI accepts a network symptom, Cisco CLI output, topology notes, and a fault category. The FastAPI backend applies deterministic validation rules and returns a structured diagnosis. The React dashboard presents the root cause, confidence, OSI layer, evidence, recommended verification command, remediation commands, and a step-by-step guide. Reviewers can accept, edit, or reject recommendations to preserve human oversight.

## Features

- Diagnose Packet Tracer faults from symptoms, topology notes, and Cisco `show` command output
- Identify likely root causes across VLAN, routing, DHCP, DNS, ACL, NAT, and wireless scenarios
- Show AI confidence, severity, OSI layer, evidence, and rule-validation results
- Generate recommended Cisco IOS configuration changes and follow-up commands
- Track dashboard metrics and diagnosis distributions
- Search and filter diagnostic history by status, concept, severity, and free-text query
- Support human review actions: Accept, Edit, and Reject
- Export diagnostic history from the frontend

## System Architecture

```text
React + Vite Frontend
        |
        | HTTP / JSON
        v
FastAPI Backend
  ├── Diagnose Router      → Diagnosis Service + Rule Validation
  ├── Dashboard Router     → Dashboard Service
  ├── History Router       → History Service
  └── Human Review Router  → Human Review Service
        |
        v
JSON-based diagnosis records
```

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Lucide React |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Data | JSON-based local persistence |
| Tooling | npm, Oxlint |

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/       # FastAPI endpoint modules
│   │   ├── schemas/       # Pydantic request and response models
│   │   ├── services/      # Diagnostic and reporting logic
│   │   ├── data/          # Persisted diagnosis records
│   │   └── main.py        # FastAPI application entry point
│   └── requirements.txt
├── src/
│   ├── components/        # Reusable visualization components
│   ├── layouts/           # Application layout
│   ├── pages/             # Dashboard, diagnosis, result, history, and review pages
│   └── services/          # Frontend API integration layer
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API metadata and service status |
| `GET` | `/health` | Health check |
| `POST` | `/api/diagnose` | Submit a network diagnosis request |
| `GET` | `/api/dashboard` | Retrieve dashboard metrics and distributions |
| `GET` | `/api/history` | Retrieve diagnosis history; supports `status`, `concept_tag`, `severity`, and `search` filters |
| `POST` | `/api/review` | Submit an Accept, Edit, or Reject human review decision |

## Screenshots

> Add project screenshots to `docs/screenshots/` and replace the placeholders below before submission.

| Dashboard | Diagnosis Result |
| --- | --- |
| ![Dashboard placeholder](docs/screenshots/dashboard.png) | ![Diagnosis result placeholder](docs/screenshots/result.png) |

| Human Review | History |
| --- | --- |
| ![Human review placeholder](docs/screenshots/human-review.png) | ![History placeholder](docs/screenshots/history.png) |

## Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm

Clone the repository and install both frontend and backend dependencies:

```bash
git clone <repository-url>
cd problem-stmt
npm install
python -m pip install -r backend/requirements.txt
```

## Running Frontend

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

To create a production build:

```bash
npm run build
```

## Running Backend

From the project root, start FastAPI with Uvicorn:

```bash
uvicorn app.main:app --app-dir backend --reload
```

The API will be available at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

To point the frontend to a different backend URL, set `VITE_API_BASE_URL` before running Vite.

## Future Scope

- Persist diagnostics and reviews in a production database
- Add user authentication and role-based reviewer access
- Integrate LLM-assisted analysis with explainable rule traces
- Support Packet Tracer topology file analysis and device inventory import
- Add real-time collaboration, review queues, and notifications
- Export polished PDF reports and integrate with ticketing systems
- Add automated test coverage, CI/CD, and cloud deployment

## Contributors

Built by the NetSage AI hackathon team.

Add contributor names, roles, and GitHub profiles here before final submission.

## License

License to be specified by the project maintainers. For open-source distribution, the MIT License is a recommended option.
