
import { GoogleGenAI } from "@google/genai";
import { PricingAnalysis, SearchParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Improved Geocoder with smart fallbacks
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number, displayName: string} | null> => {
  
  const fetchCoords = async (queryOrParams: string | URLSearchParams) => {
    try {
      let queryString = '';
      if (typeof queryOrParams === 'string') {
          queryString = `q=${encodeURIComponent(queryOrParams)}`;
      } else {
          queryString = queryOrParams.toString();
      }

      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&${queryString}&addressdetails=1&dedupe=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'AirPriceAI-Pro/1.0' } });
      const data = await res.json();
      
      if (data && data.length > 0) {
        // Prefer specific matches (buildings, houses, highways) over generic administrative boundaries
        const bestMatch = data.find((d: any) => 
            d.class === 'building' || d.class === 'place' || (d.class === 'highway' && d.osm_type !== 'relation') || d.type === 'house'
        ) || data[0];

        return { 
          lat: parseFloat(bestMatch.lat), 
          lng: parseFloat(bestMatch.lon),
          displayName: bestMatch.display_name,
          type: bestMatch.type, // For internal logic if needed
          class: bestMatch.class
        };
      }
    } catch (e) {
      console.error(`Geocoding failed for: ${queryOrParams}`, e);
    }
    return null;
  };

  // CLEANUP: Extract potential city
  const parts = address.split(',');
  const city = parts.length > 1 ? parts[parts.length - 1].trim() : '';
  const streetPart = parts[0].trim();

  // Strategy 1: Exact string provided by user
  let result = await fetchCoords(address);
  // If we got a high-quality match (building/house), return immediately
  if (result && (result.class === 'building' || result.type === 'house')) return result;

  // Strategy 2: Structured Search (More robust for "Via Name, City")
  // Nominatim often prefers structured params
  if (city && streetPart) {
      const params = new URLSearchParams();
      params.append('street', streetPart);
      params.append('city', city);
      const structuredResult = await fetchCoords(params);
      if (structuredResult && (structuredResult.class === 'highway' || structuredResult.class === 'building')) {
          return structuredResult;
      }
      // If structured failed, keep the first result as backup if we have nothing else
      if (!result && structuredResult) result = structuredResult;
  }

  // Strategy 3: Remove House Number (Find the street center)
  // "Via Professor Monteggia 8" -> "Via Professor Monteggia"
  const streetWithoutNumber = streetPart.replace(/\d+.*$/, '').trim();
  if (streetWithoutNumber !== streetPart) {
     const query3 = `${streetWithoutNumber}, ${city}`;
     const res3 = await fetchCoords(query3);
     if (res3) return res3;
  }

  // Strategy 4: Fuzzy Street Name (Remove titles like Professor, San, Dottore)
  // "Via Professor Monteggia" -> "Via Monteggia"
  // This is crucial for user inputs that don't match OSM exact naming
  const words = streetWithoutNumber.split(' ');
  if (words.length > 2 && ['via', 'rue', 'calle', 'viale', 'piazza'].includes(words[0].toLowerCase())) {
      // Create a variation without the second word (Title)
      // e.g. [Via, Professor, Monteggia] -> [Via, Monteggia]
      const simplifiedStreet = `${words[0]} ${words.slice(2).join(' ')}`;
      const query4 = `${simplifiedStreet}, ${city}`;
      const res4 = await fetchCoords(query4);
      if (res4) return res4;
  }

  return result;
};

// Helper function to recursively sanitize JSON data (convert "€150" to 150)
const sanitizeData = (data: any): any => {
    if (typeof data === 'string') {
        return data;
    }
    if (typeof data === 'number') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    if (typeof data === 'object' && data !== null) {
        const cleaned: any = {};
        for (const key in data) {
            const value = data[key];
            // Specific field sanitization for known number fields that AI might mess up
            if (['price', 'rating', 'reviews', 'score', 'marketOccupancyRate', 'competitorAveragePrice', 'activeListingsInArea', 'recommendedBasePrice', 'averagePrice', 'highestPrice', 'lowestPrice', 'totalProjectedRevenue', 'occupancyProbability'].includes(key)) {
                if (typeof value === 'string') {
                    // Remove currency symbols, commas, etc.
                    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
                    cleaned[key] = isNaN(num) ? 0 : num;
                } else {
                    cleaned[key] = value;
                }
            } else {
                cleaned[key] = sanitizeData(value);
            }
        }
        return cleaned;
    }
    return data;
};

