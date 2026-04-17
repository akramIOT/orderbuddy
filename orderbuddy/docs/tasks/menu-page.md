# Task ID: menu-page-task

## Title

Scaffold `MenuPage.tsx` layout with header, category blocks, and floating cart summary

## Description

Create a fully functional page component using Ionic and React. This page should represent a menu view for a customer ordering flow.

- Show a sticky header with the restaurant's name or logo
- Render multiple category sections such as "Drinks", "Snacks", "Specials"
- Each section should contain 2–3 dummy menu items using a reusable `MenuItemCard` component
- Add a floating cart summary button (IonFab) at the bottom right
- The layout should be mobile-first and responsive

## Filename

MenuPage.tsx

## Location

src/order/src/pages/MenuPage.tsx

## Hints

- Use Ionic's `IonPage`, `IonHeader`, `IonContent`, and `IonFab`
- Stub category and item data as static arrays
- Use `IonCard` or a styled `div` for each `MenuItemCard`
- Cart button can display "View Cart (2)" for now

## Rules

- Functional components only
- Use TypeScript
- No business logic — layout and static content only
- File should be self-contained
