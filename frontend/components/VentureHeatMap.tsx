"use client";

import { useEffect, useRef, useState } from "react";
import type { HeatmapFeature } from "@/lib/api";
import type * as Leaflet from "leaflet";

type Props = {
  features: HeatmapFeature[];
  loading: boolean;
  onCitySelect?: (city: string) => void;
};

// Tooltip state
type TooltipData = {
  x: number;
  y: number;
  props: HeatmapFeature["properties"];
} | null;

export default function VentureHeatmapMap({ features, loading, onCitySelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const heatLayerRef = useRef<unknown>(null);
  const markersLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const circlesRef = useRef<Map<string, Leaflet.CircleMarker>>(new Map());
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  const [mounted, setMounted] = useState(false);

    // Update circle sizes based on zoom level
  const updateCircleSizes = (map: Leaflet.Map) => {
    const zoom = map.getZoom();
    const zoomFactor = Math.max(0.6, zoom / 2.5);
    
    circlesRef.current.forEach((circle) => {
      const originalRadius = (circle as any)._originalRadius || 8;
      circle.setRadius(Math.min(originalRadius * zoomFactor, 28));
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      
      // Fix leaflet default icon path
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!, {
        zoomControl: false  // Disable default zoom control
      }).setView([20, 0], 2);
      mapInstanceRef.current = map;

      // Add custom zoom control positioned lower
      L.control.zoom({
        position: 'topleft'
      }).addTo(map);

      // Dark CARTO tile layer - matches obsidian #030712
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        minZoom: 1,
      }).addTo(map);

      // Try heatmap layer, fallback to circle markers
            // ============================================
      // PART 1: HEATMAP LAYER
      // ============================================
      try {
        const HeatLayer = (await import("leaflet.heat")).default;
        if (features.length > 0 && HeatLayer) {
          const points = features.map((f) => [
            f.geometry.coordinates[1],
            f.geometry.coordinates[0],
            Math.min(f.properties.weight, 1.0),
          ]);
          // @ts-ignore
          L.heatLayer(points, {
            radius: 25,
            blur: 18,
            maxZoom: 10,
            max: 1.0,
            gradient: {
              0.0: "#0a0a14",
              0.2: "#1a0a14",
              0.4: "#3a0a1e",
              0.6: "#8B1A3A",
              0.8: "#C92A5A",
              1.0: "#E8497A",
            },
          }).addTo(map);
          console.log("✅ Heatmap added");
        }
      } catch (err) {
        console.warn("Heatmap not available", err);
      }

      // ============================================
      // PART 2: CITY CLUSTERS (ALWAYS ADD ON TOP)
      // ============================================
      // Group features by city
      const cityGroups = new Map<string, HeatmapFeature[]>();
      features.forEach(f => {
        const cityName = f.properties.city;
        if (!cityGroups.has(cityName)) {
          cityGroups.set(cityName, []);
        }
        cityGroups.get(cityName)!.push(f);
      });
      
      // Create city cluster markers
      cityGroups.forEach((cityFeatures, cityName) => {
        // Calculate center point for the city
        const avgLat = cityFeatures.reduce((sum, f) => sum + f.geometry.coordinates[1], 0) / cityFeatures.length;
        const avgLng = cityFeatures.reduce((sum, f) => sum + f.geometry.coordinates[0], 0) / cityFeatures.length;
        
        // Calculate metrics for this city
        const totalCapital = cityFeatures.reduce((sum, f) => sum + f.properties.amount_usd_m, 0);
        const dealCount = cityFeatures.length;
        const avgDealSize = totalCapital / dealCount;
        
        // Scale circle size by number of deals (8-28px radius)
        const radius = Math.min(28, Math.max(8, Math.sqrt(dealCount) * 4));
        
        // Determine color based on average deal size vs global avg
        const avgPctAbove = cityFeatures.reduce((sum, f) => sum + f.properties.pct_above_avg, 0) / dealCount;
        const clusterColor = avgPctAbove >= 0 ? "#C92A5A" : "#D43D6B";
        
        // Main cluster circle (white border to stand out on heatmap)
        const clusterCircle = L.circleMarker([avgLat, avgLng], {
          radius: radius,
          fillColor: clusterColor,
          color: "#FFFFFF",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.85,
        });
        
        // Store original radius for zoom updates
        (clusterCircle as any)._originalRadius = radius;
        
        // Click handler for city selection
        clusterCircle.on("click", () => {
          console.log(`🔵 City clicked: ${cityName}`);
          if (onCitySelect) {
            onCitySelect(cityName);
          }
          // Visual feedback on click
          clusterCircle.setStyle({ fillOpacity: 1, weight: 5, color: "#FCD34D" });
          setTimeout(() => {
            clusterCircle.setStyle({ fillOpacity: 0.85, weight: 3, color: "#FFFFFF" });
          }, 300);
        });
        
        // Hover tooltip for city summary
        clusterCircle.bindTooltip(`
          <strong style="color: #C92A5A">${cityName}</strong><br/>
          <span style="color: #9CA3AF">Total Capital: </span><strong style="color: #C92A5A">$${(totalCapital / 1000).toFixed(1)}B</strong><br/>
          <span style="color: #9CA3AF">Deals: </span><strong>${dealCount}</strong><br/>
          <span style="color: #9CA3AF">Avg Deal: </span><strong>$${avgDealSize.toFixed(1)}M</strong><br/>
          <span style="color: #FCD34D">✨ Click to view in sidebar</span>
        `, { sticky: true, className: "glass-card" });
        
        clusterCircle.addTo(map);
        circlesRef.current.set(`cluster-${cityName}`, clusterCircle);
        
        // Add smaller individual deal markers (semi-transparent)
        cityFeatures.forEach((f) => {
          const [lng, lat] = f.geometry.coordinates;
          const smallRadius = Math.max(3, Math.min(f.properties.weight * 2, 8));
          const smallColor = f.properties.pct_above_avg >= 0 ? "#C92A5A" : "#D43D6B";
          
          const smallCircle = L.circleMarker([lat, lng], {
            radius: smallRadius,
            fillColor: smallColor,
            color: "#FFFFFF",
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0.3,
          });
          
          smallCircle.on("mouseover", (e: Leaflet.LeafletMouseEvent) => {
            smallCircle.setRadius(smallRadius + 2);
            const point = map.latLngToContainerPoint(e.latlng);
            setTooltip({ x: point.x, y: point.y, props: f.properties });
          });
          
          smallCircle.on("mouseout", () => {
            smallCircle.setRadius(smallRadius);
            setTooltip(null);
          });
          
          smallCircle.addTo(map);
        });
      });
      
      // Apply initial zoom scaling
      updateCircleSizes(map);
      
      // Update circles when zoom changes
      map.on("zoomend", () => updateCircleSizes(map));
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, features, onCitySelect]);

  return (
    <div className="relative w-full h-full" style={{ background: "#030712" }}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/80 z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-pulse border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 tracking-widest uppercase">
              Loading capital data…
            </span>
          </div>
        </div>
      )}

      {/* Map overlay label - positioned next to zoom buttons at same level */}
      <div className="absolute top-[52px] left-16 z-[999] glass-card rounded-lg px-4 py-2.5 pointer-events-none border border-ruby-glow/10">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-ruby-glow/60">
              Capital Formation · Global
            </div>
            <div className="text-[11px] font-semibold text-white">
              {features.length} funding rounds plotted
            </div>
          </div>
          <div className="w-px h-8 bg-ruby-glow/20" />
          <div className="text-[8px] text-gray-500 text-right leading-tight">
            <div>Batch 2</div>
            <div className="text-ruby-glow/40">Infocreon</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[999] glass-card rounded-lg px-3 py-2 pointer-events-none">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5">
          Deal Intensity
        </div>
        <div
          className="h-2 w-32 rounded-full"
          style={{
            background: "linear-gradient(90deg, #1a0a14 0%, #8B1A3A 40%, #C92A5A 70%, #E8497A 100%)",
          }}
        />
        <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Color Legend */}
      <div className="absolute bottom-8 right-4 z-[999] glass-card rounded-lg px-3 py-2 pointer-events-none">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5">
          Deal Status
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#C92A5A]"></div>
            <span className="text-[10px] text-gray-300">Above Avg</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#D43D6B]"></div>
            <span className="text-[10px] text-gray-300">Below Avg</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-[1001] pointer-events-none glass-card rounded-lg px-3 py-2 text-xs max-w-[200px]"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            border: "1px solid #C92A5A",
            boxShadow: "0 0 10px rgba(201,42,90,0.2)",
          }}
        >
          <div className="font-semibold text-white mb-1">{tooltip.props.company}</div>
          <div className="text-gray-400 text-[10px] space-y-0.5">
            <div>{tooltip.props.city}, {tooltip.props.country}</div>
            <div className="text-ruby-glow font-mono">{tooltip.props.amount_display}</div>
            <div>{tooltip.props.stage} · {tooltip.props.sector}</div>
            <div className={tooltip.props.pct_above_avg >= 0 ? "text-cyan-400" : "text-red-400"}>
              {tooltip.props.insight}
            </div>
            <div className="text-gray-600">{tooltip.props.lead_investor}</div>
          </div>
        </div>
      )}
    </div>
  );
}