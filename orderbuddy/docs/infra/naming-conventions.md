# Azure Naming Conventions

This document outlines the naming conventions used across Azure infrastructure resources for all projects managed under the Advanced Automations organization.

> 🔧 Prefixes like `aa-` are **not used**. Naming starts with environment or project directly.

---

## 🔤 Naming Format

```
<env>-<project>-<component>
```

Where:
- `<env>` = `dev`, `staging`, `prod`
- `<project>` = short project code (e.g., `ob` for OrderBuddy, `ff` for FutureFleets)
- `<component>` = type of resource or subcomponent (e.g., `api`, `order`, `asp`, `storage`, `openai`)

---

## 📘 Examples by Resource Type

| Resource Type             | Example Name              | Notes                          |
|--------------------------|---------------------------|---------------------------------|
| App Service Plan         | `dev-asp`                 | One per environment            |
| App Service (API)        | `dev-ob-api`              | Project-specific               |
| App Service (Web App)    | `prod-ob-order`           | PWA for ordering               |
| Storage Account          | `devobstorage`            | Lowercase only, no dashes      |
| Application Insights     | `staging-ob-api-insights` | Optional per service           |
| Azure OpenAI             | `prod-ob-openai`          | One per project or shared      |
| Key Vault                | `dev-ob-kv`               | Optional                       |
| Container Registry       | `dev-acr`                 | Shared across projects         |

---

## 📁 Folder Structure for Infra Docs

Each environment and project can maintain scoped infra files:

```
docs/
├── infra/
│   ├── azure-infrastructure.md
│   └── naming-conventions.md
└── projects/
    └── orderbuddy/
        └── infra.md
```

---

## 🧠 Tags and Labels

Use consistent Azure tags for filtering and management:

- `project=orderbuddy`
- `env=dev`
- `owner=advancedautomations`
- `managed=true`

---

Let Sparks know if you'd like this rendered as a table or diagram for onboarding or automation purposes.
