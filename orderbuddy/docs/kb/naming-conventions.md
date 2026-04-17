# Naming Conventions – TypeScript & MongoDB

These conventions ensure consistency, readability, and long-term maintainability across the OrderBuddy codebase.

---

## 🟦 TypeScript

### ✅ Files & Folders
- **Filenames:** `kebab-case` (e.g., `menu-item.ts`)
- **Folders:** `kebab-case` (e.g., `order-flow/`)

### ✅ Variables & Functions
- `camelCase` for variables and functions
  ```ts
  const orderTotal = calculateTotal(orderItems);
  ```

### ✅ Classes & Types
- `PascalCase` for classes, interfaces, enums, types
  ```ts
  class OrderService {}
  interface MenuItem {}
  type OrderStatus = 'pending' | 'ready';
  ```

### ✅ Constants
- `UPPER_CASE_WITH_UNDERSCORES` for global constants
  ```ts
  const DEFAULT_TAX_RATE = 0.1;
  ```

---

## 🍃 MongoDB

### ✅ Collections
- Use `snake_case`, **plural**
  ```
  menu_items
  orders
  restaurants
  ```

### ✅ Document Fields
- Use `camelCase`
  ```json
  {
    "menuId": "main_menu",
    "itemName": "Iced Coffee",
    "priceCents": 495,
    "createdAt": "2025-04-01T00:00:00Z"
  }
  ```

### ✅ IDs
- Use **readable slugs** in lowercase with underscores where possible
  ```
  tropical_berry
  iced_coffee
  ```

- Use MongoDB ObjectIds when slugs are not appropriate (with fallback suffixing for uniqueness).

### ✅ Timestamps
- Always use **ISO 8601**, stored in **UTC**
  ```
  "createdAt": "2025-04-01T12:30:45Z"
  ```

---

## ✅ Summary Cheat Sheet

| Element             | Convention             | Example              |
|---------------------|------------------------|----------------------|
| TS variables        | `camelCase`            | `orderId`            |
| TS classes/types    | `PascalCase`           | `OrderService`       |
| TS files/folders    | `kebab-case`           | `order-flow/`        |
| Constants (TS)      | `UPPER_CASE`           | `DEFAULT_TIMEOUT`    |
| Mongo collections   | `snake_case plural`    | `menu_items`         |
| Mongo field names   | `camelCase`            | `priceCents`         |
| Mongo IDs (custom)  | `slug_case`            | `iced_coffee`        |
| Timestamps          | ISO 8601 UTC           | `2025-04-01T00:00Z`  |
