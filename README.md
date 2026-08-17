# Hotel Reservation & Management System

## Project Overview

The Hotel Reservation & Management System is a Service-Oriented Computing group project developed using a microservices architecture.

The system consists of separate backend microservices for users, hotels/rooms, and reservations, together with an API Gateway and a unified web client.

The system is designed to provide a centralized platform for managing users, hotels, rooms, and hotel reservations.

---

## Architecture

The system consists of the following components:

| Component | Technology | Port |
|---|---|---:|
| User Service | Spring Boot / Java 21 | 8081 |
| Hotel / Room Service | Spring Boot / Java 21 | 8082 |
| Reservation Service | Spring Boot / Java 21 | 8083 |
| API Gateway | Spring Boot / Spring Cloud | 8080 |
| Unified Client | HTML / CSS / JavaScript / Nginx | 3000 |
| MongoDB | MongoDB | 27017 |

### Architecture Flow

```text
                    ┌──────────────────────┐
                    │    Unified Client    │
                    │ HTML / CSS / JS      │
                    │      Port 3000       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     API Gateway      │
                    │ Spring Cloud Gateway │
                    │      Port 8080       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
      │ User Service │ │ Hotel / Room │ │   Reservation   │
      │    :8081     │ │    :8082     │ │    Service      │
      │              │ │              │ │     :8083       │
      └──────┬───────┘ └──────┬───────┘ └────────┬────────┘
             │                │                  │
             ▼                ▼                  ▼
        ┌──────────┐     ┌──────────┐      ┌──────────────┐
        │ MongoDB  │     │ MongoDB  │      │    MongoDB   │
        │ User DB  │     │ Hotel DB │      │ Reservation  │
        └──────────┘     └──────────┘      └──────────────┘ 

        ---

## Microservices

### 1. User Service

The User Service is responsible for managing system users.

**Technology:**
- Spring Boot
- Java 21
- MongoDB
- REST API
- API Key Security
- Swagger / OpenAPI
- Postman
- Docker

**Port:**

```text
8081

---

### 2. Hotel / Room Service

The Hotel / Room Service is responsible for managing hotels and rooms.

**Technology:**
- Spring Boot
- Java 21
- MongoDB
- REST API
- API Key Security
- Swagger / OpenAPI
- Postman
- Docker

**Port:**
```text
8082

---

### 3. Reservation Service
The Reservation Service is responsible for managing hotel reservations.

**Technology:**
- Spring Boot
- Java 21
- MongoDB
- REST API
- API Key Security
- Swagger / OpenAPI
- Postman
- Docker

**Port:**
```text
8083

```

**Database:**
```text
reservation_db
```

**Base API:**
```text
/api/reservations
```

**CRUD Operations:**
```text
POST   /api/reservations
GET    /api/reservations
GET    /api/reservations/{id}
PUT    /api/reservations/{id}
DELETE /api/reservations/{id}
```
---

## API Gateway

The API Gateway provides a single entry point for the unified client.

**Technology:**
- Spring Boot
- Spring Cloud Gateway
- Spring Security
- OAuth 2.0

**Port:**

```text
8080
```

### Gateway Routes

```text
/api/users/**          → User Service :8081
/api/hotels/**         → Hotel / Room Service :8082
/api/rooms/**          → Hotel / Room Service :8082
/api/reservations/**   → Reservation Service :8083
```
---

## Security

Each backend microservice uses API Key security.

Example:

```text
X-API-KEY: user-secret-key-123
X-API-KEY: hotel-secret-key
X-API-KEY: reservation-secret-key
```

Google OAuth 2.0 is configured at the API Gateway.

Sensitive credentials are not included in the project documentation.
---

## Database

MongoDB is used as the database for the microservices.

The system uses separate databases for each service:

| Service | Database |
|---|---|
| User Service | user_db |
| Hotel / Room Service | hotel_db |
| Reservation Service | reservation_db |

MongoDB runs on port:

```text
27017
---

## Docker

The system uses Docker to containerize the microservices, API Gateway, MongoDB, and unified client.

### Docker Compose

All services are managed using Docker Compose.

The main services are:

```text
mongodb             → 27017
user-service        → 8081
hotel-service       → 8082
reservation-service → 8083
api-gateway         → 8080
client              → 3000
```

To build and start all services:

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```
---

## Testing

The microservices are tested using Postman and MongoDB.

### API Testing

The following operations are tested for each service:

- POST
- GET all
- GET by ID
- PUT
- DELETE

### Database Verification

Created and updated data is verified using MongoDB.

### End-to-End Testing

The complete system is tested through the API Gateway to verify communication between the unified client and all backend microservices.
---

## Unified Client

The system provides a single web client for accessing the hotel management services.

**Technology:**
- HTML
- CSS
- JavaScript
- Nginx

**Port:**

```text
3000
```

The client communicates with the backend microservices through the API Gateway.

### Main Functions

- View users
- View hotels
- View rooms
- View reservations
- Manage reservations through the Reservation Service

---

## Project Structure

```text
Hotel-Reservation-Management-System/
│
├── api-gateway/
├── user-service/
├── hotel-service/
├── reservation-service/
├── client/
├── docker-compose.yml
├── .gitignore
└── README.md
---

## How to Run

### 1. Start MongoDB

Make sure MongoDB is running on port `27017`.

### 2. Build the Backend Services

Build each Spring Boot microservice using Maven.

```bash
.\mvnw.cmd clean package -DskipTests
```

### 3. Start the System Using Docker Compose

From the project root directory:

```bash
docker compose up --build
```

### 4. Access the Unified Client

Open:

```text
http://localhost:3000
```

### 5. API Gateway

The API Gateway is available at:

```text
http://localhost:8080
```
---

## API Documentation

Swagger / OpenAPI documentation is provided for the backend microservices.

The API documentation can be accessed through the Swagger UI of each service.

```text
User Service       → http://localhost:8081/swagger-ui/index.html
Hotel / Room       → http://localhost:8082/swagger-ui/index.html
Reservation        → http://localhost:8083/swagger-ui/index.html
```

Swagger UI can be used to view and test the available REST API endpoints.
---

## Team Responsibilities

### Member 1 – User Service
- User CRUD operations
- API Key security
- Swagger / OpenAPI
- Postman testing
- MongoDB
- Docker

### Member 2 – Hotel / Room Service
- Hotel CRUD operations
- Room CRUD operations
- API Key security
- Swagger / OpenAPI
- Postman testing
- MongoDB
- Docker

### Member 3 – Reservation Service
- Reservation CRUD operations
- API Key security
- Swagger / OpenAPI
- Postman testing
- MongoDB
- Docker

### All Members
- Unified client
- Docker Compose
- Final integration
- End-to-end testing
- GitHub
- README
- Architecture diagram
- Report
---

## Project Deliverables

The project deliverables include:

- Working microservices
- REST APIs
- API Gateway
- Unified web client
- MongoDB databases
- Docker configuration
- Docker Compose configuration
- Swagger / OpenAPI documentation
- Postman API testing
- End-to-end integration
- GitHub repository
- README documentation
- Architecture diagram
- Final report