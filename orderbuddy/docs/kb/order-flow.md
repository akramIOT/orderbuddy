# Order Flow and Lifecycle

## Step-by-Step Flow

1. **Customer scans QR (Order Origin)**
2. **Order is created in Order App**
3. **Restaurant receives order in Manage App**
4. **Order is Accepted** (manual or auto)
5. **Routing to Stations** (kitchen, drinks, etc.)
6. **Customer is notified**
7. **Order is marked Ready**
8. **Customer is notified again (if pickup)**

## Concepts

- **Order Origins**: QR locations like tables or parking spots
- **Stations**: Destinations like kitchen displays or printers
- **Auto-Accept**: Can be enabled per restaurant
- **Order Notifications**: Web/in-app preferred; SMS fallback

## Data Model Notes

- Orders are **immutable snapshots** – all pricing, items, tax are stored inline
- Station tags determine routing logic
