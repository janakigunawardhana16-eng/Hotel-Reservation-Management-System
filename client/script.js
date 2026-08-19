const API_GATEWAY = "http://localhost:8080";

function showSection(sectionName) {
    const sections = ["users", "hotels", "rooms", "reservations"];

    sections.forEach(section => {
        document.getElementById(section).style.display = "none";
    });

    document.getElementById(sectionName).style.display = "block";
}


// ====================
// USER SERVICE
// ====================

async function loadUsers() {
    try {
        const response = await fetch(`${API_GATEWAY}/api/users`, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href =
                `${API_GATEWAY}/oauth2/authorization/google`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const users = await response.json();

        document.getElementById("usersResult").innerHTML =
            `<pre>${JSON.stringify(users, null, 2)}</pre>`;

    } catch (error) {
        document.getElementById("usersResult").innerHTML =
            `<p>Error loading users: ${error.message}</p>`;
    }
}


// ====================
// HOTEL SERVICE
// ====================

async function loadHotels() {
    try {
        const response = await fetch(`${API_GATEWAY}/api/hotels`, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href =
                `${API_GATEWAY}/oauth2/authorization/google`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const hotels = await response.json();

        document.getElementById("hotelsResult").innerHTML =
            `<pre>${JSON.stringify(hotels, null, 2)}</pre>`;

    } catch (error) {
        document.getElementById("hotelsResult").innerHTML =
            `<p>Error loading hotels: ${error.message}</p>`;
    }
}


// ====================
// ROOM SERVICE
// ====================

async function loadRooms() {
    try {
        const response = await fetch(`${API_GATEWAY}/api/rooms`, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href =
                `${API_GATEWAY}/oauth2/authorization/google`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const rooms = await response.json();

        document.getElementById("roomsResult").innerHTML =
            `<pre>${JSON.stringify(rooms, null, 2)}</pre>`;

    } catch (error) {
        document.getElementById("roomsResult").innerHTML =
            `<p>Error loading rooms: ${error.message}</p>`;
    }
}


// ====================
// RESERVATION SERVICE
// ====================

async function loadReservations() {
    try {
        const response = await fetch(`${API_GATEWAY}/api/reservations`, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href =
                `${API_GATEWAY}/oauth2/authorization/google`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const reservations = await response.json();

        document.getElementById("reservationsResult").innerHTML =
            `<pre>${JSON.stringify(reservations, null, 2)}</pre>`;

    } catch (error) {
        document.getElementById("reservationsResult").innerHTML =
            `<p>Error loading reservations: ${error.message}</p>`;
    }
}