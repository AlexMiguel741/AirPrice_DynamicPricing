
import React, { useEffect, useRef } from 'react';
import { Competitor, ListingDetails } from '../types';
import { MapPin } from 'lucide-react';

interface CompetitorMapProps {
  competitors: Competitor[];
  userListing: ListingDetails;
}

export const CompetitorMap: React.FC<CompetitorMapProps> = ({ competitors, userListing }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;

    // Use user coords or fallback to a default if missing
    const userLat = userListing.coords?.lat || 48.8566;
    const userLng = userListing.coords?.lng || 2.3522;

    // Initialize map if not already done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([userLat, userLng], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);
    } 

    // Always clear existing layers before re-adding
    mapInstance.current.eachLayer((layer: any) => {
        // Keep the tile layer, remove markers
        if (layer instanceof L.Marker) {
            mapInstance.current.removeLayer(layer);
        }
    });

    // Custom Icons
    const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #4f46e5; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.4); position: relative; z-index: 1000;"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const compIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const markers: any[] = [];

    // Add User Marker
    if (userListing.coords) {
        const marker = L.marker([userListing.coords.lat, userListing.coords.lng], { icon: userIcon, zIndexOffset: 1000 })
         .addTo(mapInstance.current)
         .bindPopup(`<b>Your Listing</b><br>${userListing.title || 'Your Location'}`);
        markers.push(marker);
    }

    // Add Competitor Markers
    competitors.forEach((comp) => {
        if (comp.coords && comp.coords.lat && comp.coords.lng) {
            const marker = L.marker([comp.coords.lat, comp.coords.lng], { icon: compIcon })
            .addTo(mapInstance.current)
            .bindPopup(`
                <div style="font-family: 'Inter', sans-serif; font-size: 12px; min-width: 150px;">
                    <strong style="color: #1e293b; display: block; margin-bottom: 2px;">${comp.name}</strong>
                    <span style="color: #4f46e5; font-weight: bold;">€${comp.price}</span> <span style="color: #64748b;">/ night</span><br/>
                    <div style="margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                        <span style="color: #f59e0b;">★</span> 
                        <span style="color: #64748b;">${comp.rating} (${comp.reviews})</span>
                    </div>
                </div>
            `);
            markers.push(marker);
        }
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    } else {
         mapInstance.current.setView([userLat, userLng], 14);
    }

    // Fix map size on container resize
    setTimeout(() => {
        mapInstance.current?.invalidateSize();
    }, 200);

  }, [competitors, userListing]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col z-0 relative">
       <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            Area Analysis
        </h3>
        <span className="text-xs text-slate-500">{competitors.length} Comparables Found</span>
      </div>
      <div className="flex-1 min-h-[300px] relative z-0">
         <div ref={mapRef} className="w-full h-full absolute inset-0 bg-slate-50" style={{ zIndex: 0 }} />
         
         {/* Map Legend Overlay */}
         <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-lg z-[400] text-xs pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white shadow"></div>
                <span className="font-medium text-slate-700">Your Property</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow"></div>
                <span className="font-medium text-slate-700">Direct Competitor</span>
            </div>
         </div>
      </div>
    </div>
  );
};
