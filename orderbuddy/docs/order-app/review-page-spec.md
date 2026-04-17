## 📖 ReviewPage

**URL:**
`/review/:orderId`

---

### 📥 Required Params:

- `orderId` (from URL)

---

### 📏 On Load:

- Fetch order details using `orderId` via TanStack Query
- Confirm order is in a completed state (`ready`, `completed`, or `picked_up`)
- Load review form state (if previously saved, optional)

---

### 🧠 State Used or Updated:

- `order` (fetched from backend)
- `restaurant` (for branding)
- `reviewDraft` (optional, if you allow saving in-progress reviews)

---

### 🧹 Page Components:

| Component             | Description                                        |
| --------------------- | -------------------------------------------------- |
| `ReviewForm`          | Collects rating (1–5 stars), optional text comment |
| `OrderSummaryCompact` | Small version of what the user ordered             |
| `RestaurantHeader`    | Displays branding, location info                   |
| `SubmitReviewButton`  | Posts the review to backend                        |
| `ToastMessage`        | Shows success or error after submission            |

---

### ➕ User Actions:

- Select rating (e.g., stars or emoji scale)
- Write optional feedback comment
- Submit review

---

### ⚠️ On Error:

- If `orderId` is invalid: redirect to `/status` or `/welcome`
- If order is not complete: block review and show message
- If review submission fails: show error toast, allow retry

---

### ➡️ Redirects:

- On success: optional "Thank you" state or redirect to `/welcome`

---

### 🔧 Notes:

- Optional: limit review to one per order (enforced backend-side)
- Optionally allow editing a previous review if supported
- You may invite review via SMS, email, or `/status` CTA
- Use optimistic UI with rollback for review submission

---

### 🧠 Potential Enhancements (Future Proofing)

- AI-generated review summaries for restaurants
- Follow-up campaign if user gives low rating
- Trigger support flow for low reviews
