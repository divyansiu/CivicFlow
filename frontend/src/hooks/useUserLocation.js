import { useState, useEffect, useCallback } from 'react';
import {
  MUNICIPAL_WARDS,
  findClosestWard,
  reverseGeocode,
  calculateDistanceKm
} from '../utils/locationUtils';

export function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
  const [error, setError] = useState(null);
  const [addressInfo, setAddressInfo] = useState(null);
  const [closestWard, setClosestWard] = useState(MUNICIPAL_WARDS[0]);
  const [selectedWard, setSelectedWard] = useState('Ward 4');
  const [distanceToClosestWard, setDistanceToClosestWard] = useState(null);

  const requestLocation = useCallback((isManual = false) => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([latitude, longitude]);
        setStatus('granted');

        // Find nearest municipal ward or local area
        const match = findClosestWard(latitude, longitude);
        setDistanceToClosestWard(match.distance);

        // Reverse geocode to get real city / locality name
        try {
          const geo = await reverseGeocode(latitude, longitude);
          if (geo) {
            setAddressInfo(geo);
            if (match.ward.isLocal) {
              setClosestWard({
                id: "LOCAL_VICINITY",
                name: geo.shortName ? `${geo.shortName} (Local Area)` : 'Your Local Area',
                district: geo.city || 'Local District',
                coordinates: [latitude, longitude],
                isLocal: true
              });
              setSelectedWard('NEAR_2KM');
            } else {
              setClosestWard(match.ward);
              setSelectedWard(match.ward.id);
            }
          } else {
            setAddressInfo({
              shortName: `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
              fullArea: `Near ${match.ward.name}`,
            });
            setClosestWard(match.ward);
            setSelectedWard(match.ward.isLocal ? 'NEAR_2KM' : match.ward.id);
          }
        } catch {
          setAddressInfo({
            shortName: `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
            fullArea: `Near ${match.ward.name}`,
          });
          setClosestWard(match.ward);
          setSelectedWard(match.ward.isLocal ? 'NEAR_2KM' : match.ward.id);
        }
      },
      (err) => {
        console.warn('Geolocation access error:', err.message);
        setStatus('denied');
        setError(err.message || 'Permission denied for location access.');
        // Retain default Ward 4 fallback
        setClosestWard(MUNICIPAL_WARDS[0]);
        if (!selectedWard) {
          setSelectedWard('Ward 4');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [selectedWard]);

  // Immediately request location when opening the site
  useEffect(() => {
    requestLocation(false);
  }, [requestLocation]);

  return {
    coords,
    status,
    error,
    addressInfo,
    closestWard,
    selectedWard,
    setSelectedWard,
    distanceToClosestWard,
    requestLocation,
    wards: MUNICIPAL_WARDS,
  };
}
