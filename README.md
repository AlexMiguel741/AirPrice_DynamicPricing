# AirPrice: AI Dynamic Pricing Simulator

A pricing assistant for short-term rental hosts. Enter a location and dates, and the app uses
an LLM (Google Gemini) to return a suggested nightly price, a demand analysis, comparable
listings and a revenue projection, with an explanation for every price change.

## Features

- **Price recommendations** per date, with the reasoning behind them
- **Demand analysis** for the selected location and period
- **Competitor view**: list and map of comparable listings
- **Listing audit** with improvement suggestions
- **Charts** for price trends and projected revenue

## Stack

React 19 · TypeScript · Vite · Recharts · Google Gemini API (`@google/genai`)

## How it works

`services/geminiService.ts`:

1. **Geocodes** the listing address with OpenStreetMap Nominatim to get verified coordinates
2. Calls **Gemini 2.5 Flash with Google Search grounding**, so prices and competitors come
   from live web results; the source URLs are shown in the UI
3. Asks for a **strict JSON schema** (daily prices, demand level, occupancy probability,
   competitors with a confidence flag "Verified" / "Estimated")
4. **Sanitizes and validates** the model output, then enforces the verified coordinates as
   ground truth before rendering tables, charts and the map

## Run locally

Requires Node.js and a Gemini API key.

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```
