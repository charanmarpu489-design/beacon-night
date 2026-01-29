# Product Design Document: Beacon Night 🔦
**The Real-Time Night Food Discovery Engine**

---

## 1. 💡 Product Vision
**Beacon Night** is not just a map; it is a safety companion for the night traveler. It answers the primal need for food and safety in the dark with zero friction. While generic maps provide static data ("It might be open"), Beacon Night provides **certainty** ("The lights are on, and there are 3 tables free").

### **Core Philosophy: "Calm Certainty"**
*   **No Clutter:** At night, cognitive load is high. The UI removes everything that isn't about food, safety, or simple navigation.
*   **Honest Data:** We strictly differentiate between "Predicted Open" (Algorithm) and "Confirmed Open" (Live signal).
*   **Low-Bandwidth First:** Designed to work on EDGE/2G networks on remote highways.

---

## 2. 🎨 Design System: "Nocturne"

### **Color Palette (OLED Friendly)**
*   **Backgrounds:** `Void Black (#050505)` for true blacks, saving battery and reducing glare.
*   **Surfaces:** `Deep Charcoal (#121212)` and `Gunmetal (#1E1E1E)` for cards.
*   **Status Indicators (The "Traffic Light" System):**
    *   🟢 **Go:** `Neon Mint (#00FF94)` – Open, tables available. High visibility.
    *   🟡 **Wait:** `Amber Glow (#FFC107)` – Open, but crowding/waitlist.
    *   🔴 **Stop:** `Crimson Dim (#5C1D1D)` – Closed or full. (Dimmed to reduce visual noise).
*   **Text:** `Mist White (#E0E0E0)` for primary, `Slate (#949494)` for secondary. **No pure white** to prevent eye strain.

### **Typography**
*   **Font:** **Manrope** (Modern, geometric but readable) or **Inter**.
*   **Sizing:** Increased base size (18px) for effortless readability by tired eyes/drivers.
*   **Weights:** Heavy usage of **Bold** for critical info (Open/Closed), Light for secondary info.

### **Interaction Design**
*   **Thumb Zone:** All primary controls (Nav, Call, Filter) exist in the bottom 30% of the screen.
*   **Haptics:** Strong haptic feedback on success states (Finding a route, Confirming a call) to confirm actions without needing visual fixation.

---

## 3. 📱 detailed User Experience & Screen Breadown

### **1. The Splash (Trust)**
*   **Visual:** A pulsing radar animation in the center of a black screen.
*   **Micro-copy:** "Locating open tables..." -> "Secure connection established."
*   **Vibe:** Feels like initializing a high-tech tool, not just loading an app.

### **2. The Home Map (The Cockpit)**
*   **The Map:** Custom dark-mode map tiles (Mapbox/Google Custom). Roads are faint gray; highways are highlighted brighter.
*   **The Pins:**
    *   **Pulse Effect:** Open locations have a "breathing" green glow animation.
    *   **Iconography:** Simple icons (Fork, Coffee, Bed) inside the pin.
*   **Bottom Card (Draggable):**
    *   shows the nearest "Safe Bet" automatically.
    *   "7 mins • The Highway King Dhaba • 🟢 4 Tables Free".
    *   **Big Button:** "Go" (Navigation) and "Call" (Phone).

### **3. Restaurant Detail (The Decision)**
*   **Visuals:** High-res photo of the *facade* (so they recognize it from the road) and the *food*.
*   **Live Status:** "🟢 Manager updated: 5 mins ago".
*   **Essentials Only:**
    *   Price: ₹₹
    *   Toilet Cleanliness Rating (Specific to travelers).
    *   Parking: "Truck Friendly" check (Vital for haulers).

### **4. "Emergency Fuel" Mode (Red Button)**
*   **Trigger:** A toggle or shake gesture.
*   **Action:** Immediately filters map to **Only 24/7 Verified Open** spots within 20km.
*   **UI Change:** UI becomes high-contrast. Buttons become blocky and massive.
*   **One-Tap:** Dials the nearest open place immediately.

---

## 4. 🛠 Technical concept & Architecture

### **Frontend (The Client)**
*   **Framework:** **React Native** (for smooth native maps) or **Flutter**.
*   **State Management:** Local-first database (WatermelonDB or SQLite). We cache the last known locations so the map works **offline**.
*   **Optimistic UI:** When the user taps "Call", it dials instantly, logging the intent in the background.

### **Backend (The Brain)**
*   **Core:** **Go (Golang)** for high-concurrency geospatial requests.
*   **Database:** **PostgreSQL (PostGIS)** for spatial data storage.
*   **Real-Time Layer:** **Redis** for storing ephemeral "Table Status" and "Last Heartbeat".
*   **Orchestration:** Kubernetes (scalable for city-wide spikes).

### **Data Strategy: The "Heartbeat" Protocol**
How do we know it's *actually* open?
1.  **Merchant App:** A simple "Toggle" app for owners. "Switch ON when you open shutters".
2.  **IoT Buttons:** Cheap physical WiFi buttons given to roadside dhabas. Press Green for "Tables Free", Red for "Full".
3.  **Crowdsourcing:** Users get "Karma Points" for confirming "Yes, it's open" when they arrive.
4.  **Passive Signals:** Analyzing aggregate GPS data (anonymized) to see if phones are stopping at the location at 2 AM.

---

## 5. 🚀 Why Beacon Wins (vs Google Maps)

| Feature | Google Maps | Beacon (This Product) |
| :--- | :--- | :--- |
| **Data Focus** | General Purpose (Everything) | **Specialized (Night, Food, Safety)** |
| **Real-Time** | "Popular times" (Historical) | **Current Status (Live heartbeats)** |
| **Trust Factor** | "Might be open" | **"Confirmed Open 5m ago"** |
| **UX** | Standard/Bright | **Dark Mode First, Driver Optimized** |
| **Niche Filters** | Generic | **"Truck Parking", "Family Safe", "Clean Toilets"** |

---

## 6. Implementation Roadmap
1.  **Phase 1 (MVP):** Map with manual "Verified" list of 50 highway dhabas. Manual hourly checks by ops team.
2.  **Phase 2 (Growth):** Merchant app for owners to update status.
3.  **Phase 3 (Scale):** Hardware integration (IoT buttons) and passive GPS analysis.
