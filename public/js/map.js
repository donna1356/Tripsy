// Wait for the page to fully load and ensure mapboxgl is available
window.addEventListener('load', function() {
  // Check if mapboxgl is defined
  if (typeof mapboxgl === 'undefined') {
    console.error('Mapbox GL JS library not loaded');
    return;
  }

  mapboxgl.accessToken = mapToken;

  if (listing.geometry && Array.isArray(listing.geometry.coordinates)) {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: listing.geometry.coordinates,
      zoom: 9,
    });

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat(listing.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`
        )
      )
      .addTo(map);
  } else {
    console.error("Listing has no valid geometry. Map cannot be shown.");
  }
});