<div align="center">

# AfDB Core Frontend — Enterprise Dashboard

### Live Reference Application — Consultancy Proposal Support

<br/>

| | |
|---|---|
| **Prepared By** | [Eng. Depute N.Alphonse, PMP®](https://atradezone.ca/deputenalphonse) |
| **Role** | Senior Web Frontend Developer Consultant (TCIS) |
| **Live Demo** | [afdb-core.atradezone.ca](https://afdb-core.atradezone.ca) |
| **GitHub Org** | [github.com/AfDB-Consultant](https://github.com/AfDB-Consultant) |

</div>

---

## About This Application

> Words on a page can say a lot. Code says more.

This is a **live reference application** built as the core deliverable for **Section 10: Added Value — Live Reference Application** of the consultancy proposal for **Senior Web Frontend Developer Consultant (TCIS)** at the African Development Bank.

Rather than describing capabilities on paper, this application **demonstrates them in practice** — a working, production-deployed enterprise system that evaluators can inspect, interact with, and verify. The accompanying [Technical Documentation](https://afdb-beta.atradezone.ca/docs) and [User Manual](https://afdb-beta.atradezone.ca/docs/user-manual.html) serve as supporting documents for this live reference.

### What This Repo Does

This is the **Core Tier Frontend** — the data-rich enterprise dashboard:

- Data-driven reporting interfaces with charts and visualizations
- CRUD operations for enterprise entities (Projects, Team, Activities)
- Dashboard widgets and KPI displays
- Permission-gated UI components (RBAC)
- Consumes RESTful APIs from `afdb_core_backend`

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 + React 19 |
| **Language** | TypeScript |
| **UI Library** | Ant Design 5 + Tailwind CSS |
| **State** | TanStack React Query |
| **Charts** | Recharts / Ant Design Charts |
| **Forms** | React Hook Form + Yup |
| **CI/CD** | GitHub Actions → Docker Hub → AWS EC2 |

## Live URLs

| Service | URL |
|---------|-----|
| **Enterprise Dashboard** | [https://afdb-core.atradezone.ca](https://afdb-core.atradezone.ca) |
| **Data API** | [https://afdb-core-api.atradezone.ca](https://afdb-core-api.atradezone.ca) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

> **Prerequisites:** Core Backend running on port 4001, Beta Backend on port 4000 (for auth).

## Related Repositories

| Repository | Role | Live URL |
|-----------|------|----------|
| [`afdb_beta_frontend`](https://github.com/AfDB-Consultant/afdb_beta_frontend) | Auth Portal UI | [afdb-beta.atradezone.ca](https://afdb-beta.atradezone.ca) |
| [`afdb_beta_backend`](https://github.com/AfDB-Consultant/afdb_beta_backend) | Authentication Gateway | [afdb-api.atradezone.ca](https://afdb-api.atradezone.ca) |
| [`afdb_core_backend`](https://github.com/AfDB-Consultant/afdb_core_backend) | Data Engine APIs | [afdb-core-api.atradezone.ca](https://afdb-core-api.atradezone.ca) |

## Proposal Reference

This application is the deliverable described in **Section 10: Added Value — Live Reference Application** of the consultancy proposal:

**PROPOSAL FOR CONSULTANCY SERVICES**
**Senior Web Frontend Developer Consultant (TCIS)**
African Development Bank

| Document | Link |
|----------|------|
| **Consultancy Proposal** | [PROPOSAL FOR CONSULTANCY SERVICES](https://canva.link/xrt5wv0lx2rcwt5) |
| **Technical Documentation** | [afdb-beta.atradezone.ca/docs](https://afdb-beta.atradezone.ca/docs) |
| **User Manual** | [afdb-beta.atradezone.ca/docs/user-manual.html](https://afdb-beta.atradezone.ca/docs/user-manual.html) |
| **Portfolio** | [atradezone.ca/deputenalphonse](https://atradezone.ca/deputenalphonse) |
| **Curriculum Vitae** | [Canva CV](https://canva.link/wi9a7piqzdscqqg) |

## Contact

**Eng. Depute N.Alphonse, PMP®** — [depute@atradezone.ca](mailto:depute@atradezone.ca) — [Portfolio](https://atradezone.ca/deputenalphonse)

---

<div align="center">*© 2026 Eng. Depute N.Alphonse, PMP®. Open-source reference application.*</div>
