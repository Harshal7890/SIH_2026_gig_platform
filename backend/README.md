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

## Authentication

Protected routes require the following header:

| Header    | Type     | Description                          |
| --------- | -------- | ------------------------------------ |
| `user-id` | ObjectId | The `_id` of the authenticated User  |

The `authenticateUser` middleware looks up the user by this header. If the user is not found, the request is rejected with `401`.

Some routes additionally use `requireRole(role)` which checks that the authenticated user's `roles` array includes the required role. If not, the request is rejected with `403`.

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

List workers belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

**Request Headers**

| Header    | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `user-id` | ObjectId | ✅       | The `_id` of the authenticated User |

**Response `200`**

Workers are automatically filtered to those belonging to the authenticated cooperative. User data (`name`, `email`, `mobileNumber`) is populated.

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
      "cooperativeId": "ObjectId",
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

**Error `401`**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error `403`**

```json
{
  "success": false,
  "message": "Requires cooperative role"
}
```

**Error `404`**

```json
{
  "success": false,
  "message": "Cooperative profile not found"
}
```

---

#### `PUT /worker/:id`

Update a worker belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

**Request Headers**

| Header    | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `user-id` | ObjectId | ✅       | The `_id` of the authenticated User |

**URL Parameters**

| Param | Type     | Description                |
| ----- | -------- | -------------------------- |
| `id`  | ObjectId | The `_id` of the Worker    |

**Request Body**

All fields are optional. Only provided fields will be updated.

```json
{
  "skills": ["string"],
  "experience": 0,
  "certifications": ["string"],
  "address": "string"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Worker updated successfully",
  "worker": { /* Updated Worker object */ }
}
```

**Error `404`**

```json
{
  "success": false,
  "message": "Worker not found in your cooperative"
}
```

---

#### `DELETE /worker/:id`

Delete a worker belonging to the authenticated cooperative. Also removes the associated User record.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

**Request Headers**

| Header    | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `user-id` | ObjectId | ✅       | The `_id` of the authenticated User |

**URL Parameters**

| Param | Type     | Description                |
| ----- | -------- | -------------------------- |
| `id`  | ObjectId | The `_id` of the Worker    |

**Response `200`**

```json
{
  "success": true,
  "message": "Worker deleted successfully"
}
```

**Error `404`**

```json
{
  "success": false,
  "message": "Worker not found in your cooperative"
}
```

---

#### `PATCH /worker/:id/verify`

Update the verification status of a worker belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

**Request Headers**

| Header    | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `user-id` | ObjectId | ✅       | The `_id` of the authenticated User |

**URL Parameters**

| Param | Type     | Description                |
| ----- | -------- | -------------------------- |
| `id`  | ObjectId | The `_id` of the Worker    |

**Request Body**

```json
{
  "status": "pending | verified | rejected"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Worker verification status updated to 'verified'",
  "worker": { /* Updated Worker object */ }
}
```

**Error `400`**

```json
{
  "success": false,
  "message": "Invalid verification status. Must be: pending, verified, or rejected"
}
```

**Error `404`**

```json
{
  "success": false,
  "message": "Worker not found in your cooperative"
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

| Status Code | Meaning                                |
| ----------- | -------------------------------------- |
| `401`       | Invalid credentials / Unauthorized     |
| `403`       | Missing required role                  |
| `404`       | Resource not found                     |
| `500`       | Internal server error                  |

---

## Endpoint Summary

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| `GET`  | `/health`                | Health check                             |
| `GET`  | `/cooperative/`          | List all cooperatives                    |
| `POST` | `/cooperative/register`  | Register a cooperative                   |
| `POST` | `/cooperative/login`     | Login as cooperative                     |
| `GET`    | `/worker/`               | List cooperative's workers 🔒           |
| `POST`   | `/worker/register`       | Register a worker                        |
| `POST`   | `/worker/login`          | Login as worker                          |
| `PUT`    | `/worker/:id`            | Update a worker 🔒                      |
| `DELETE` | `/worker/:id`            | Delete a worker 🔒                      |
| `PATCH`  | `/worker/:id/verify`     | Verify a worker 🔒                      |
| `POST` | `/customer/register`     | Register a customer                      |
| `POST` | `/customer/login`        | Login as customer                        |
