/**
 * Utilities for Real-Time Geolocation, Distance Calculation,
 * Municipal Wards, and Reverse Geocoding for CivicFlow.
 */

export const MUNICIPAL_WARDS = [
  {
    id: "Ward 4",
    name: "Ward 4 (North Sector & Central)",
    district: "North & Central District",
    coordinates: [12.9716, 77.5946],
    keyLocations: [
      "Central Arterial Corridor - Segment 4",
      "Usha Martin Turning Road",
      "Metro Pillar 128 Approach",
      "Ward 4 Community Link Road",
      "North Sector Commercial Avenue"
    ]
  },
  {
    id: "Ward 9",
    name: "Ward 9 (South Industrial Zone)",
    district: "South District",
    coordinates: [12.9352, 77.6245],
    keyLocations: [
      "Industrial Outer Ring Road",
      "Ring Road Interchange Junction 4",
      "South Zone Flyover Approach",
      "Industrial Sector 3 Freight Bypass"
    ]
  },
  {
    id: "Ward 2",
    name: "Ward 2 (Central Commercial District)",
    district: "Central District",
    coordinates: [12.9804, 77.5852],
    keyLocations: [
      "Market Access Link Road - Junction B",
      "Central Market Square",
      "Town Hall Link Avenue",
      "Commercial Crossroad 3"
    ]
  },
  {
    id: "Ward 7",
    name: "Ward 7 (East Commercial Sector)",
    district: "East District",
    coordinates: [12.9892, 77.6412],
    keyLocations: [
      "Collector Road 8, Sector 5",
      "East Colony Main Road",
      "Sector 5 Crossroads",
      "Residential Crossroad 12"
    ]
  },
  {
    id: "Ward 11",
    name: "Ward 11 (West Suburbs)",
    district: "West District",
    coordinates: [12.9611, 77.5385],
    keyLocations: [
      "Transit Feeder Boulevard - West Extension",
      "Suburban Bus Terminal Approach",
      "West Link Ring Road",
      "Sector 11 Community Link"
    ]
  },
  {
    id: "Ward 12",
    name: "Ward 12 (South Canal Crossing)",
    district: "South District",
    coordinates: [12.9214, 77.5810],
    keyLocations: [
      "Canal Cross Bridge - South Span Abutment",
      "River Canal Link Road",
      "South Canal Checkpoint",
      "Bridge Approach Boulevard"
    ]
  }
];

/**
 * Calculate the great-circle distance between two points in km using Haversine formula
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
};

/**
 * Format distance in human friendly terms
 */
export const formatDistance = (distKm) => {
  if (distKm == null || isNaN(distKm)) return null;
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters}m away`;
  }
  return `${distKm.toFixed(1)} km away`;
};

/**
 * Find the closest municipal ward to a given coordinate pair
 */
export const findClosestWard = (lat, lon) => {
  if (lat == null || lon == null) return { ward: MUNICIPAL_WARDS[0], distance: null };

  let closestWard = MUNICIPAL_WARDS[0];
  let minDistance = Infinity;

  for (const ward of MUNICIPAL_WARDS) {
    const dist = calculateDistanceKm(lat, lon, ward.coordinates[0], ward.coordinates[1]);
    if (dist != null && dist < minDistance) {
      minDistance = dist;
      closestWard = ward;
    }
  }

  // If user is far from the base seed wards (> 60 km, e.g. in Ranchi or other cities),
  // return a realistic local area descriptor rather than forcing a distant Bangalore ward.
  if (minDistance > 60) {
    return {
      ward: {
        id: "LOCAL_VICINITY",
        name: "Your Local Area",
        district: "Local Jurisdiction",
        coordinates: [lat, lon],
        isLocal: true,
        keyLocations: [
          "Local Main Arterial Corridor",
          "Market Access Link",
          "Industrial Connection Road",
          "Residential Sector Crossroads",
          "Transit Feeder Avenue"
        ]
      },
      distance: 0.2
    };
  }

  return {
    ward: closestWard,
    distance: minDistance === Infinity ? null : minDistance
  };
};

/**
 * Reverse geocode latitude and longitude to get human-readable locality name
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      {
        headers: {
          Accept: 'application/json'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Geocoding response not ok');
    const data = await res.json();
    const addr = data.address || {};
    
    // Choose the best specific local name
    const shortName =
      addr.suburb ||
      addr.neighbourhood ||
      addr.road ||
      addr.residential ||
      addr.commercial ||
      addr.city ||
      addr.town ||
      addr.village ||
      data.display_name?.split(',')[0] ||
      `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;

    const cityOrDistrict = addr.city || addr.town || addr.county || addr.state_district || '';
    const fullArea = [shortName, cityOrDistrict].filter(Boolean).join(', ');

    return {
      displayName: data.display_name,
      shortName,
      fullArea,
      city: cityOrDistrict,
      raw: data
    };
  } catch (err) {
    console.warn('Reverse geocode fallback:', err.message);
    return null;
  }
};

/**
 * Anchor the demonstration area and issue network around the user's real GPS position
 * so issues are truly local (300m - 2 km away) and labeled with their real locality (e.g. Angara, Ranchi).
 */
