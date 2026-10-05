import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers, Navigation, RefreshCw, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getRiskBadgeConfig, getActionRecommendation } from '../../utils/riskColor';
import { formatAssetType } from '../../utils/formatters';

export const InfrastructureMap = ({
  assets = [],
  selectedAssetId,
  onSelectAsset,
  height = '500px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('ALL');
  const [mapReady, setMapReady] = useState(false);

  // Normalize assets list and filter safely
  const safeAssets = Array.isArray(assets) ? assets : [];
  const visibleAssets = safeAssets.filter((a) => {
    if (!a) return false;
    if (activeLayer === 'ALL') return true;
    if (activeLayer === 'CRITICAL') return a.risk_level === 'CRITICAL';
    if (activeLayer === 'HIGH') return a.risk_level === 'HIGH';
    if (activeLayer === 'ROADS') return a.asset_type === 'road';
    if (activeLayer === 'STREETLIGHTS') return a.asset_type?.startsWith('streetlight');
    if (activeLayer === 'BRIDGES') return a.asset_type?.startsWith('bridge');
    return true;
  });

  // Helper to extract valid [lat, lng] from any asset format
  const getCoordinates = (asset) => {
    if (!asset) return null;
    let lat = null;
    let lng = null;

    if (asset.latitude !== undefined && asset.longitude !== undefined) {
      lat = parseFloat(asset.latitude);
      lng = parseFloat(asset.longitude);
    } else if (Array.isArray(asset.coordinates) && asset.coordinates.length >= 2) {
      lat = parseFloat(asset.coordinates[0]);
      lng = parseFloat(asset.coordinates[1]);
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return null;
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: NCR / North Zone or Bangalore
      const defaultCenter = [28.5355, 77.3910];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false, // We'll add custom styled controls or default
        attributionControl: false,
      });

      // Add OpenStreetMap raster tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution control in bottom right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>')
        .addTo(map);

      // Markers layer group
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Render markers whenever visibleAssets or selectedAssetId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const bounds = [];

    visibleAssets.forEach((asset) => {
      const coords = getCoordinates(asset);
      if (!coords) return;

      bounds.push(coords);
      const isSelected = asset.asset_id === selectedAssetId;
      const isCritical = asset.risk_level === 'CRITICAL';
      const isHigh = asset.risk_level === 'HIGH';
      const isMedium = asset.risk_level === 'MEDIUM';

      const color = isCritical
        ? '#DC2626'
        : isHigh
        ? '#EA580C'
        : isMedium
        ? '#D97706'
        : '#168A44';

      const badgeLabel = asset.risk_level || (isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW');
      const actionText = asset.recommended_action || getActionRecommendation(badgeLabel);

      // Custom HTML Marker using pure CSS/SVG
      const markerHtml = `
        <div class="cursor-pointer transition-transform duration-200 transform ${isSelected ? 'scale-125' : 'hover:scale-110'}" style="position: relative;">
          <div style="
            width: ${isSelected ? '24px' : '18px'};
            height: ${isSelected ? '24px' : '18px'};
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${isSelected ? '<div style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></div>' : ''}
          </div>
          ${isSelected ? `
            <div style="
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: #126B37;
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
              white-space: nowrap;
              margin-bottom: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${asset.asset_id}
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'civicflow-map-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(coords, { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #168A44;">
              ${asset.asset_id}
            </span>
            <span style="
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              padding: 1px 5px;
              border-radius: 3px;
              color: white;
              background-color: ${color};
            ">
              ${badgeLabel}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #1A1A1A; margin-bottom: 2px;">
            ${asset.name || 'Unnamed Asset'}
          </div>
          <div style="font-size: 11px; color: #5F6368; margin-bottom: 6px;">
            ${formatAssetType(asset.asset_type)} • Cond: ${Number(asset.condition_score || 0).toFixed(0)}/100
          </div>
          <div style="font-size: 11px; background: #F7F8FA; border: 1px solid #DDE1E5; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px;">
            <strong>Action:</strong> ${actionText}
          </div>
          <button id="btn-inspect-${asset.asset_id}" style="
            width: 100%;
            padding: 5px 8px;
            background: #126B37;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            Inspect Decision Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { offset: [0, -10] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${asset.asset_id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectAsset) onSelectAsset(asset.asset_id);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectAsset) onSelectAsset(asset.asset_id);
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Fit map bounds to encompass all visible markers
    if (bounds.length > 0) {
      try {
        const latLngBounds = L.latLngBounds(bounds);
        map.fitBounds(latLngBounds, { padding: [40, 40], maxZoom: 14 });
      } catch (err) {
        console.warn('Could not fit map bounds:', err);
      }
    }
  }, [visibleAssets, selectedAssetId, mapReady]);

  // Pan to selected asset if selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedAssetId) return;
    const target = safeAssets.find((a) => a.asset_id === selectedAssetId);
    const coords = getCoordinates(target);
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
    }
  }, [selectedAssetId]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const coordsList = visibleAssets.map(getCoordinates).filter(Boolean);
    if (coordsList.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(coordsList), { padding: [40, 40] });
    }
  };

  return (
    <div className="gov-card p-0 overflow-hidden bg-white border border-[#DDE1E5] flex flex-col rounded shadow-xs" style={{ height }}>
      {/* Top Map Console Bar */}
      <div className="p-3 bg-[#F7F8FA] border-b border-[#DDE1E5] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#168A44]" />
          <span className="font-semibold text-[#1A1A1A]">
            Geospatial Infrastructure Map
          </span>
          <span className="text-xs text-[#5F6368] font-mono">
            ({visibleAssets.length} mapped assets)
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HIGH', label: 'High Risk' },
            { id: 'ROADS', label: 'Roads' },
            { id: 'STREETLIGHTS', label: 'Streetlights' },
            { id: 'BRIDGES', label: 'Bridges' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                activeLayer === layer.id
                  ? 'bg-[#126B37] text-white font-medium shadow-xs'
                  : 'bg-white text-[#5F6368] hover:bg-gray-100 border border-[#DDE1E5]'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Interactive Leaflet Map Canvas */}
      <div className="relative flex-1 w-full min-h-0 bg-[#E2E8F0]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Custom Navigation Controls Overlay */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col space-y-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 bg-white text-[#1A1A1A] hover:bg-gray-100 rounded border border-[#DDE1E5] shadow-xs flex items-center justify-center text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 bg-white text-[#1A1A1A] hover:bg-gray-100 rounded border border-[#DDE1E5] shadow-xs flex items-center justify-center text-xs font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleResetView}
            className="w-7 h-7 bg-white text-[#5F6368] hover:text-[#168A44] hover:bg-gray-100 rounded border border-[#DDE1E5] shadow-xs flex items-center justify-center"
            title="Reset to Fit All Pins"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] text-[11px] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded border border-[#DDE1E5] shadow-sm flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>Critical (≥75)</span>
          </span>
          <span className="flex items-center space-x-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>High (50-74)</span>
          </span>
          <span className="flex items-center space-x-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Medium (25-49)</span>
          </span>
          <span className="flex items-center space-x-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block" />
            <span>Low (0-24)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureMap;
