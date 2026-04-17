/entry
↓
/menu
↓
/cart
↓
/checkout
↓
/status/:orderId

## 🔍 Page-by-Page Quick Notes

| Page         | Notes                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entry**  | Simple page but should record `orderOrigin` from QR. Needs to validate origin and handle missing/invalid cases.                                               |
| **Menu**     | Needs data fetching boundary, support for multiple menus based on rules. Should break into `MenuView`, `MenuItemCard`, and `MenuItemModal`.                   |
| **Cart**     | Likely holds too much shared state. Should derive cart items from order origin + menu, and allow safe defaults. Modular `CartItem`, `CartSummary` components. |
| **Checkout** | Complex logic — needs validations, error handling, and retry for payment. Split into `CheckoutForm`, `PaymentHandler`, `OrderSubmit`.                         |
| **Status**   | Needs to poll or stream (via WebSocket or polling) order status. Gracefully handle missing order ID or expired states.                                        |
