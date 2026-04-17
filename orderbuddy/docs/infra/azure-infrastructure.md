# Azure Infrastructure Overview – OrderBuddy

This document outlines the current infrastructure setup and strategy for running OrderBuddy and related services in fully managed mode on Azure.

---

## 🌐 Environment Strategy

We use a **shared environment model** with one App Service Plan per environment:

| Environment | Purpose                     | Notes                       |
| ----------- | --------------------------- | --------------------------- |
| `dev`       | Shared development          | Used by all devs            |
| `staging`   | UAT, demos, Nova validation | Safe pre-production testing |
| `prod`      | Production deployments      | High availability focus     |

> Apps will remain in the shared environment until they exceed 1K users or require isolation.

---

## ☁️ Azure Resources Per Environment

Each environment contains:

- Azure App Service Plan (ASP)
- App Services (API, Background Jobs)
- Azure Storage Account (for static assets)
- Azure OpenAI (via AI Foundry)
- Application Insights (for monitoring)
- Azure DevOps (CI/CD pipeline)

---

## 📦 App Structure

All services follow a monorepo structure. Key apps:

- `order` (Ionic PWA, runs on any device)
- `manage` (Dashboard for restaurants)
- `api` (NestJS backend, business logic + DB)

---

## ✅ Design Principles

- 100% managed services
- Zero dedicated ops
- CI/CD via Azure DevOps
- GitHub Copilot used, but GitHub Actions not in use
- Agent-based development with Nova

## 🧪 Observability & Monitoring

- App Insights wired into App Services
- Goal: add alerting + agent-assisted anomaly detection
- Logs and traces routed per environment

---

## 🔐 Secrets & Access

- Secrets managed via Azure Key Vault or environment variables
- SSH keys configured for Git over HTTPS
- Developer machines: Linux (Ubuntu), VSCode, Azure DevOps CLI

---
