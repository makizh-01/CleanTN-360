# CleanTN 360 – Phase 1 Frontend
Responsive React + Vite frontend prototype for the CleanTN 360 Smart Waste Management & Green Money Ecosystem.

## Included pages
1. Public Home page (includes About, How It Works and Impact sections)
2. Citizen Dashboard
3. Deposit Waste
4. Green Money Wallet
5. My Transactions
6. Collection Points
7. District Insights (38-district directory)
8. Impact & Reports
9. Help & Support

The public home page includes the About, How It Works and Impact sections; the eight citizen-side portal modules are accessible from the responsive sidebar.

## Run locally
Requirements: Node.js 18.18+ (Node 20 LTS recommended) and npm.

```bash
npm install
npm run dev
```
Open the Vite local URL, usually http://localhost:5173.

Build for production:
```bash
npm run build
npm run preview
```

## Phase 1 limitations
- Frontend and demo interactions only. No backend, persistent database or real authentication yet.
- All numbers, charts, transaction rows and collection point records are illustrative demo data.
- QR scan is simulated. Real camera scanning and photo uploads will be integrated in a later phase.
- No real UPI payout. Wallet redemption actions are simulated only.
- Map is a visual demo; live GIS/routing is not connected.
- Reward rates and 100 points = ₹1 are proposed prototype assumptions, not approved rates or a payout guarantee.
- E-waste must be handled through an authorised collection partner.
