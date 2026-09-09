# Server for GIG Platform SIH 2026

Express.js + MongoDB backend for the SIH 2026 Gig Management Platform.

**Base URL:** `http://localhost:8000`

---

## Setup

```bash
npm install
cp .env.sample .env   # fill in your values
npm run dev
```

### Environment Variables

| Variable           | Description              |
| ------------------ | ------------------------ |
| `PORT`             | Server port (default `8000`) |
| `MONGODB_USERNAME` | MongoDB username         |
| `MONGODB_PASSWORD` | MongoDB password         |
| `MONGODB_URI`      | MongoDB connection URI   |

---

## Data Models

### User

Base user record shared across all roles. Passwords are bcrypt-hashed before save.

| Field          | Type       | Required | Notes                                      |
| -------------- | ---------- | -------- | ------------------------------------------ |
| `email`        | String     | ✅       | Unique                                     |
| `password`     | String     | ✅       | Hashed with bcrypt (salt rounds: 10)       |
| `name`         | String     | ✅       |                                            |
| `mobileNumber` | String     | ✅       |                                            |
| `roles`        | [String]   |          | Enum: `worker`, `customer`, `cooperative`  |
| `createdAt`    | Date       | auto     |                                            |
| `updatedAt`    | Date       | auto     |                                            |

### Cooperative

| Field                | Type     | Required | Notes               |
| -------------------- | -------- | -------- | ------------------- |
| `userId`             | ObjectId | ✅       | Ref → `User`, unique |
| `name`               | String   | ✅       |                     |
| `registrationNumber` | String   | ✅       | Unique              |
| `address.city`       | String   | ✅       |                     |
| `address.state`      | String   | ✅       |                     |
| `address.pinCode`    | String   | ✅       |                     |
| `createdAt`          | Date     | auto     |                     |
| `updatedAt`          | Date     | auto     |                     |

### Worker

| Field            | Type     | Required | Notes                                        |
| ---------------- | -------- | -------- | -------------------------------------------- |
| `userId`         | ObjectId | ✅       | Ref → `User`, unique                         |
| `cooperativeId`  | ObjectId |          | Ref → `Cooperative`, default `null`           |
| `skills`         | [String] |          | Default `[]`                                 |
| `experience`     | Number   |          | Min: `0`                                     |
| `certifications` | [String] |          | Default `[]`                                 |
| `verification`   | String   |          | Enum: `pending`, `verified`, `rejected`. Default `pending` |
| `address`        | String   |          |                                              |
| `rating`         | Number   |          | Min: `0`, Max: `5`, default `0`              |
| `createdAt`      | Date     | auto     |                                              |
| `updatedAt`      | Date     | auto     |                                              |

### Customer

| Field                  | Type     | Required | Notes                          |
| ---------------------- | -------- | -------- | ------------------------------ |
| `userId`               | ObjectId | ✅       | Ref → `User`, unique           |
| `address`              | String   | ✅       |                                |
| `location.type`        | String   | ✅       | Enum: `Point`                  |
| `location.coordinates` | [Number] | ✅       | `[longitude, latitude]`        |

> `location` has a `2dsphere` index for geospatial queries.

---

## API Endpoints

### Health Check

#### `GET /health`

Returns server status.

**Response `200`**

```json
{
  "status": "ok"
}
```

---

### Cooperative

#### `POST /cooperative/register`

Register a new cooperative.

**Request Body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobileNumber": "string",
  "registrationNumber": "string",
  "address": {
    "city": "string",
    "state": "string",
    "pinCode": "string"
  }
}
```

**Response `201`**

```json
{
  "message": "Cooperative registered successfully",
  "cooperative": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "name": "string",
    "registrationNumber": "string",
    "address": {
      "city": "string",
      "state": "string",
      "pinCode": "string"
    },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

#### `POST /cooperative/login`

Login as a cooperative.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": { /* User object */ }
}
```

**Error `401`**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### `GET /cooperative/`

List all cooperatives.

**Response `200`**

```json
{
  "success": true,
  "cooperatives": [ /* Array of Cooperative objects */ ]
}
```

---

### Worker

#### `POST /worker/register`

Register a new worker.

**Request Body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobileNumber": "string",
  "cooperativeId": "ObjectId | null",
  "skills": ["string"],
  "experience": 0,
  "certifications": ["string"],
  "address": "string"
}
```

**Response `201`**

```json
{
  "message": "Worker registered successfully",
  "worker": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "cooperativeId": "ObjectId | null",
    "skills": ["string"],
    "experience": 0,
    "certifications": ["string"],
    "verification": "pending",
    "address": "string",
    "rating": 0,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

#### `POST /worker/login`

Login as a worker.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": { /* User object */ }
}
```

**Error `401`**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### `GET /worker/`

List workers. Optionally filter by cooperative.

**Query Parameters**

| Parameter       | Type     | Required | Description                        |
| --------------- | -------- | -------- | ---------------------------------- |
| `cooperativeId` | ObjectId |          | Filter workers by cooperative ID   |

**Response `200`**

Workers are returned with populated user data (`name`, `email`, `mobileNumber`).

```json
{
  "success": true,
  "workers": [
    {
      "_id": "ObjectId",
      "userId": {
        "_id": "ObjectId",
        "name": "string",
        "email": "string",
        "mobileNumber": "string"
      },
      "cooperativeId": "ObjectId | null",
      "skills": ["string"],
      "experience": 0,
      "certifications": ["string"],
      "verification": "pending",
      "address": "string",
      "rating": 0,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### Customer

#### `POST /customer/register`

Register a new customer.

**Request Body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobileNumber": "string",
  "address": "string",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```

**Response `201`**

```json
{
  "message": "Customer registered successfully",
  "customer": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "address": "string",
    "location": {
      "type": "Point",
      "coordinates": [0, 0]
    }
  }
}
```

---

#### `POST /customer/login`

Login as a customer.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": { /* User object */ }
}
```

**Error `401`**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status Code | Meaning                |
| ----------- | ---------------------- |
| `401`       | Invalid credentials    |
| `500`       | Internal server error  |

---

## Endpoint Summary

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| `GET`  | `/health`                | Health check                             |
| `GET`  | `/cooperative/`          | List all cooperatives                    |
| `POST` | `/cooperative/register`  | Register a cooperative                   |
| `POST` | `/cooperative/login`     | Login as cooperative                     |
| `GET`  | `/worker/`               | List workers (optional `?cooperativeId`) |
| `POST` | `/worker/register`       | Register a worker                        |
| `POST` | `/worker/login`          | Login as worker                          |
| `POST` | `/customer/register`     | Register a customer                      |
| `POST` | `/customer/login`        | Login as customer                        |