export const getLocalizedWardsAndComplaints = (userCoords, baseComplaints = [], baseAssets = [], addressInfo = null) => {
  if (!userCoords || !Array.isArray(userCoords) || userCoords.length !== 2) {
    return {
      wards: MUNICIPAL_WARDS,
      complaints: baseComplaints.map(c => ({
        ...c,
        distanceKm: null,
        areaName: c.ward
      })),
      assets: baseAssets
    };
  }

  const [userLat, userLon] = userCoords;
  const distToBase = calculateDistanceKm(userLat, userLon, 12.9716, 77.5946);

  // If user is near default region (< 60 km), keep native coordinates and compute distance
  if (distToBase != null && distToBase < 60) {
    return {
      wards: MUNICIPAL_WARDS,
      complaints: baseComplaints.map(c => {
        const d = c.coordinates ? calculateDistanceKm(userLat, userLon, c.coordinates[0], c.coordinates[1]) : null;
        return {
          ...c,
          distanceKm: d,
          areaName: c.ward
        };
      }),
      assets: baseAssets.map(a => {
        const lat = a.latitude != null ? a.latitude : (a.coordinates ? a.coordinates[0] : null);
        const lon = a.longitude != null ? a.longitude : (a.coordinates ? a.coordinates[1] : null);
        const d = (lat != null && lon != null) ? calculateDistanceKm(userLat, userLon, lat, lon) : null;
        return {
          ...a,
          distanceKm: d
        };
      })
    };
  }

  // User is in a different city/locality (e.g. Angara, Ranchi).
  // Generate realistic local areas using their actual city / neighborhood name!
  const localityName = addressInfo?.shortName || 'Local Area';
  const fullLocality = addressInfo?.fullArea || localityName;

  // Realistic municipal sector offsets around user GPS:
  // 0.003 deg is ~330m, 0.01 deg is ~1.1 km
  const areaMapping = {
    "Ward 4": { id: "SEC_CENTRAL", label: "Central Corridor", dLat: 0.0035, dLon: -0.0028 }, // ~450m
    "Ward 7": { id: "SEC_EAST", label: "East Sector", dLat: 0.0042, dLon: 0.0038 }, // ~550m
    "Ward 2": { id: "SEC_MARKET", label: "Commercial Market Area", dLat: -0.0038, dLon: 0.0025 }, // ~500m
    "Ward 9": { id: "SEC_INDUSTRIAL", label: "Industrial Link Zone", dLat: -0.0082, dLon: -0.0055 }, // ~1.1 km
    "Ward 11": { id: "SEC_WEST", label: "West Suburbs", dLat: -0.0068, dLon: -0.0110 }, // ~1.4 km
    "Ward 12": { id: "SEC_CANAL", label: "Canal & River Link", dLat: -0.0120, dLon: 0.0060 } // ~1.5 km
  };

  const localizedWards = MUNICIPAL_WARDS.map((w) => {
    const meta = areaMapping[w.id] || { id: w.id, label: w.id, dLat: 0.002, dLon: 0.002 };
    return {
      id: w.id,
      sectorId: meta.id,
      name: `${localityName} (${meta.label})`,
      shortLabel: meta.label,
      district: addressInfo?.city || localityName,
      coordinates: [userLat + meta.dLat, userLon + meta.dLon],
      keyLocations: [
        `${localityName} Main Corridor`,
        `${localityName} Commercial Crossroad`,
        `${localityName} Feeder Link`,
        ...w.keyLocations
      ]
    };
  });

  const localizedComplaints = baseComplaints.map((c) => {
    const meta = areaMapping[c.ward] || { dLat: 0.002, dLon: 0.002, label: "Local Sector" };
    const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const microLat = ((hash % 7) - 3) * 0.0006;
    const microLon = (((hash * 3) % 7) - 3) * 0.0006;
    const complaintLat = userLat + meta.dLat + microLat;
    const complaintLon = userLon + meta.dLon + microLon;
    const dist = calculateDistanceKm(userLat, userLon, complaintLat, complaintLon);

    return {
      ...c,
      coordinates: [complaintLat, complaintLon],
      latitude: complaintLat,
      longitude: complaintLon,
      distanceKm: dist,
      areaName: `${localityName} (${meta.label})`,
      location: `${localityName} (${meta.label})`,
      ward: `${localityName} (${meta.label})`,
      shortArea: meta.label
    };
  });

  const wardKeys = Object.keys(areaMapping);
  const localizedAssets = baseAssets.map((a, idx) => {
    const mappedKey = wardKeys[idx % wardKeys.length];
    const meta = areaMapping[mappedKey] || { dLat: 0.003, dLon: 0.003, label: "Monitored Zone" };
    const hash = (a.asset_id || `A${idx}`).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const microLat = ((hash % 5) - 2) * 0.0008;
    const microLon = (((hash * 2) % 5) - 2) * 0.0008;
    const assetLat = userLat + meta.dLat + microLat;
    const assetLon = userLon + meta.dLon + microLon;
    const dist = calculateDistanceKm(userLat, userLon, assetLat, assetLon);

    return {
      ...a,
      coordinates: [assetLat, assetLon],
      latitude: assetLat,
      longitude: assetLon,
      distanceKm: dist,
      areaName: `${localityName} (${meta.label})`,
      location: `${localityName} (${meta.label})`
    };
  });

  return {
    wards: localizedWards,
    complaints: localizedComplaints,
    assets: localizedAssets
  };
};
