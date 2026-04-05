/**
 * Service for fetching real routes using OSRM (Open Source Routing Machine).
 */

export async function fetchRealRoute(start: [number, number], end: [number, number], profile: 'foot' | 'bike' | 'car' = 'foot') {
  try {
    // OSRM expects [lng, lat]
    const url = `https://router.project-osrm.org/route/v1/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      // OSRM returns [lng, lat], we need [lat, lng] for Leaflet
      return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching real route:", error);
    return null;
  }
}

/**
 * Geocodes a location name using Nominatim (OpenStreetMap).
 */
export async function geocodeLocation(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AccessibilityApp/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
    }
    
    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
}
