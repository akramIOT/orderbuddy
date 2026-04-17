# Menu System Architecture

OrderBuddy’s menu system is designed to support any type of restaurant. It is schema-compliant, fully self-contained, and easy to manage via UI.

## Design Principles

- Compliant with [schema.org/Menu](https://schema.org/Menu)
- All prices stored in cents (integers)
- Variants, modifiers, and rules are embedded
- No dependency on live menu state after order is placed

## Key Features

- Multiple menus (breakfast, lunch, dinner) supported
- Shared item groups and reusable data allowed
- Menu builder UI will allow easy drag-and-drop editing
- Designed for auto-importing from online menus during onboarding

## MongoDB Strategy

- Collection: `menus`
- Field naming: camelCase
- ID strategy: readable slugs (e.g., `iced_coffee`)
- Menu data is embedded within orders to ensure historical accuracy
