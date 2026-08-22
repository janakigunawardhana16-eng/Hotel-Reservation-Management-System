/**
 * StayLux Hotel Reservation Management System
 * Frontend Application Controller & API Integration
 */

// Configuration
const CONFIG = {
    API_GATEWAY: "http://localhost:8080",
    AUTH_LOGIN_URL: "http://localhost:8080/oauth2/authorization/google",
    FALLBACK_HOTEL_IMAGE: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    FALLBACK_ROOM_IMAGE: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80"
};

// Application Global State
const state = {
    currentView: "home",
    hotels: [],
    rooms: [],
    reservations: [],
    selectedHotel: null,
    selectedRoom: null,
    lastReservation: null,
    isLoading: false
};

// View / Screen Definitions
const VIEWS = {
    "home": { id: "homeSection", title: "Home" },
    "hotels": { id: "hotelsSection", title: "Explore Hotels" },
    "hotel-details": { id: "hotelDetailsSection", title: "Hotel Details" },
    "rooms": { id: "roomsSection", title: "Select Room" },
    "booking": { id: "bookingSection", title: "Reservation" },
    "success": { id: "successSection", title: "Confirmed" },
    "reservations": { id: "reservationsSection", title: "My Reservations" }
};


/* ==========================================================================
   NAVIGATION & ROUTING
   ========================================================================== */

/**
 * Navigate to a target section in the flow
 * @param {string} viewKey - One of the keys in VIEWS
 */
