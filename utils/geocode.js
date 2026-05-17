const geocode = async (location) => {
  if (!location) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    // Add User-Agent as required by Nominatim policy
    const response = await fetch(url, { headers: { 'User-Agent': 'FleetFlow/1.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (error) {
    console.error("Geocoding API failed for", location, error.message);
  }
  return null;
};

module.exports = geocode;
