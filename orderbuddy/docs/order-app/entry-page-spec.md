## 🚪 EntryPage

**URL:**
`/entry/:restaurantId/:locationId/:originId?name=restaurant-name`

---

### 📥 Required Params:

* `restaurantId`
* `locationId`
* `originId`

---

### 💾 On Load:

* Parse and validate `restaurantId`, `locationId`, `originId`
* Save `orderOrigin` to state
* Fetch `restaurant` metadata from API and cache it
* Determine active `menuId` based on schedule/location rules
* Fetch menu by `menuId` and cache
* Redirect to: `/menu/:restaurantId/:locationId/:menuId`

---

### 🔄 Updates State:

* `orderOrigin`
* `restaurant`
* `menuId`

---

### ⚠️ On Error:

* If invalid origin or restaurant: redirect to `/support` with message
* If no active menu: show "No menu available" fallback with retry

---

### ➡️ Redirect:

* ✅ Success → `/menu/:restaurantId/:locationId/:menuId`
* ❌ Error → `/support` or `/error`
