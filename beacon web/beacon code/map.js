/**
 * Map Initialization & Logic
 */

let map;
let markers = [];
const DEFAULT_COORDS = [20.5937, 78.9629]; // India Center
const DEFAULT_ZOOM = 5;
let routeLayer = null;
let userMarker = null;
let radiusCircle = null; // Track the 15km radius circle

function initMap() {
    // Initialize Leaflet Map
    map = L.map('map', {
        zoomControl: false, // We'll add custom controls if needed
        attributionControl: false
    }).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

    // Dark Mode Map Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    renderMarkers(PLACES);
}

// Add visible 15km radius circle around user location
function showRadiusCircle(lat, lng, radiusKm = 15) {
    // Remove existing circle if any
    if (radiusCircle) {
        map.removeLayer(radiusCircle);
    }

    // Create new circle
    radiusCircle = L.circle([lat, lng], {
        color: '#00FF94',        // Neon mint (brand color)
        fillColor: '#00FF94',
        fillOpacity: 0.05,       // Very subtle fill
        opacity: 0.4,            // Semi-transparent border
        weight: 2,
        radius: radiusKm * 1000  // Convert km to meters
    }).addTo(map);

    // Fit map to show the entire circle
    map.fitBounds(radiusCircle.getBounds(), { padding: [50, 50] });
}

function createCustomIcon(place) {
    let colorClass = 'green';
    let iconClass = 'ri-restaurant-2-fill';

    // Check if it's a high-priority/recommended spot
    const isRecommended = (place.priorityScore && place.priorityScore > 75);
    const sizeClass = isRecommended ? 'large' : 'standard';

    if (place.status === 'busy') colorClass = 'yellow';
    if (place.status === 'closed') colorClass = 'red';

    if (place.type === 'Cafe') iconClass = 'ri-cup-fill';
    if (place.type === 'Dhaba') iconClass = 'ri-truck-fill';

    const glowHtml = place.status !== 'closed' ? `<div class="pin-glow ${colorClass} ${isRecommended ? 'strong' : ''}"></div>` : '';
    const recommendedBadge = isRecommended ? '<div class="recommended-badge"><i class="ri-star-fill"></i></div>' : '';

    return L.divIcon({
        className: `custom-pin ${sizeClass}`,
        html: `
            ${glowHtml}
            <div class="pin-inner ${colorClass} ${isRecommended ? 'recommended' : ''}">
                <i class="${iconClass}"></i>
                ${recommendedBadge}
            </div>
        `,
        iconSize: isRecommended ? [50, 50] : [40, 40],
        iconAnchor: isRecommended ? [25, 50] : [20, 40]
    });
}

function renderMarkers(data) {
    // Clear existing
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(place => {
        const icon = createCustomIcon(place);
        const marker = L.marker([place.lat, place.lng], { icon: icon }).addTo(map);

        marker.on('click', () => {
            selectPlace(place);
            // Center map on click slightly offset to account for bottom sheet
            map.flyTo([place.lat - 0.005, place.lng], 15, {
                animate: true,
                duration: 1
            });
        });

        markers.push(marker);
    });
}

// Navigation Logic
// Navigation Logic
async function startNavigation(destLat, destLng, userLat = null, userLng = null) {
    // 1. Clear previous route
    endNavigation();

    let startLat, startLng;

    if (userLat && userLng) {
        // Use real user location
        startLat = userLat;
        startLng = userLng;
    } else {
        // 2. Simulate User Location (approx 2-3km away for demo)
        // Fallback if no permission or location data
        startLat = destLat - 0.02; // Roughly 2km south
        startLng = destLng - 0.02; // Roughly 2km west
    }

    // 3. Add User Marker
    const userIcon = L.divIcon({
        className: 'user-pin',
        html: `<div class="user-location-pulse"></div><div class="user-location-dot"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    userMarker = L.marker([startLat, startLng], { icon: userIcon }).addTo(map);

    // 4. Fetch Route from OSRM
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.code === 'Ok') {
            const route = json.routes[0];
            const routeCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);

            // Draw Polyline
            routeLayer = L.polyline(routeCoords, {
                color: '#4cc9f0',
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);

            // Fit Bounds
            map.flyToBounds(routeLayer.getBounds(), { padding: [50, 150] }); // more top padding for stats card

            // 5. Show Navigation Stats (Distance & Duration)
            showNavStats(route.distance, route.duration);
        }
    } catch (e) {
        console.error("Routing failed", e);
        alert("Navigation simulation failed. (API Error)");
    }
}

function showNavStats(distanceMeters, durationSeconds) {
    const distKm = (distanceMeters / 1000).toFixed(1);
    const timeMins = Math.ceil(durationSeconds / 60);

    const hudHtml = `
        <div class="nav-stat-group">
            <span class="nav-stat-label">Distance</span>
            <span class="nav-stat-value">${distKm} km</span>
        </div>
        <div class="nav-stat-divider"></div>
        <div class="nav-stat-group">
            <span class="nav-stat-label">ETA</span>
            <span class="nav-stat-value">${timeMins} min</span>
        </div>
        <button class="nav-close-btn" onclick="endNavigationUI()">
            <i class="ri-close-line"></i>
        </button>
    `;

    let hud = document.getElementById('nav-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'nav-hud';
        hud.className = 'nav-stats-card';
        // Insert into app container, but map works too
        document.body.appendChild(hud);
    }
    hud.innerHTML = hudHtml;
}

function endNavigation() {
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
    const hud = document.getElementById('nav-hud');
    if (hud) hud.remove();
}

// Global wrapper to reset UI button state if closed via X button
window.endNavigationUI = () => {
    endNavigation();
    // Dispatch event or direct call to reset button in app.js
    const event = new CustomEvent('nav-ended');
    window.dispatchEvent(event);
};

// Expose to window
window.initMap = initMap;
window.renderMarkers = renderMarkers;
window.startNavigation = startNavigation;
window.endNavigation = endNavigation;
window.showRadiusCircle = showRadiusCircle;
