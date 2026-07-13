# LegalEase - Backend API

## Live API
**Base URL**: https://legalease-server-iqg1.onrender.com

---

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
```
**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "12345678",
  "confirmPassword": "12345678",
  "role": "user"
}
```
**Response:**
```json
{
  "message": "Account created successfully.",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
```
**Request:**
```json
{
  "email": "john@example.com",
  "password": "12345678"
}
```
**Response:**
```json
{
  "message": "Login successful.",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Lawyers (Public)

#### Get All Lawyers
```http
GET /api/lawyers?search=corporate&page=1&limit=8
```
**Query Params:** search, page, limit, specialization, status, minFee, maxFee

**Response:**
```json
{
  "lawyers": [...],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

#### Get Lawyer by ID
```http
GET /api/lawyers/:id
```

---

### Lawyers (Private - Lawyer only)

#### Create Profile
```http
POST /api/lawyers
```
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "John Doe",
  "photo": "image_url",
  "specialization": "Corporate Law",
  "bio": "Experienced corporate lawyer...",
  "hourlyRate": 60
}
```

#### Update Profile
```http
PATCH /api/lawyers/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Get My Profile
```http
GET /api/lawyers/my-profile
```
**Headers:** `Authorization: Bearer <token>`

---

### Hiring (Private)

#### Create Hiring Request (User only)
```http
POST /api/hiring
```
**Headers:** `Authorization: Bearer <token>`
```json
{ "lawyerId": "lawyer_id" }
```

#### Get My Requests (User only)
```http
GET /api/hiring/my-requests
```
**Headers:** `Authorization: Bearer <token>`

#### Get Received Requests (Lawyer only)
```http
GET /api/hiring/received
```
**Headers:** `Authorization: Bearer <token>`

#### Accept/Reject (Lawyer only)
```http
PATCH /api/hiring/:id/status
```
**Headers:** `Authorization: Bearer <token>`
```json
{ "status": "accepted" }
```

#### Make Payment (User only)
```http
PATCH /api/hiring/:id/pay
```
**Headers:** `Authorization: Bearer <token>`

---

### Comments

#### Create Comment (User only)
```http
POST /api/comments
```
**Headers:** `Authorization: Bearer <token>`
```json
{
  "lawyerId": "lawyer_id",
  "text": "Excellent lawyer!",
  "rating": 5
}
```

#### Get Comments by Lawyer (Public)
```http
GET /api/comments/lawyer/:id
```

#### Get My Comments (User only)
```http
GET /api/comments/my-comments
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Comment (User only)
```http
DELETE /api/comments/:id
```
**Headers:** `Authorization: Bearer <token>`

---

### Admin (Admin only)

#### Get All Users
```http
GET /api/users
```
**Headers:** `Authorization: Bearer <token>`

#### Change User Role
```http
PATCH /api/users/:id/role
```
**Headers:** `Authorization: Bearer <token>`
```json
{ "role": "admin" }
```

#### Delete User
```http
DELETE /api/users/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Get All Transactions
```http
GET /api/transactions
```
**Headers:** `Authorization: Bearer <token>`

#### Get Analytics
```http
GET /api/admin/analytics
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "totalUsers": 10,
  "totalLawyers": 5,
  "totalHires": 20,
  "totalRevenue": 1200
}
```

---

## Database Schema

### User
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  photoURL: String,
  role: String (user/lawyer/admin),
  provider: String (credentials/google),
  hasPaidPublishingFee: Boolean
}
```

### Lawyer
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  photo: String,
  specialization: String,
  bio: String,
  hourlyRate: Number,
  status: String (available/busy),
  isPublished: Boolean,
  totalHires: Number
}
```

### HiringRequest
```javascript
{
  client: ObjectId (ref: User),
  lawyer: ObjectId (ref: Lawyer),
  fee: Number,
  status: String (pending/accepted/rejected),
  isPaid: Boolean,
  transactionId: String
}
```

### Comment
```javascript
{
  user: ObjectId (ref: User),
  lawyer: ObjectId (ref: Lawyer),
  text: String,
  rating: Number (1-5),
  type: String (positive/neutral/negative)
}
```

### Transaction
```javascript
{
  transactionId: String (unique),
  user: ObjectId (ref: User),
  lawyer: ObjectId (ref: Lawyer),
  hiringRequest: ObjectId (ref: HiringRequest),
  amount: Number
}
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=https://legalease-client-weld.vercel.app
```

---

## Local Setup

```bash
npm install
npm run dev
```

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose
- **Authentication**: JWT + bcrypt
- **Deployment**: Render

---

## Developer

**Sultana Bristy**
- GitHub: https://github.com/SultanaBristy226

---

