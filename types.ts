
export interface DailyPricing {
  date: string;
  price: number;
  demandLevel: 'Low' | 'Medium' | 'High' | 'Peak';
  reason: string;
  occupancyProbability: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Competitor {
  name: string;
  price: number;
  rating: number;
  reviews: number;
  distance: string;
  features: string[]; // Key features matched (e.g. "2 Bed", "Pool")
  coords?: Coordinates;
  url?: string;         // Link to the real listing
  platform?: 'Airbnb' | 'Booking' | 'Vrbo' | 'Other';
  matchReason?: string; // Why this specific competitor was chosen (e.g. "Same guest capacity")
  capacity?: string;    // e.g. "4 guests"
  bedrooms?: string;    // e.g. "2 bedrooms"
  isAvailable?: boolean; // Is it actually bookable for these dates?
  dataConfidence?: 'Verified' | 'High' | 'Medium' | 'Estimated'; // How sure is the AI about this price?
}

export interface MarketMetrics {
  marketOccupancyRate: number;
  competitorAveragePrice: number; // Average of the STRICTLY matched competitors
  activeListingsInArea: number;
  searchVolume: 'Low' | 'Normal' | 'High' | 'Very High';
}

export interface SourceUrl {
  title: string;
  uri: string;
}

export interface ListingDetails {
  title: string;
  location: string;
  detectedAddress?: string; // The official address found by geocoding
  detectedFeatures: string[];
  capacity: string;
  currentRating?: number;
  coords?: Coordinates;
}

export interface ImprovementSuggestion {
  category: 'Amenities' | 'Photos' | 'Description' | 'Pricing' | 'Other';
  suggestion: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface CompetitivenessAudit {
  score: number; // 0-100
  marketPosition: 'Budget' | 'Economy' | 'Mid-range' | 'Premium' | 'Luxury';
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: ImprovementSuggestion[];
}

export interface PricingAnalysis {
  listingDetails: ListingDetails; 
  audit: CompetitivenessAudit;    
  dailyBreakdown: DailyPricing[];
  competitors: Competitor[];
  marketMetrics: MarketMetrics;
  summary: {
    recommendedBasePrice: number; // The customized price for THIS apartment
    pricingStrategyLogic: string; // "We added +$20 because you have a pool..."
    averagePrice: number;
    highestPrice: number;
    lowestPrice: number;
    totalProjectedRevenue: number;
    marketOutlook: string;
  };
  sourceUrls?: SourceUrl[];
}

export interface SearchParams {
  listingUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  listingType: 'Entire place' | 'Private room' | 'Shared room';
}

export enum DemandLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Peak = 'Peak'
}
