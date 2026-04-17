# OrderBuddy – Project Overview

**Tagline:** Run your restaurant, the smart way.

OrderBuddy is an AI-native SaaS platform for restaurants, food trucks, and coffee shops. It enables smart ordering through QR code-based menus, real-time kitchen routing, and a simple Bring Your Own Device (BYOD) setup.

## Primary Goals

- Simplify order collection and kitchen routing
- Eliminate expensive POS hardware
- Provide real-time updates to customers and staff
- Run on tablets or mobile phones
- Scalable for dine-in, pickup, or food court settings

## Architecture Overview

- **Frontend:** React + Ionic (Order App + Manage App)
- **Backend:** NestJS
- **Database:** MongoDB Atlas (Dedicated Cluster)
- **Auth:** SuperTokens (JWT-based)
- **CI/CD:** GitHub Actions + Azure DevOps
- **Infra:** Azure App Service Plans (ASP), one per environment

## Environments

- `dev`: Shared developer playground
- `staging`: UAT + client demos
- `prod`: Live environment

## Key Partners

- TropicalBerry: First restaurant partner, pilot complete
- Gravity Payments: Payment processor and sales ally

OrderBuddy is launching with version 0 (v0) and validating stability before scaling to 50+ restaurants across WA.
