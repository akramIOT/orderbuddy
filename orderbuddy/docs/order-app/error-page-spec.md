## ⚠️ ErrorPage

**URL:**
`/error` (or `/error?code=invalid-origin`, etc.)

---

### 📥 Optional Query Params:

- `code` (e.g., `invalid-origin`, `menu-unavailable`, `order-expired`)
- `message` (optional override text for display)

---

### 📏 On Load:

- Parse query parameters
- Resolve user-friendly message from error `code`
- Log error context (e.g., via analytics or Sentry)

---

### 🧠 State Used or Updated:

- None (should be fully self-contained)

---

### 🧹 Page Components:

| Component          | Description                          |
| ------------------ | ------------------------------------ |
| `ErrorMessageCard` | Shows resolved user-friendly message |
| `SupportLink`      | Link or button to `/support`         |
| `BackToWelcomeCTA` | Button to return to `/welcome`       |

---

### ➕ User Actions:

- Return to welcome page
- Go to support/help

---

### 🔧 Notes:

- Maintain error code-to-message mapping client-side (e.g., in a utility or enum)
- Safe to land here from any redirect on guard failure, fetch error, or order validation issue
- Page should be minimal but branded

---

### 🧠 Potential Enhancements (Future Proofing)

- Support internationalization (i18n)
- Auto-report error to backend
- Include diagnostic trace or error ID for support