function navigateTo(viewKey) {
    if (!VIEWS[viewKey]) {
        console.warn(`View ${viewKey} is not recognized. Defaulting to home.`);
        viewKey = "home";
    }

    // Safety checks for wizard flow dependencies
    if (viewKey === "hotel-details" && !state.selectedHotel) {
        showToast("Please select a hotel first", "warning");
        navigateTo("hotels");
        return;
    }

    if (viewKey === "rooms" && !state.selectedHotel) {
        showToast("Please select a hotel first to view rooms", "warning");
        navigateTo("hotels");
        return;
    }

    if (viewKey === "booking" && (!state.selectedHotel || !state.selectedRoom)) {
        showToast("Please select a room to reserve", "warning");
        navigateTo("hotels");
        return;
    }

    // Hide all view sections
    Object.keys(VIEWS).forEach(key => {
        const sectionEl = document.getElementById(VIEWS[key].id);
        if (sectionEl) {
            sectionEl.classList.remove("active");
        }
    });

    // Show target view section
    const targetEl = document.getElementById(VIEWS[viewKey].id);
    if (targetEl) {
        targetEl.classList.add("active");
    }

    // Update navigation breadcrumb / step indicator
    const indicatorEl = document.getElementById("stepIndicator");
    if (indicatorEl) {
        indicatorEl.textContent = VIEWS[viewKey].title;
    }

    state.currentView = viewKey;

    // View-specific trigger actions
    if (viewKey === "hotels" && state.hotels.length === 0) {
        fetchHotels();
    } else if (viewKey === "hotel-details") {
        renderHotelDetails();
    } else if (viewKey === "rooms") {
        fetchRooms();
    } else if (viewKey === "booking") {
        renderBookingSummary();
        initBookingForm();
    } else if (viewKey === "reservations") {
        fetchReservations();
    }

    // Smooth scroll to top of main content
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ==========================================================================
   API CLIENT WRAPPER WITH ERROR & AUTH HANDLING
   ========================================================================== */

/**
 * Universal Fetch API wrapper handling OAuth 401s, 429 rate limits, and JSON
 */
async function apiRequest(endpoint, options = {}) {
    const defaultHeaders = {
        "Accept": "application/json"
    };

    if (options.body && typeof options.body === "string") {
        defaultHeaders["Content-Type"] = "application/json";
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        },
        credentials: "include" // Include session cookies for OAuth2 session
    };

    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${endpoint}`, config);

        // Check for Gateway OAuth2 401 Unauthorized
        if (response.status === 401) {
            showToast("Authentication required. Redirecting to Google Login...", "info");
            setTimeout(() => {
                window.location.href = CONFIG.AUTH_LOGIN_URL;
            }, 1200);
            throw new Error("Authentication required (401)");
        }

        // Check for Rate Limit 429
        if (response.status === 429) {
            const errorMsg = "Rate limit exceeded. Please wait a moment before sending more requests.";
            showToast(errorMsg, "error");
            throw new Error(errorMsg);
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP Error ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch (_) {
                if (errorText.trim()) errorMessage += `: ${errorText}`;
            }
            throw new Error(errorMessage);
        }

        // Handle empty body responses (e.g., 204 No Content)
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
            const netError = "Cannot connect to API Gateway (Port 8080). Make sure backend services are running.";
            showToast(netError, "error");
            throw new Error(netError);
        }
        throw error;
    }
}


/* ==========================================================================
   1. HOTELS FEATURE
   ========================================================================== */

/**
 * Fetch all hotels from backend microservice
 */
async function fetchHotels() {
    const loader = document.getElementById("hotelsLoader");
    const emptyState = document.getElementById("hotelsEmpty");
    const grid = document.getElementById("hotelsGrid");

    if (loader) loader.style.display = "flex";
    if (emptyState) emptyState.style.display = "none";
    if (grid) grid.innerHTML = "";

    try {
        const hotels = await apiRequest("/api/hotels");
        state.hotels = Array.isArray(hotels) ? hotels : [];

        if (loader) loader.style.display = "none";

        if (state.hotels.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        renderHotelsList(state.hotels);
    } catch (error) {
        if (loader) loader.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "block";
            emptyState.querySelector("p").textContent = `Error loading hotels: ${error.message}`;
        }
    }
}

/**
 * Render hotel cards to the grid
 */
function renderHotelsList(hotels) {
    const grid = document.getElementById("hotelsGrid");
    if (!grid) return;

    grid.innerHTML = hotels.map((hotel, index) => {
        const safeId = escapeHtml(hotel.id || `hotel-${index}`);
        const safeName = escapeHtml(hotel.name || "Luxury Stay Hotel");
        const safeLocation = escapeHtml(hotel.location || "Exquisite Location");
        const safeDesc = escapeHtml(hotel.description || "Experience top-tier hospitality, premium amenities, and world-class service.");
        const rating = (typeof hotel.rating === "number") ? hotel.rating.toFixed(1) : "4.8";

        // Assign curated photo by index
        const hotelPhotos = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
        ];
        const photoUrl = hotelPhotos[index % hotelPhotos.length];

        return `
            <article class="hotel-card">
                <div class="card-media">
                    <img src="${photoUrl}" alt="${safeName}" class="card-img" loading="lazy">
                    <span class="rating-badge">★ ${rating}</span>
                </div>
                <div class="card-body">
                    <div class="card-header-row">
                        <h3 class="card-title">${safeName}</h3>
                    </div>
                    <p class="card-location">📍 ${safeLocation}</p>
                    <p class="card-desc">${safeDesc}</p>
                    
                    <div class="card-footer-row">
                        <div class="hotel-tags">
                            <span class="tag">Free WiFi</span>
                            <span class="tag">Pool</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="selectHotelById('${safeId}')">
                            View Hotel →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

/**
 * Handle hotel card click by ID
 */
function selectHotelById(hotelId) {
    const hotel = state.hotels.find(h => String(h.id) === String(hotelId));
    if (!hotel) {
        showToast("Hotel selection not found.", "error");
        return;
    }

    state.selectedHotel = hotel;
    state.selectedRoom = null; // Reset any previous room selection
    navigateTo("hotel-details");
}


/* ==========================================================================
   2. HOTEL DETAILS FEATURE
   ========================================================================== */

/**
 * Render selected hotel details page
 */
function renderHotelDetails() {
    const container = document.getElementById("hotelDetailsContent");
    if (!container) return;

    if (!state.selectedHotel) {
        container.innerHTML = `<div class="empty-state"><p>No hotel selected.</p></div>`;
        return;
    }

    const hotel = state.selectedHotel;
    const safeName = escapeHtml(hotel.name || "Luxury Stay Hotel");
    const safeLocation = escapeHtml(hotel.location || "Exquisite Location");
    const safeDesc = escapeHtml(hotel.description || "A prime destination offering supreme comfort, stunning suites, and premium guest hospitality.");
    const rating = (typeof hotel.rating === "number") ? hotel.rating.toFixed(1) : "4.8";

    container.innerHTML = `
        <div class="details-layout">
            <div class="details-media-box">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" 
                     alt="${safeName}" 
                     class="details-main-img">
                <div class="details-overlay-badge">
                    <span>⭐ ${rating} / 5.0 Rating</span>
                </div>
            </div>

            <div class="details-info-box">
                <div class="details-badge-row">
                    <span class="badge-accent">FEATURED PROPERTY</span>
                    <span class="badge-status">Instant Confirmation</span>
                </div>
                
                <h1 class="details-title">${safeName}</h1>
                <p class="details-location">📍 ${safeLocation}</p>

                <div class="details-divider"></div>

                <div class="details-section-block">
                    <h3>About the Hotel</h3>
                    <p class="details-text">${safeDesc}</p>
                </div>

                <div class="details-section-block">
                    <h3>Hotel Amenities</h3>
                    <div class="amenities-grid">
                        <div class="amenity-item"><span>🏊</span> Heated Swimming Pool</div>
                        <div class="amenity-item"><span>🍽️</span> Fine Dining Restaurant</div>
                        <div class="amenity-item"><span>📶</span> High-Speed WiFi</div>
                        <div class="amenity-item"><span>🅿️</span> Free Valet Parking</div>
                        <div class="amenity-item"><span>🍸</span> Rooftop Lounge</div>
                        <div class="amenity-item"><span>🏋️</span> Fitness Center</div>
                    </div>
                </div>

                <div class="details-cta-card">
                    <div>
                        <span class="cta-label">Ready to stay?</span>
                        <h4>Explore available rooms for this hotel</h4>
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('rooms')">
                        View Available Rooms →
                    </button>
                </div>
            </div>
        </div>
    `;
}


/* ==========================================================================
   3. ROOMS FEATURE
   ========================================================================== */

/**
 * Fetch and filter rooms for the selected hotel
 */
async function fetchRooms() {
    if (!state.selectedHotel) {
        showToast("Please choose a hotel first", "warning");
        navigateTo("hotels");
        return;
    }

    const loader = document.getElementById("roomsLoader");
    const emptyState = document.getElementById("roomsEmpty");
    const grid = document.getElementById("roomsGrid");
    const banner = document.getElementById("roomHotelBanner");
    const title = document.getElementById("roomsSectionTitle");
    const subtitle = document.getElementById("roomsSectionSubtitle");

    const hotelName = escapeHtml(state.selectedHotel.name || "Selected Hotel");
    const hotelLocation = escapeHtml(state.selectedHotel.location || "");

    if (title) title.textContent = `Available Rooms at ${hotelName}`;
    if (subtitle) subtitle.textContent = `Select an available room in ${hotelLocation} to proceed with your booking.`;

    if (banner) {
        banner.innerHTML = `
            <div class="banner-content">
                <span class="banner-icon">🏨</span>
                <div>
                    <strong>${hotelName}</strong>
                    <small>📍 ${hotelLocation}</small>
                </div>
            </div>
            <button class="btn btn-outline btn-xs" onclick="navigateTo('hotels')">
                Change Hotel
            </button>
        `;
    }

    if (loader) loader.style.display = "flex";
    if (emptyState) emptyState.style.display = "none";
    if (grid) grid.innerHTML = "";

    try {
        const rooms = await apiRequest("/api/rooms");
        state.rooms = Array.isArray(rooms) ? rooms : [];

        if (loader) loader.style.display = "none";

        // Filter rooms strictly matching the current hotelId
        const hotelRooms = state.rooms.filter(room => {
            const matchesHotel = String(room.hotelId) === String(state.selectedHotel.id);
            const isAvailable = room.available === undefined || room.available === true;
            return matchesHotel && isAvailable;
        });

        if (hotelRooms.length === 0) {
            if (emptyState) {
                emptyState.style.display = "block";
                const msg = document.getElementById("roomsEmptyMessage");
                if (msg) {
                    msg.textContent = `There are currently no available rooms for "${hotelName}". Please check another hotel.`;
                }
            }
            return;
        }

        renderRoomsList(hotelRooms);
    } catch (error) {
        if (loader) loader.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "block";
            emptyState.querySelector("p").textContent = `Error loading rooms: ${error.message}`;
        }
    }
}

