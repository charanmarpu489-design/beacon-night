/**
 * Mock Data for Beacon
 * In a real app, this would be fetched from the Go backend via Redis
 */

// Consolidated Mock Data Generation covering all of India

const CURATED_PLACES = [
    { id: 1, name: "Highway King Dhaba", type: "Dhaba", lat: 16.5062, lng: 80.6480, status: "open", tables_free: 4, price: "₹₹", rating: 4.5, distance: "1.2 km", time_until: "4 AM", phone: "+91 98765 43210", tags: ["Truck Parking", "Family Friendly"], image: "https://images.unsplash.com/photo-1543353071-87df67a71128?q=80&w=200&h=200&fit=crop" },
    { id: 101, name: "Karim's", type: "Restaurant", lat: 28.6505, lng: 77.2307, status: "busy", price: "₹₹₹", rating: 4.7, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&h=200&fit=crop", phone: "+91 11 2326 4981" },
    { id: 201, name: "Trident Hotel", type: "Hotel", lat: 18.9292, lng: 72.8210, status: "open", price: "₹₹₹₹₹", rating: 4.8, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=200&h=200&fit=crop", phone: "+91 22 6632 4343" },
];

function generatePlaces() {
    const CITIES = [
        // Metros
        { n: "Delhi", lat: 28.7041, lng: 77.1025 }, { n: "Mumbai", lat: 19.0760, lng: 72.8777 },
        { n: "Bangalore", lat: 12.9716, lng: 77.5946 }, { n: "Chennai", lat: 13.0827, lng: 80.2707 },
        { n: "Kolkata", lat: 22.5726, lng: 88.3639 }, { n: "Hyderabad", lat: 17.3850, lng: 78.4867 },
        // North
        { n: "Chandigarh", lat: 30.7333, lng: 76.7794 }, { n: "Ludhiana", lat: 30.9010, lng: 75.8573 },
        { n: "Amritsar", lat: 31.6340, lng: 74.8723 }, { n: "Dehradun", lat: 30.3165, lng: 78.0322 },
        { n: "Srinagar", lat: 34.0837, lng: 74.7973 }, { n: "Leh", lat: 34.1526, lng: 77.5770 },
        { n: "Lucknow", lat: 26.8467, lng: 80.9461 }, { n: "Varanasi", lat: 25.3176, lng: 82.9739 },
        // West
        { n: "Jaipur", lat: 26.9124, lng: 75.7873 }, { n: "Udaipur", lat: 24.5854, lng: 73.7125 },
        { n: "Jodhpur", lat: 26.2389, lng: 73.0243 }, { n: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
        { n: "Surat", lat: 21.1702, lng: 72.8311 }, { n: "Pune", lat: 18.5204, lng: 73.8567 },
        { n: "Goa", lat: 15.2993, lng: 74.1240 }, { n: "Nagpur", lat: 21.1458, lng: 79.0882 },
        // Central
        { n: "Bhopal", lat: 23.2599, lng: 77.4126 }, { n: "Indore", lat: 22.7196, lng: 75.8577 },
        { n: "Raipur", lat: 21.2514, lng: 81.6296 }, { n: "Gwalior", lat: 26.2183, lng: 78.1828 },
        // South
        { n: "Kochi", lat: 9.9312, lng: 76.2673 }, { n: "Trivandrum", lat: 8.5241, lng: 76.9366 },
        { n: "Mysore", lat: 12.2958, lng: 76.6394 }, { n: "Coimbatore", lat: 11.0168, lng: 76.9558 },
        { n: "Madurai", lat: 9.9252, lng: 78.1198 }, { n: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
        // East & NE
        { n: "Patna", lat: 25.5941, lng: 85.1376 }, { n: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
        { n: "Guwahati", lat: 26.1445, lng: 91.7362 }, { n: "Shillong", lat: 25.5788, lng: 91.8933 },
        { n: "Gangtok", lat: 27.3389, lng: 88.6065 }, { n: "Darjeeling", lat: 27.0410, lng: 88.2663 }
    ];

    const types = ["Restaurant", "Dhaba", "Hotel", "Cafe", "Stall"];
    const prefixes = ["Royal", "Spice", "Green", "Golden", "Night", "Highway", "City", "Tasty", "Blue", "Red", "New", "Grand", "Sai", "Amma", "Taste of"];
    const suffixes = ["Plaza", "Bites", "Point", "Leaf", "Diner", "Kitchen", "Spoon", "Bowl", "Hut", "Palace", "Dhaba", "Canteen", "Express"];

    // Images
    const images = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1543353071-87df67a71128?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1628294895950-98052523e036?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1596450519664-5858a74e7fc5?q=80&w=200&h=200&fit=crop"
    ];

    let generated = [];
    let idCounter = 1000;

    // 1. DENSE CITY CLUSTERS
    CITIES.forEach(city => {
        // More places for bigger cities
        const sizeFactor = ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai"].includes(city.n) ? 80 : 30;
        const count = sizeFactor + Math.floor(Math.random() * 20);

        for (let i = 0; i < count; i++) {
            // Scatter: tightly packed in center, looser at outskirts
            const r = Math.random();
            const spread = r < 0.5 ? 0.05 : 0.15; // 50% core (5km), 50% outskirts (15km)

            generated.push(createPlace(idCounter++, city.n, city.lat, city.lng, spread, prefixes, suffixes, types, images));
        }
    });

    // 2. HIGHWAY & RURAL SCATTER (The "Every Corner" filler)
    // Create random nodes across India's bounding box and verify they land somewhat on land logic (simplified by lat/lng ranges)
    // India approx: Lat 8 to 36, Lng 68 to 97
    const RURAL_COUNT = 800;
    for (let i = 0; i < RURAL_COUNT; i++) {
        // Weighted random to favor central/north populous belts over extreme edges for better "filled" look
        const lat = 10 + Math.random() * 25; // 10 to 35
        const lng = 70 + Math.random() * 20; // 70 to 90

        // Simple "in India" approximation check (exclude ocean corners roughly)
        // This is a rough heuristic to avoid too many ocean points
        if (
            (lat < 20 && lng < 72) || // Arabian Sea
            (lat < 20 && lng > 85) || // Bay of Bengal
            (lat > 30 && lng < 74)    // Pakistan border buffer
        ) continue;

        generated.push(createPlace(idCounter++, "Highway", lat, lng, 0, prefixes, suffixes, ["Dhaba", "Motel"], images));
    }

    return generated;
}

function createPlace(id, locationName, varyLat, varyLng, spread, prefixes, suffixes, types, images) {
    const type = types[Math.floor(Math.random() * types.length)];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    const lat = varyLat + (Math.random() - 0.5) * spread * 2;
    const lng = varyLng + (Math.random() - 0.5) * spread * 2;

    // Generate valid Indian mobile number
    const phone = `+91 ${7000000000 + Math.floor(Math.random() * 2999999999)}`;

    return {
        id: id,
        name: type === 'Dhaba' ? `${name} Dhaba` : name,
        type: type,
        lat: lat,
        lng: lng,
        status: Math.random() > 0.3 ? "open" : (Math.random() > 0.5 ? "busy" : "closed"),
        tables_free: Math.floor(Math.random() * 15),
        price: "₹".repeat(1 + Math.floor(Math.random() * 4)),
        rating: (3 + Math.random() * 2).toFixed(1),
        distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
        time_until: Math.random() > 0.6 ? "24/7" : "3 AM",
        phone: phone,
        tags: ["WiFi", "Parking", "Foods"],
        image: images[Math.floor(Math.random() * images.length)]
    };
}

// Combine Curated and Generated
const PLACES = [
    ...CURATED_PLACES,
    ...generatePlaces()
];
