## 💳 CheckoutPage

**URL:**
`/checkout`

---

### 📥 Required State/Context:

- `orderOrigin` (restaurantId, locationId, originId) must be present
- `cart.length > 0`

Use `OrderGuard` to ensure both conditions. Redirect if not met.

---

### 📏 On Load:

- Read cart and order origin from Zustand
- Fetch `restaurant` via TanStack Query (for config like payment/tax settings)
- (Optional) Fetch `location` or payment config if needed separately

---

### 🧠 State Used or Updated:

- `cart`
- `customerInfo` (collected from form: name, phone/email)
- `orderSummary` (derived snapshot)

---

### 🧹 Page Components:

| Component           | Description                                         |
| ------------------- | --------------------------------------------------- |
| `CustomerForm`      | Name, phone, email (optional by restaurant config)  |
| `OrderSummary`      | Final cart view with tax breakdown                  |
| `PaymentHandler`    | Integrates with Gravity Payments to process payment |
| `SubmitOrderButton` | CTA to place the order                              |
| `ErrorAlert`        | Shows API or validation errors                      |

---

### ➕ User Actions:

- Fill out customer info (if required)
- Confirm order
- Submit payment
- See success screen or error

---

### ⚠️ On Error:

- If payment fails: show error toast and allow retry
- If form is incomplete: inline validation
- If cart or order origin is missing: redirect to `/welcome`

---

### ➡️ Redirects:

- On success: `/status/:orderId`
- On failure: stay on page with error message

---

### 🔧 Notes:

- Cart pricing is fixed from snapshot — do not re-query menu for prices
- Order creation and payment must be **atomic** — use single backend API call
- Use optimistic UI only if you can rollback cleanly
- Store `orderId` in state or persist (e.g., localStorage) to support refresh on `/status`

---

### 🧠 Potential Enhancements (Future Proofing)

- Tipping support
- Loyalty code or phone number lookup
- Saved customer profiles (if repeat orders allowed)
- Time slot selection for pickup orders
