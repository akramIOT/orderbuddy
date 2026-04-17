## 📅 StatusPage

**URL:**
`/status/:orderId`

---

### 📥 Required Params:

* `orderId` (from URL)

---

### 📏 On Load:

* Use `orderId` to fetch order details via TanStack Query
* Confirm order belongs to a valid `restaurantId` (for UI branding)
* Display status progression (e.g., `accepted`, `preparing`, `ready`, `cancelled`)
* Start polling or use WebSocket (future) for live updates

---

### 🧠 State Used or Updated:

* `order` (fetched via orderId)
* `restaurant` (used for header, branding)
* `status` (derived from order)

---

### 🧹 Page Components:

| Component           | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `StatusTimeline`    | Shows visual progress bar of order lifecycle         |
| `OrderSummary`      | Shows what was ordered, quantities, total            |
| `RestaurantHeader`  | Branding + location (from restaurant context)        |
| `BackToStartButton` | Takes user back to `/welcome` to place another order |

---

### ➕ User Actions:

* View live order status
* Optionally refresh manually
* Return to welcome screen

---

### ⚠️ On Error:

* If `orderId` is invalid or fetch fails: show error state and offer retry or contact support
* If order expired (e.g., > 2 hours): show expired message with CTA to restart

---

### ➡️ Redirects:

* None unless data is invalid or expired (optional: redirect to `/welcome` with alert)

---

### 🔧 Notes:

* Use `useQuery` with polling (`refetchInterval`) to check status changes
* All order data shown must come from immutable order snapshot
* Consider showing order timestamp + estimated ready time if available

---

### 🧠 Potential Enhancements (Future Proofing)

* WebSocket for push-based status updates
* Customer notification integration (e.g., Web Push)
* Auto-refresh with smooth transitions
* Feedback prompt or rating UI after completion
