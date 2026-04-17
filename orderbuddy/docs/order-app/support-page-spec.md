## 🌊 SupportPage

**URL:**
`/support`

---

### 📥 Optional Query Params:

* `orderId`
* `restaurantId`, `locationId`, `originId`
* `issue` (e.g., `order-not-found`, `invalid-qr`, `payment-failed`)

---

### 📏 On Load:

* Parse query params to pre-fill form or context
* Capture current Zustand state (if available): `restaurantId`, `originId`, `orderId`
* Show support form and fallback options

---

### 🧠 State Used or Updated:

* None required to operate, but can enhance from Zustand if available

---

### 🧹 Page Components:

| Component             | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `SupportForm`         | Text input, contact info (optional), issue description |
| `AutoContextCapture`  | Hidden fields with restaurant/order context            |
| `TroubleshootingTips` | Small FAQ: missing orders, payment questions, etc.     |
| `BackToWelcomeButton` | Returns user to `/welcome`                             |
| `SubmitSupportButton` | Sends support request to backend or support inbox      |

---

### ➕ User Actions:

* Submit support request (optional contact info)
* Read help tips
* Return to welcome page

---

### ⚠️ On Error:

* If form fails to submit: show error toast, retry option
* If no context can be captured: allow manual entry (but don’t block page)

---

### ➡️ Redirects:

* None unless you choose to redirect post-submission to "Thank you" or `/welcome`

---

### 🔧 Notes:

* Should support full fallback if Zustand is wiped (e.g., direct access)
* Email or webhook-based support ticket delivery is fine for v1
* Display a small message like: "Having trouble? We're here to help."

---

### 🧠 Potential Enhancements (Future Proofing)

* AI assistant or chatbot integration (Sparks)
* Support via WhatsApp or SMS
* Feedback routing based on issue type or restaurant config
* Support request lookup via phone number or orderId
