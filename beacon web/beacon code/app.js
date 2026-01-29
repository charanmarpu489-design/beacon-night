/**
 * Application Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const bottomSheet = document.getElementById('bottom-sheet');
    const sheetSummary = document.getElementById('sheet-summary');
    const sheetDetail = document.getElementById('sheet-detail');
    const nearbyList = document.getElementById('nearby-list');
    const backBtn = document.getElementById('back-to-list');
    const filterChips = document.querySelectorAll('.chip');
    const emergencyBtn = document.getElementById('emergency-btn');

    // State
    let currentUserLocation = null; // { lat, lng }

    // Request user location during splash (for accurate 15km radius)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            currentUserLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
        }, (err) => {
            console.log("Location permission denied or unavailable:", err);
            // Fall back to showing all data without distance filtering
        });
    }

    // Simulate Launch
    setTimeout(() => {
        document.getElementById('loading-text').innerText = "Scanning 15km radius...";
    }, 1000);

    setTimeout(() => {
        splashScreen.style.opacity = '0';
        appContainer.classList.remove('hidden');

        // Wait for fade out to remove from DOM
        setTimeout(() => splashScreen.remove(), 500);

        // Init Map
        window.initMap();

        // If we have user location, show accurate 15km results
        if (currentUserLocation) {
            findPlacesNear(currentUserLocation.lat, currentUserLocation.lng);
        } else {
            // Otherwise populate with all data
            populateNearbyList(PLACES);
        }
    }, 2500);


    // --- Logic ---

    function populateNearbyList(data) {
        nearbyList.innerHTML = '';

        data.forEach(place => {
            const el = document.createElement('div');
            el.className = 'list-item';
            el.innerHTML = `
                <img src="${place.image}" alt="${place.name}">
                <div class="list-info">
                    <div class="list-name">${place.name}</div>
                    <div class="list-meta">
                        <span>${place.distance}</span>
                        <span>•</span>
                        <span>${place.price}</span>
                    </div>
                    <div class="list-phone">
                        <i class="ri-phone-fill"></i> ${place.phone}
                    </div>
                </div>
                <div class="list-status ${getStatusColor(place.status)}">
                    ${place.status === 'open' ? '🟢 Open' : (place.status === 'busy' ? '🟡 Busy' : '🔴 Closed')}
                </div>
            `;
            el.onclick = () => {
                selectPlace(place);
                // Trigger map movement via the map marker logic (optional inverse sync)
                // map.flyTo...
            };
            nearbyList.appendChild(el);
        });

        // Update location stats
        updateLocationStats(data, currentUserLocation);
    }

    function updateLocationStats(data, userLocation = null) {
        let filteredData = data;
        let radiusKm = 15; // Fixed 15km radius

        // If we have user location, calculate actual distances and filter
        if (userLocation && userLocation.lat && userLocation.lng) {
            // Calculate real distances for all places
            const placesWithDistance = data.map(place => {
                const distance = getDistanceFromLatLonInKm(
                    userLocation.lat,
                    userLocation.lng,
                    place.lat,
                    place.lng
                );
                return {
                    ...place,
                    calculatedDistance: distance
                };
            });

            // Filter to only show places within 15km
            filteredData = placesWithDistance.filter(p => p.calculatedDistance <= radiusKm);

            // Sort by distance (nearest first)
            filteredData.sort((a, b) => a.calculatedDistance - b.calculatedDistance);

            // Update the distance display strings
            filteredData = filteredData.map(p => ({
                ...p,
                distance: `${p.calculatedDistance.toFixed(1)} km`
            }));
        }

        // Count total places within radius
        const totalCount = filteredData.length;

        // Count by status
        const openCount = filteredData.filter(p => p.status === 'open').length;
        const busyCount = filteredData.filter(p => p.status === 'busy').length;
        const closedCount = filteredData.filter(p => p.status === 'closed').length;

        // Update DOM
        document.getElementById('places-count').textContent = totalCount;
        document.getElementById('search-radius').textContent = radiusKm;
        document.getElementById('open-count').textContent = openCount;
        document.getElementById('busy-count').textContent = busyCount;

        // Return filtered data for potential use
        return filteredData;
    }

    function getStatusColor(status) {
        if (status === 'open') return 'green';
        if (status === 'busy') return 'yellow';
        return 'red';
    }

    // Window global for Map interaction
    window.selectPlace = (place) => {
        // Show detail view
        sheetSummary.classList.add('hidden');
        sheetDetail.classList.remove('hidden');

        // Populate details
        document.getElementById('detail-name').innerText = place.name;

        const statusEl = document.getElementById('detail-status');
        statusEl.className = `status-badge ${getStatusColor(place.status)}`;
        statusEl.innerText = place.status === 'open' ? '🟢 Open Now' : (place.status === 'busy' ? '🟡 Filling Fast' : '🔴 Closed');

        document.getElementById('detail-tables').innerText = `${place.tables_free} Tables`;
        document.getElementById('detail-time').innerText = `Until ${place.time_until}`;
        document.getElementById('detail-price').innerText = place.price;

        // Tags
        const tagContainer = document.getElementById('detail-tags');
        tagContainer.innerHTML = '';
        place.tags.forEach(tag => {
            const t = document.createElement('span');
            t.className = 'detail-tag';
            t.innerText = tag;
            tagContainer.appendChild(t);
        });

        // Setup Call Button
        document.getElementById('call-btn').onclick = () => {
            window.location.href = `tel:${place.phone}`;
        };

        // Setup Navigation Button
        // Setup Navigation Button
        document.getElementById('nav-btn').onclick = async () => {
            const navBtn = document.getElementById('nav-btn');

            // Helper to actually start logic
            const launchNav = (startLat, startLng) => {
                navBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Routing...';

                window.startNavigation(place.lat, place.lng, startLat, startLng).then(() => {
                    navBtn.innerHTML = '<i class="ri-close-circle-line"></i> End Nav';
                    navBtn.onclick = () => {
                        navBtn.innerHTML = '<i class="ri-navigation-fill"></i> Navigate';
                        navBtn.onclick = () => window.selectPlace(place);
                        window.endNavigation(); // Explicitly call end
                    };
                });
            };

            // Check if we have location?
            if (currentUserLocation) {
                launchNav(currentUserLocation.lat, currentUserLocation.lng);
            } else {
                // Try to get it now
                navBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Locating...';
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        currentUserLocation = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        };
                        launchNav(currentUserLocation.lat, currentUserLocation.lng);
                    }, (err) => {
                        console.warn("Nav Location Error", err);
                        // Fallback to simulation (nulls)
                        launchNav(null, null);
                    });
                } else {
                    launchNav(null, null);
                }
            }
        };

        // Animate Sheet
        bottomSheet.style.transform = "translateY(0)";
    };

    // Back to List
    backBtn.addEventListener('click', () => {
        sheetDetail.classList.add('hidden');
        sheetSummary.classList.remove('hidden');
    });

    // Filters
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // UI
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filter = chip.dataset.filter;
            applyFilter(filter);
        });
    });

    function applyFilter(filter) {
        let filtered = PLACES;

        if (filter === 'highly-rated') filtered = PLACES.filter(p => p.rating >= 4.5);
        if (filter === '24-7') filtered = PLACES.filter(p => p.time_until === '24/7');
        if (filter === 'budget') filtered = PLACES.filter(p => p.price === '₹');
        if (filter === 'truck-friendly') filtered = PLACES.filter(p => p.tags.includes('Truck Parking'));
        if (filter === 'less-crowded') filtered = PLACES.filter(p => p.tables_free >= 6);

        // Limit map markers to top 20 when filtering to keep it clean
        const mapMarkers = filtered.slice(0, 20);

        window.renderMarkers(mapMarkers);
        populateNearbyList(filtered);

        // Return to summary
        sheetDetail.classList.add('hidden');
        sheetSummary.classList.remove('hidden');
    }

    // Emergency Mode
    emergencyBtn.addEventListener('click', () => {
        // Find 24/7 button and click it to trigger filter
        const emergencyFilterBtn = document.querySelector('.chip[data-filter="24-7"]');
        if (emergencyFilterBtn) {
            emergencyFilterBtn.click();
            emergencyFilterBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Fallback if chip not found
            applyFilter('24-7');
        }

        // Visual feedback
        emergencyBtn.style.transform = "scale(1.1)";
        setTimeout(() => emergencyBtn.style.transform = "scale(1)", 200);
    });

    // Locate Me (10km Radius)
    document.getElementById('locate-btn').addEventListener('click', () => {
        const btn = document.getElementById('locate-btn');
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                currentUserLocation = { lat, lng };

                // 1. Center Map
                // Assuming map is global or accessible via window (it is)
                // We access the Leaflet map instance stored in map.js scope if exposed? 
                // Currently 'map' var is local to map.js but 'window.initMap' sets it.
                // We need to move map/marker logic or assume map.js handles view if we call a function?
                // Let's rely on filter to update markers, but we should pan pan.
                // Actually map.js doesn't expose 'map' object directly globally, just functions.
                // Let's hack it: re-init with center? No.
                // Better: Add a window.flyTo(lat,lng) in map.js? 
                // Or just trust renderMarkers to clear and show new ones, then fit bounds.

                findPlacesNear(lat, lng);
                btn.innerHTML = '<i class="ri-crosshair-2-line"></i>';
            }, (err) => {
                console.error(err);
                alert("Could not get location. Ensure GPS is on.");
                btn.innerHTML = '<i class="ri-error-warning-line"></i>';
            });
        } else {
            alert("Geolocation not supported");
        }
    });

    // Search Functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length === 0) {
            // Reset to original full list
            window.renderMarkers(PLACES);
            populateNearbyList(PLACES);
            return;
        }

        const filtered = PLACES.filter(place => {
            const nameMatch = place.name.toLowerCase().includes(query);
            const tagMatch = place.tags && place.tags.some(tag => tag.toLowerCase().includes(query));
            return nameMatch || tagMatch;
        });

        window.renderMarkers(filtered);
        populateNearbyList(filtered);

        // Smart Zoom: If results found, center on the first match
        if (filtered.length > 0 && typeof map !== 'undefined') {
            // Zoom out slightly if it's a broad search (many results), zoom in if few
            const zoomLevel = filtered.length > 5 ? 10 : 13;
            map.flyTo([filtered[0].lat, filtered[0].lng], zoomLevel, { animate: true, duration: 1 });
        }
    });

    function findPlacesNear(lat, lng) {
        // Filter PLACES within 15km (accurate radius)
        const userLocation = { lat, lng };
        const radiusKm = 15;

        const nearby = PLACES.filter(p => {
            const dist = getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            return dist <= radiusKm;
        });

        // Calculate accurate distances and add to place objects
        let results = nearby.map(p => {
            const dist = getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            return {
                ...p,
                distance: `${dist.toFixed(1)} km`,
                calculatedDistance: dist
            };
        });

        // === SMART PRIORITIZATION ===
        // Score each restaurant based on:
        // 1. Distance (closer is better) - 40%
        // 2. Status (open > busy > closed) - 40%
        // 3. Crowd Level (more tables free = less crowded) - 20%
        results.forEach(place => {
            let score = 0;

            // Distance score (0-40)
            score += (1 - (place.calculatedDistance / radiusKm)) * 40;

            // Status score (0-40)
            if (place.status === 'open') score += 40;
            else if (place.status === 'busy') score += 20;

            // Crowd level score (0-20)
            const tableCount = place.tables_free || 0;
            score += Math.min(tableCount, 10) * 2;

            place.priorityScore = score;
        });

        // Sort by priority score (highest first)
        results.sort((a, b) => b.priorityScore - a.priorityScore);

        // === LIMIT CLUTTER ===
        // Only show top 25 smartest markers on the map
        const mapMarkers = results.slice(0, 25);

        // "God Mode" fallback for testing
        if (mapMarkers.length < 5) {
            const extra = generateMockNearby(lat, lng);
            mapMarkers.push(...extra);
            results.push(...extra);
        }

        // === SHOW RADIUS RING ===
        if (window.showRadiusCircle) {
            window.showRadiusCircle(lat, lng, radiusKm);
        }

        // Render markers on map
        window.renderMarkers(mapMarkers);

        // Show all results in the list (so user can scroll for more)
        populateNearbyList(results);

        // Update stats
        updateLocationStats(results, userLocation);

        // Update Search UI
        document.getElementById('search-input').value = `Within 15km of you`;
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function generateMockNearby(lat, lng) {
        // Create 5 random places around this point
        const types = ["Dhaba", "Restaurant", "Cafe"];
        const mocks = [];
        for (let i = 0; i < 5; i++) {
            const latOffset = (Math.random() - 0.5) * 0.05; // ~5km
            const lngOffset = (Math.random() - 0.5) * 0.05;
            mocks.push({
                id: 99000 + i,
                name: `Nearby Spot ${i + 1}`,
                type: types[Math.floor(Math.random() * 3)],
                lat: lat + latOffset,
                lng: lng + lngOffset,
                status: "open",
                tables_free: Math.floor(Math.random() * 10),
                price: "₹₹",
                rating: 4.2,
                distance: `${(Math.random() * 5).toFixed(1)} km`,
                time_until: "3 AM",
                phone: "+91 90000 00000",
                tags: ["Nearby", "Auto-Detected"],
                image: "https://images.unsplash.com/photo-1543353071-87df67a71128?q=80&w=200&h=200&fit=crop"
            });
        }
        return mocks;
    }

    // Listen for Nav Ended
    window.addEventListener('nav-ended', () => {
        const navBtn = document.getElementById('nav-btn');
        if (navBtn) {
            // Reset Button Visuals
            navBtn.innerHTML = '<i class="ri-navigation-fill"></i> Navigate';

            // To fix the "stale click handler" issue where clicking navigate again might trigger 'End Nav' logic
            // or fail because we are in a weird state:
            // We should ideally re-select the current place to re-bind the fresh onclick logic.
            // But since we don't know *which* place is active here easily without global state,
            // we will just close the details sheet. This forces the user to click a place again,
            // which guarantees a fresh state.

            sheetDetail.classList.add('hidden');
            sheetSummary.classList.remove('hidden');
        }

        // Also ensure map layers are definitely gone (double check against race conditions)
        if (window.endNavigation) {
            window.endNavigation();
        }
    });

});
