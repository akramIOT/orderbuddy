# Infrastructure Plan (Azure + MongoDB)

## Core Principles

- 100% managed services (no dedicated ops team)
- Use of shared environments (`dev`, `staging`, `prod`)
- Monitoring and alerting via Azure Monitor (planned)
- Backed by MongoDB Atlas (dedicated cluster)

## Environment Setup

- Each environment has one App Service Plan
- All apps (API, frontend) run inside the same ASP per env
- Databases isolated by environment

## Stack

- **Frontend**: React + Ionic PWA
- **Backend**: NestJS REST API
- **State Management**: Zustand + React Query
- **Database**: MongoDB Atlas (no serverless)
- **Auth**: SuperTokens (hosted, self-hosting later)
- **CI/CD**: GitHub + Azure DevOps

## Naming Conventions

- Mongo collections: snake_case plural (`menu_items`)
- Fields: camelCase
- IDs: readable, underscored slugs
- Timestamps: ISO 8601 UTC

## Hosting Domains

- Order App: `order.orderbuddyapp.com`
- Manage App: `manage.orderbuddyapp.com`
- API: `api.orderbuddyapp.com`
