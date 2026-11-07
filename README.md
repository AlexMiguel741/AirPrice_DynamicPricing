# AirPrice: AI Dynamic Pricing Simulator

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/LLM-Gemini%202.5%20Flash-8E75B2?logo=googlegemini&logoColor=white)
![Grounding](https://img.shields.io/badge/Google%20Search-grounding-4285F4?logo=google&logoColor=white)

A pricing assistant for short-term rental hosts. Enter a location and dates, and the app uses
an LLM (Google Gemini) to return a suggested nightly price, a demand analysis, comparable
listings and a revenue projection, with an explanation for every price change.

## Features

- **Price recommendations** per date, with the reasoning behind them
- **Demand analysis** for the selected location and period
- **Competitor view**: list and map of comparable listings
- **Listing audit** with improvement suggestions
- **Charts** for price trends and projected revenue

## Tech Stack

React 19 · TypeScript · Vite · Recharts · Google Gemini API (`@google/genai`)

## Architecture

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
