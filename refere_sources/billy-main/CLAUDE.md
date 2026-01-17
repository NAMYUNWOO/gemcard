# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

빌리(Billy) is a casual personal loan tracking app built as a Toss mini-app (apps-in-toss). It allows users to record money lent to friends, track repayments, store evidence photos, and send reminder messages.

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Apps-in-Toss Sandbox Testing

1. Install the 앱인토스 샌드박스 app on your device
2. Ensure device and computer are on the same Wi-Fi
3. Run `npm run dev` (server binds to 0.0.0.0:5173)
4. In sandbox app: login → select app → enter server address (e.g., `192.168.x.x:5173`)
5. Access via scheme: `intoss://billy`

**Note**: `TDSMobileAITProvider` requires the apps-in-toss sandbox environment. It will error in regular browsers.

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- Plain HTML/CSS for UI (TDS Mobile components cause errors in WebView)
- IndexedDB for local data persistence
- `@apps-in-toss/web-framework` for Toss mini-app integration
- jsPDF + Canvas API for PDF generation with Korean support

### Key Files

| Path | Purpose |
|------|---------|
| `granite.config.ts` | Apps-in-toss configuration (appName, brand, permissions) |
| `src/lib/db.ts` | IndexedDB CRUD operations for loans |
| `src/lib/imageUtils.ts` | Image compression (800px max, 70% JPEG quality) |
| `src/lib/pdfGenerator.ts` | PDF generation with Korean text (Canvas API) and evidence photos |
| `src/types/loan.ts` | Loan data type definitions |

### Data Flow
- All loan data stored locally in IndexedDB (`billy-db`)
- Evidence photos compressed to Base64 and stored in IndexedDB
- No backend server - fully client-side storage

### Pages
- `/` - Home: loan list with summary
- `/add` - AddLoan: create new loan record
- `/loan/:id` - LoanDetail: view details, mark paid, send reminder

### PDF Sharing Feature
- Uses Canvas API to render Korean text (jsPDF doesn't support Korean fonts natively)
- Creates single-page PDF with dynamic height to include all photos
- Calculates accrued interest based on loan date and annual rate
- Shares via Web Share API

### Known Issues
- `@toss/tds-mobile` components cause "property is not configurable" error in Hermes engine
- Replaced all TDS components with plain HTML elements
- `html2canvas` causes "Unable to open URL: about:blank" error in WebView - use Canvas API directly instead
