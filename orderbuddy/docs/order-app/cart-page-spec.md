## 💼 CartPage

**URL:**
`/cart`

---

### 📥 Required State/Context:

- `orderOrigin` must be set (restaurantId, locationId, originId)
- `cart` must contain at least one item

Use `OrderGuard` to ensure these conditions are met. Redirect to `/welcome` or `/menu` if invalid.

---

### 📏 On Load:

- Read cart from Zustand store
- If cart is empty or origin missing, redirect to `/menu` or `/welcome`
- Fetch `restaurant` and `menu` via TanStack Query if not cached

---

### 🧠 State Used or Updated:

- `cart`
- `menuItems` (used to enrich cart items with name, modifiers)
- `restaurant` (brand info and tax, fees if needed)

---

### 🧹 Page Components:

| Component         | Description                                  |
| ----------------- | -------------------------------------------- |
| `CartItem`        | Displays item, quantity, modifiers, subtotal |
| `CartSummary`     | Subtotal, taxes, total                       |
| `ClearCartButton` | Optional, clears the cart                    |
| `CheckoutButton`  | Primary call to action, goes to `/checkout`  |

---

### ➕ User Actions:

- Edit quantity
- Remove item
- Proceed to checkout

---

### ⚠️ On Error:

- If cart is empty: show "Your cart is empty" with CTA to return to `/menu`
- If required data (menu, restaurant) is missing: trigger fallback query using TanStack Query and rehydrate

---

### ➡️ Redirects:

- If `cart.length === 0` → `/menu`
- If `orderOrigin` is missing → `/welcome`

---

### 🔧 Notes:

- Use `useQuery` hooks for `restaurant` and `menu` hydration
- Cart state stays in Zustand for now
- Enrich cart items using menu data (e.g., show correct name + price even if price changed)
- All price values shown should come from the cart snapshot (not live menu)
- Animate transitions for better UX (e.g., removing items)

---

### 🧠 Potential Enhancements (Future Proofing)

- Promo code support
- Tip selection
- Estimated wait time or pickup window display
