## 📾 MenuPage

**URL:**
`/menu/:restaurantId/:locationId/:menuId`

---

### 📥 Required Params:

- `restaurantId`
- `locationId`
- `menuId`

---

### 📏 On Load:

- Validate `menuId` exists and belongs to the current restaurant + location
- Fetch `menu` and `menuItems` from API (or hydrate from cache)
- Group menu items by section (e.g., "Drinks", "Burgers")
- Observe item-level `isAvailable` and location-based availability rules
- Set active section in state (default to first)

---

### 🧠 State Used or Updated:

- `restaurant` (should already exist from welcome flow)
- `menu` (structure, categories, rules)
- `menuItems` (with real-time availability)
- `cart` (if item is added)

---

### 🧹 Page Components:

| Component           | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `MenuSectionList`   | Scrollable list of section names (e.g., Drinks, Meals) |
| `MenuItemCard`      | Shows name, image, price, quick add button             |
| `MenuItemModal`     | Opens when card is tapped, shows details + modifiers   |
| `UnavailableBanner` | Shown if no items available in current menu            |
| `ViewCartButton`    | Floating button, sticky at bottom when cart has items  |

---

### ➕ User Actions:

- Tap item → open `MenuItemModal`
- Select modifiers / quantity → add to cart
- Scroll through sections
- Tap View Cart → `/cart`

---

### ⚠️ On Error:

- If `menuId` is invalid or fetch fails: show fallback or redirect to `/welcome`
- If no items available: show “No items available right now” state

---

### 🔄 Redirects:

- None by default
  (User stays here unless they explicitly go to cart)

---

### 🔧 Notes:

- Allow graceful recovery if user reloads page (menu data should persist or be rehydrated)
- If feature toggled: optionally show allergen filter, dietary icons, or badges
- Menu can be long — ensure performance via memoization and virtualization if needed

---

### 🧠 Potential Enhancements (Future Proofing)

- Real-time availability toggle from kitchen reflects here (e.g., “Sold Out”)
- Support for **multiple menus** at once (e.g., Breakfast + Drinks)
- Personalized sorting (when AI agent support lands)