export const generatePricingStrategy = async (params: SearchParams): Promise<PricingAnalysis> => {
  // STEP 1: Get Ground Truth Coordinates
  // We fetch the real lat/lng for the address to ensure the map pin is 100% accurate.
  const realCoords = await geocodeAddress(params.location);
  
  const coordinatesContext = realCoords 
    ? `VERIFIED GROUND TRUTH: The user is located at "${realCoords.displayName}" (Lat: ${realCoords.lat}, Lng: ${realCoords.lng}). YOU MUST CENTER ALL MAP ANALYSIS HERE. Do not hallucinate a different location.`
    : `WARNING: Precise geocoding failed for "${params.location}". The user says they are at "${params.location}". Use Google Search to find this street's location.`;

  // Helper to extract month name for search query
  const startMonth = new Date(params.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });

  // STEP 2: Construct AI Prompt
  const prompt = `
    Act as a Senior Revenue Manager and Data Scientist for Short-Term Rentals.
    
    CONTEXT:
    Target Property Address: "${params.location}"
    ${coordinatesContext}
    Target Dates: ${params.startDate} to ${params.endDate} (${startMonth})
    Listing URL: "${params.listingUrl}" (Use this to profile the property)
    User Initial Price Idea: ${params.basePrice} EUR

    YOUR MISSION:
    Perform a strict "Comp Set" analysis. You must find 20 REAL, LIVE, AVAILABLE competitors that are STRUCTURALLY IDENTICAL to the user's listing.
    The user is complaining about "Fake Data", so accuracy is paramount.

    PHASE 1: PROPERTY PROFILING
    - Analyze the User's Listing URL (if real) or infer from the "Listing Type" (${params.listingType}).
    - Identify: Number of guests (Capacity), Number of Bedrooms, Key Amenities.

    PHASE 2: LIVE MARKET SEARCH (STRICT)
    - SEARCH QUERY STRATEGY: Do not just guess. Search for "Booking.com apartments ${params.location} price ${startMonth}", "Airbnb ${params.location} vacation rentals".
    - DATA SOURCE PRIORITY: Prioritize Booking.com, Expedia, and VRBO listings in your search results because they often show public prices more reliably than Airbnb search snippets.
    - AVAILABILITY CHECK: 
      - If a search result says "Sold out", "Not available", or "Closed", EXCLUDE IT.
      - If a listing (like "Verso il lago") is known to be closed, DO NOT use it as a competitor.
      - Only select properties that appear to be accepting bookings for ${startMonth}.
    - FILTER OUT: 
      - If user is "Entire Place", EXCLUDE "Private Rooms".
      - EXCLUDE luxury villas if user is a standard apartment.
    - REQUIRED: Find exactly 20 active competitors.

    PHASE 3: DATA EXTRACTION & CONFIDENCE
    - For each competitor, look for a SPECIFIC PRICE in the search snippet (e.g., "€120").
    - If you find an exact number, mark dataConfidence: "Verified".
    - If you estimate based on "avg price in area", mark dataConfidence: "Estimated".
    - Provide the REAL URL for every competitor found.
    - Try to identify the street or area of the competitor to estimate coordinates.

    PHASE 4: DYNAMIC PRICING CALCULATION
    - Calculate the Average Daily Rate (ADR) of these 20 identical peers.
    - Your "Recommended Base Price" must be derived from THIS specific set.
    
    OUTPUT FORMAT (JSON ONLY):
    IMPORTANT: All numerical fields (price, rating, reviews) MUST be raw numbers. Do NOT include "€" or currency symbols in the JSON values.
    {
      "listingDetails": {
        "title": string,
        "location": string,
        "detectedFeatures": [string],
        "capacity": string,
        "currentRating": number | null,
        "coords": { "lat": number, "lng": number } (Use Verified Ground Truth)
      },
      "audit": {
        "score": number,
        "marketPosition": string,
        "strengths": [string],
        "weaknesses": [string],
        "improvementSuggestions": [
            { "category": "Amenities" | "Photos" | "Description" | "Pricing", "suggestion": string, "impact": "High" | "Medium" | "Low" }
        ]
      },
      "marketMetrics": { 
        "marketOccupancyRate": number, 
        "competitorAveragePrice": number, 
        "activeListingsInArea": number, 
        "searchVolume": "Low" | "Normal" | "High" 
      },
      "competitors": [ 
        { 
          "name": string, 
          "price": number, 
          "rating": number, 
          "reviews": number, 
          "distance": string,
          "features": [string],
          "coords": { "lat": number, "lng": number },
          "url": string,
          "platform": "Airbnb" | "Booking" | "Vrbo",
          "matchReason": string, 
          "capacity": string, 
          "bedrooms": string,
          "isAvailable": boolean, (Must be true)
          "dataConfidence": "Verified" | "Estimated" (Be honest)
        } 
      ], 
      "dailyBreakdown": [ 
        { "date": "YYYY-MM-DD", "price": number, "demandLevel": string, "reason": string, "occupancyProbability": number } 
      ],
      "summary": { 
        "recommendedBasePrice": number,
        "pricingStrategyLogic": string,
        "averagePrice": number, 
        "highestPrice": number, 
        "lowestPrice": number, 
        "totalProjectedRevenue": number, 
        "marketOutlook": string 
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  const sourceUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web?.uri)
    .map(chunk => ({
        title: chunk.web?.title || "Data Source",
        uri: chunk.web?.uri || ""
    })) || [];

  try {
    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '');
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```/, '').replace(/```$/, '');
    }
    
    // Parse JSON
    const rawData = JSON.parse(jsonString);
    
    // Clean data (Sanitization Step)
    const parsedData = sanitizeData(rawData) as PricingAnalysis;
    
    parsedData.sourceUrls = sourceUrls;

    // STEP 3: Enforce Ground Truth
    if (realCoords && parsedData.listingDetails) {
        parsedData.listingDetails.coords = { lat: realCoords.lat, lng: realCoords.lng };
        parsedData.listingDetails.detectedAddress = realCoords.displayName;
    }
    
    // STEP 4: Ensure Competitor Coordinates (Fix for map visibility)
    // If the AI couldn't find the exact GPS of a competitor (common in text-only search),
    // we distribute them spatially around the verified center to ensure the map visualizes the density.
    const centerLat = parsedData.listingDetails.coords?.lat;
    const centerLng = parsedData.listingDetails.coords?.lng;

    if (centerLat && centerLng) {
        parsedData.competitors.forEach((comp, index) => {
            // Check if coords are missing or invalid (0,0) or undefined
            const hasValidCoords = comp.coords && comp.coords.lat !== 0 && comp.coords.lng !== 0 && typeof comp.coords.lat === 'number';
            
            if (!hasValidCoords) {
                // Generate a distributed offset ~500m to 1.5km away
                // Use index to ensure they don't overlap (scatter chart style)
                const angle = (index / parsedData.competitors.length) * 2 * Math.PI; // Spread in a circle
                const radius = 0.004 + (Math.random() * 0.008); // ~400m to 1.2km radius (approx)
                
                comp.coords = {
                    lat: centerLat + (Math.sin(angle) * radius * 0.7), // 0.7 factor adjusts for lat/lng aspect ratio in Europe
                    lng: centerLng + (Math.cos(angle) * radius)
                };
            }
        });
    }

    return parsedData;

  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse market data. Please try again.");
  }
};
