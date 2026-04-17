# OrderBuddy

**OrderBuddy** is an AI-native restaurant ordering system designed to streamline QR-based ordering, menu browsing, and real-time order tracking — all through a mobile-first PWA.

This monorepo contains the full system architecture:

## 🧩 Apps Included

- **Order App**: Customer-facing app for browsing menus, placing orders, and tracking status.
- **Manage App**: Restaurant-side dashboard for managing menus and order routing.
- **API**: Shared backend services, database integration, and routing logic.
- **Web**: (Planned).
## 📁 Monorepo Structure

```
src/
  ├── order/     # QR-based customer ordering app
  ├── manage/    # Manager dashboard
  ├── api/       # Backend service layer
  └── web/       # Web app (Planned)

docs/            # Tasks, requirements, architecture, and knowledge base
dev/             # Local dev tools (hooks, Nova, docker)
```

## 🛠 Tech Stack

- **Frontend**: React + Ionic + Tailwind + TypeScript
- **State**: Zustand + TanStack React Query
- **Backend**: NestJS (planned)
- **AI Agents**: Nova (for codegen, PRs, and automation)
- **Observability**: Azure Application Insights for error tracking and telemetry (disabled for now)

## 🧪 Getting Started

### How to install
```bash
git clone git@ssh.dev.azure.com:v3/YOUR_ORG/YOUR_PROJECT/orderbuddy
cd orderbuddy/src/api
yarn install
```
### Copy and configure local environment
```bash
cp .env.example .env
```
### How to start
```bash
yarn dev
```
<!-- 
## 🚀 Tasks & Workflow

All tasks are tracked in [`docs/tasks.md`](docs/tasks.md)  
AI agent Nova will read and complete tasks from this list.

## 🔐 Git Strategy

- `main`: Stable, tagged releases
- `develop`: Active development
- `feature/*`: New features
- `release/*`: Release prep and hotfixes

## 📊 Monitoring & Observability

The project uses Azure Application Insights for error tracking and telemetry:

- **Error Logging**: Automatic tracking of exceptions across the application
- **Performance Monitoring**: API calls, page loads, and custom metrics
- **User Telemetry**: Track feature usage and user journeys

See [Manage App Application Insights Documentation](src/manage/README-APPLICATION-INSIGHTS.md) for setup and usage.

---

Built with ❤️ by Advanced Automations -->