/**
 * Render room cards in the grid
 */
function renderRoomsList(rooms) {
    const grid = document.getElementById("roomsGrid");
    if (!grid) return;

    const roomImages = [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"
    ];

    grid.innerHTML = rooms.map((room, index) => {
        const safeId = escapeHtml(room.id || `room-${index}`);
        const roomNumber = escapeHtml(String(room.roomNumber || (101 + index)));
        const roomType = escapeHtml(room.roomType || "Deluxe Suite");
        const capacity = room.capacity || 2;
        const priceFormatted = Number(room.price || 15000).toLocaleString();
        const photo = roomImages[index % roomImages.length];

        return `
            <article class="room-card">
                <div class="card-media">
                    <img src="${photo}" alt="Room ${roomNumber}" class="card-img" loading="lazy">
                    <span class="room-type-badge">${roomType}</span>
                    <span class="availability-badge available">● Available</span>
                </div>
                <div class="card-body">
                    <div class="room-card-header">
                        <h3 class="room-title">Room ${roomNumber}</h3>
                        <div class="room-price-tag">
                            <span class="price-val">Rs. ${priceFormatted}</span>
                            <small class="price-period">/ night</small>
                        </div>
                    </div>

                    <div class="room-features">
                        <div class="feature-pill">👥 Up to ${capacity} Guests</div>
                        <div class="feature-pill">🛏️ King Bed</div>
                        <div class="feature-pill">🚿 Private Bath</div>
                    </div>

                    <div class="room-card-actions">
                        <button class="btn btn-primary btn-block" onclick="selectRoomById('${safeId}')">
                            Book This Room →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

/**
 * Handle room selection by ID
 */
function selectRoomById(roomId) {
    const room = state.rooms.find(r => String(r.id) === String(roomId));
    if (!room) {
        showToast("Room selection not found.", "error");
        return;
    }

    state.selectedRoom = room;
    navigateTo("booking");
}


/* ==========================================================================
   4. RESERVATION FORM & SUBMISSION
   ========================================================================== */

/**
 * Render summary card for booking view
 */
function renderBookingSummary() {
    const summaryContainer = document.getElementById("bookingSummaryContent");
    if (!summaryContainer) return;

    const hotel = state.selectedHotel || {};
    const room = state.selectedRoom || {};

    const hotelName = escapeHtml(hotel.name || "Selected Hotel");
    const hotelLocation = escapeHtml(hotel.location || "City Location");
    const roomNumber = escapeHtml(String(room.roomNumber || "101"));
    const roomType = escapeHtml(room.roomType || "Standard Room");
    const capacity = room.capacity || 2;
    const price = Number(room.price || 0);

    summaryContainer.innerHTML = `
        <div class="summary-media">
            <img src="${CONFIG.FALLBACK_ROOM_IMAGE}" alt="${roomType}" class="summary-img">
        </div>
        <div class="summary-details">
            <h4 class="summary-hotel-name">🏨 ${hotelName}</h4>
            <p class="summary-location">📍 ${hotelLocation}</p>
            
            <div class="summary-divider"></div>
            
            <div class="summary-row">
                <span>Room Number:</span>
                <strong>Room ${roomNumber}</strong>
            </div>
            <div class="summary-row">
                <span>Room Type:</span>
                <strong>${roomType}</strong>
            </div>
            <div class="summary-row">
                <span>Max Capacity:</span>
                <strong>${capacity} Guests</strong>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-price-box">
                <span class="price-label">Room Rate:</span>
                <span class="total-price">Rs. ${price.toLocaleString()} <small>/ night</small></span>
            </div>
        </div>
    `;
}

/**
 * Initialize booking form controls, date limits, and event listeners
 */
function initBookingForm() {
    const dateInput = document.getElementById("reservationDate");
    const guestsInput = document.getElementById("numberOfGuests");
    const formError = document.getElementById("bookingFormError");

    if (formError) {
        formError.style.display = "none";
        formError.textContent = "";
    }

    // Set min date to today's date in YYYY-MM-DD
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today;
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }

    // Adjust max guests according to room capacity
    if (guestsInput && state.selectedRoom) {
        const cap = state.selectedRoom.capacity || 2;
        guestsInput.max = cap;
        if (Number(guestsInput.value) > cap) {
            guestsInput.value = cap;
        }
    }

    // Clear validation error hints
    ["nameError", "emailError", "dateError", "guestsError"].forEach(id => {
        const err = document.getElementById(id);
        if (err) err.textContent = "";
    });
}

/**
 * Handle reservation form submit
 */
async function handleReservationSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("customerEmail");
    const dateInput = document.getElementById("reservationDate");
    const guestsInput = document.getElementById("numberOfGuests");
    const submitBtn = document.getElementById("submitBookingBtn");
    const formError = document.getElementById("bookingFormError");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const dateError = document.getElementById("dateError");
    const guestsError = document.getElementById("guestsError");

    // Reset errors
    if (nameError) nameError.textContent = "";
    if (emailError) emailError.textContent = "";
    if (dateError) dateError.textContent = "";
    if (guestsError) guestsError.textContent = "";
    if (formError) {
        formError.style.display = "none";
        formError.textContent = "";
    }

    // Validation
    let isValid = true;

    const customerName = nameInput ? nameInput.value.trim() : "";
    if (!customerName || customerName.length < 2) {
        if (nameError) nameError.textContent = "Please enter your full name (minimum 2 characters).";
        isValid = false;
    }

    const email = emailInput ? emailInput.value.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        if (emailError) emailError.textContent = "Please enter a valid email address.";
        isValid = false;
    }

    const reservationDate = dateInput ? dateInput.value : "";
    const today = new Date().toISOString().split("T")[0];
    if (!reservationDate || reservationDate < today) {
        if (dateError) dateError.textContent = "Please select a valid date (today or in the future).";
        isValid = false;
    }

    const numberOfGuests = guestsInput ? parseInt(guestsInput.value, 10) : 1;
    const maxCapacity = (state.selectedRoom && state.selectedRoom.capacity) ? state.selectedRoom.capacity : 10;
    if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > maxCapacity) {
        if (guestsError) guestsError.textContent = `Guests must be between 1 and ${maxCapacity} for this room.`;
        isValid = false;
    }

    if (!isValid) return;

    // Build payload matching backend Reservation model exactly:
    // { customerName, email, reservationDate, numberOfGuests }
    const payload = {
        customerName: customerName,
        email: email,
        reservationDate: reservationDate,
        numberOfGuests: numberOfGuests
    };

    // UI Loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-sm"></span> Creating Reservation...`;
    }

    try {
        const createdReservation = await apiRequest("/api/reservations", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        // Store confirmed reservation state
        state.lastReservation = {
            ...createdReservation,
            hotelName: state.selectedHotel?.name || "Hotel Stay",
            hotelLocation: state.selectedHotel?.location || "",
            roomNumber: state.selectedRoom?.roomNumber || "N/A",
            roomType: state.selectedRoom?.roomType || "Standard Room",
            price: state.selectedRoom?.price || 0
        };

        // Reset form
        const form = document.getElementById("reservationForm");
        if (form) form.reset();

        showToast("Reservation confirmed successfully! 🎉", "success");
        renderSuccessDetails(state.lastReservation);
        navigateTo("success");
    } catch (error) {
        if (formError) {
            formError.style.display = "block";
            formError.textContent = `Failed to create reservation: ${error.message}`;
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Confirm Reservation ✓`;
        }
    }
}


/* ==========================================================================
   5. BOOKING SUCCESS FEATURE
   ========================================================================== */

/**
 * Render reservation confirmation details on success screen
 */
function renderSuccessDetails(reservation) {
    const container = document.getElementById("successDetailsCard");
    if (!container || !reservation) return;

    const resId = escapeHtml(reservation.id || "RES-" + Math.floor(Math.random() * 89999 + 10000));
    const guestName = escapeHtml(reservation.customerName || "Guest");
    const guestEmail = escapeHtml(reservation.email || "N/A");
    const date = escapeHtml(reservation.reservationDate || "N/A");
    const guests = reservation.numberOfGuests || 1;
    const hotel = escapeHtml(reservation.hotelName || "Luxury Hotel");
    const room = escapeHtml(String(reservation.roomNumber || "101"));
    const roomType = escapeHtml(reservation.roomType || "Deluxe");
    const price = Number(reservation.price || 0);

    container.innerHTML = `
        <div class="success-ticket">
            <div class="ticket-header">
                <div>
                    <span class="ticket-label">RESERVATION REFERENCE</span>
                    <strong class="ticket-id">#${resId}</strong>
                </div>
                <span class="status-badge-confirmed">CONFIRMED ✅</span>
            </div>

            <div class="ticket-grid">
                <div class="ticket-item">
                    <span>Guest Name</span>
                    <strong>${guestName}</strong>
                </div>
                <div class="ticket-item">
                    <span>Contact Email</span>
                    <strong>${guestEmail}</strong>
                </div>
                <div class="ticket-item">
                    <span>Hotel</span>
                    <strong>${hotel}</strong>
                </div>
                <div class="ticket-item">
                    <span>Room</span>
                    <strong>Room ${room} (${roomType})</strong>
                </div>
                <div class="ticket-item">
                    <span>Reservation Date</span>
                    <strong>📅 ${date}</strong>
                </div>
                <div class="ticket-item">
                    <span>Guests</span>
                    <strong>👥 ${guests} ${guests === 1 ? 'Guest' : 'Guests'}</strong>
                </div>
            </div>

            ${price > 0 ? `
                <div class="ticket-footer">
                    <span>Total Amount</span>
                    <strong class="ticket-price">Rs. ${price.toLocaleString()}</strong>
                </div>
            ` : ''}
        </div>
    `;
}


/* ==========================================================================
   6. RESERVATIONS HISTORY FEATURE
   ========================================================================== */

/**
 * Fetch all reservations from the backend microservice
 */
async function fetchReservations() {
    const loader = document.getElementById("reservationsLoader");
    const emptyState = document.getElementById("reservationsEmpty");
    const grid = document.getElementById("reservationsGrid");

    if (loader) loader.style.display = "flex";
    if (emptyState) emptyState.style.display = "none";
    if (grid) grid.innerHTML = "";

    try {
        const reservations = await apiRequest("/api/reservations");
        state.reservations = Array.isArray(reservations) ? reservations : [];

        if (loader) loader.style.display = "none";

        if (state.reservations.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        renderReservationsList(state.reservations);
    } catch (error) {
        if (loader) loader.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "block";
            emptyState.querySelector("p").textContent = `Error loading reservations: ${error.message}`;
        }
    }
}

/**
 * Render reservation history cards
 */
function renderReservationsList(reservations) {
    const grid = document.getElementById("reservationsGrid");
    if (!grid) return;

    // Show newest first
    const list = [...reservations].reverse();

    grid.innerHTML = list.map((res, index) => {
        const resId = escapeHtml(res.id || `RES-${index + 1}`);
        const customerName = escapeHtml(res.customerName || "Valued Guest");
        const email = escapeHtml(res.email || "No email specified");
        const date = escapeHtml(res.reservationDate || "Confirmed");
        const guests = res.numberOfGuests || 1;

        return `
            <article class="reservation-card">
                <div class="res-card-header">
                    <div>
                        <span class="res-id-tag">REF: #${resId}</span>
                        <h3 class="res-guest-name">${customerName}</h3>
                    </div>
                    <span class="status-pill-confirmed">CONFIRMED</span>
                </div>

                <div class="res-card-body">
                    <div class="res-info-row">
                        <span class="res-icon">✉️</span>
                        <span>${email}</span>
                    </div>
                    <div class="res-info-row">
                        <span class="res-icon">📅</span>
                        <span>Reservation Date: <strong>${date}</strong></span>
                    </div>
                    <div class="res-info-row">
                        <span class="res-icon">👥</span>
                        <span>Party Size: <strong>${guests} ${guests === 1 ? 'Guest' : 'Guests'}</strong></span>
                    </div>
                </div>

                <div class="res-card-footer">
                    <button class="btn btn-outline btn-xs" onclick="deleteReservationById('${resId}')">
                        Cancel Booking
                    </button>
                    <span class="res-active-badge">Active Booking</span>
                </div>
            </article>
        `;
    }).join("");
}

/**
 * Delete / Cancel a reservation
 */
async function deleteReservationById(reservationId) {
    if (!confirm(`Are you sure you want to cancel reservation #${reservationId}?`)) {
        return;
    }

    try {
        await apiRequest(`/api/reservations/${encodeURIComponent(reservationId)}`, {
            method: "DELETE"
        });

        showToast(`Reservation #${reservationId} cancelled successfully.`, "success");
        fetchReservations(); // Refresh list
    } catch (error) {
        showToast(`Failed to cancel reservation: ${error.message}`, "error");
    }
}


/* ==========================================================================
   UTILITY & TOAST NOTIFICATION HELPERS
   ========================================================================== */

/**
 * Display a floating toast notification
 */
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    
    const icon = type === "success" ? "✓" : (type === "error" ? "⚠️" : "ℹ️");
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/**
 * Basic XSS sanitizer
 */
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================================================
   APP INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Attach form submission listener
    const form = document.getElementById("reservationForm");
    if (form) {
        form.addEventListener("submit", handleReservationSubmit);
    }

    // Default to Home View
    navigateTo("home");
});