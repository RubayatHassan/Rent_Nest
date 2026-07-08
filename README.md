# RentNest Backend API

RentNest is a rental property backend built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Base URL

```txt
http://localhost:5000
```

## Auth Header

Protected routes need this header:

```txt
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

## Roles

```txt
TENANT
LANDLORD
ADMIN
```

## Common Status Values

```txt
activeStatus: ACTIVE | BLOCKED
property status: AVAILABLE | UNAVAILABLE | RENTED
rental status: PENDING | APPROVED | REJECTED | ACTIVE | COMPLETED | CANCELLED
payment provider: STRIPE | SSLCOMMERZ
payment method: CARD | MOBILE_BANKING | BANK_TRANSFER
payment status: PENDING | COMPLETED | FAILED | REFUNDED
```

## All API Endpoints

### Root

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | API health message |

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register tenant or landlord |
| POST | `/api/auth/login` | Public | Login and get tokens |
| POST | `/api/auth/refresh-token` | Public | Get new access token |
| GET | `/api/auth/me` | Authenticated | Get current logged-in user |

Register body:

```json
{
  "name": "Tenant User",
  "email": "tenant@example.com",
  "password": "123456",
  "role": "TENANT",
  "phone": "01700000000",
  "address": "Dhaka",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

Login body:

```json
{
  "email": "tenant@example.com",
  "password": "123456"
}
```

Refresh token body:

```json
{
  "refreshToken": "REFRESH_TOKEN_HERE"
}
```

### User Profile

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/users/me` | Tenant, Landlord, Admin | Get own profile |
| PATCH | `/api/users/me` | Tenant, Landlord, Admin | Update own profile |
| DELETE | `/api/users/me/profile-photo` | Tenant, Landlord, Admin | Remove profile photo |
| DELETE | `/api/users/me` | Tenant, Landlord, Admin | Deactivate own account |

Update profile body:

```json
{
  "name": "Updated Name",
  "phone": "01800000000",
  "address": "Mirpur, Dhaka",
  "profilePhoto": "https://example.com/new-photo.jpg"
}
```

### Public Properties

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/properties` | Public | Get available properties with filters |
| GET | `/api/properties/:id` | Public | Get property details |

Property query params:

```txt
searchTerm
location
minPrice
maxPrice
categoryId
propertyType
amenities=WiFi,Parking,Lift
page
limit
sortBy=createdAt|updatedAt|rentAmount|title|location
sortOrder=asc|desc
```

Example:

```txt
/api/properties?location=Dhaka&minPrice=10000&maxPrice=30000&page=1&limit=10&sortBy=rentAmount&sortOrder=asc
```

### Public Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | Get categories |
| GET | `/api/categories/:categoryId` | Public | Get category details |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:categoryId` | Admin | Update category |

Category query params:

```txt
searchTerm
page
limit
```

Create category body:

```json
{
  "name": "Apartment",
  "description": "Apartment rental properties"
}
```

Update category body:

```json
{
  "name": "Family Apartment",
  "description": "Updated category description"
}
```

### Landlord

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/landlord/properties` | Landlord | Create property listing |
| GET | `/api/landlord/properties` | Landlord | Get own properties |
| PUT | `/api/landlord/properties/:id` | Landlord | Update own property |
| DELETE | `/api/landlord/properties/:id` | Landlord | Remove property from public availability |
| GET | `/api/landlord/requests` | Landlord | Get rental requests for own properties |
| PATCH | `/api/landlord/requests/:id` | Landlord | Approve or reject rental request |

Create property body:

```json
{
  "title": "Modern Apartment in Dhanmondi",
  "description": "A clean and spacious 2 bedroom apartment near main road.",
  "location": "Dhanmondi, Dhaka",
  "address": "Road 7, Dhanmondi",
  "rentAmount": 25000,
  "bedrooms": 2,
  "bathrooms": 2,
  "areaSqft": 950,
  "amenities": ["WiFi", "Gas", "Lift", "Parking"],
  "images": [
    "https://example.com/property-1.jpg",
    "https://example.com/property-2.jpg"
  ],
  "categoryId": "CATEGORY_ID_HERE"
}
```

Update property body:

```json
{
  "title": "Updated Apartment Title",
  "rentAmount": 27000,
  "status": "AVAILABLE",
  "amenities": ["WiFi", "Gas", "Lift", "Parking", "Security"]
}
```

Approve/reject rental request body:

```json
{
  "status": "APPROVED"
}
```

or

```json
{
  "status": "REJECTED"
}
```

### Rentals

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/rentals` | Tenant | Submit rental request |
| GET | `/api/rentals` | Tenant | Get own rental requests |
| GET | `/api/rentals/:id` | Tenant, Landlord, Admin | Get rental request details |
| PATCH | `/api/rentals/:id/cancel` | Tenant | Cancel own pending rental request |

Create rental request body:

```json
{
  "propertyId": "PROPERTY_ID_HERE",
  "message": "I want to rent this property from next month.",
  "moveInDate": "2026-08-01T00:00:00.000Z",
  "durationMonths": 12
}
```

Cancel rental request body:

```json
{}
```

Only `PENDING` rental requests can be cancelled.

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/payments/create` | Tenant | Create payment session for approved rental |
| POST | `/api/payments/confirm` | Public/System | Confirm payment manually or by callback |
| GET | `/api/payments/success` | Stripe Redirect | Stripe success callback |
| GET | `/api/payments/cancel` | Stripe Redirect | Stripe cancel callback |
| GET | `/api/payments` | Tenant | Get own payment history |
| GET | `/api/payments/:id` | Tenant, Landlord, Admin | Get payment details |

Create Stripe payment body:

```json
{
  "rentalRequestId": "RENTAL_REQUEST_ID_HERE",
  "provider": "STRIPE",
  "method": "CARD"
}
```

Create SSLCOMMERZ/manual payment body:

```json
{
  "rentalRequestId": "RENTAL_REQUEST_ID_HERE",
  "provider": "SSLCOMMERZ",
  "method": "MOBILE_BANKING"
}
```

Confirm payment body with Stripe session:

```json
{
  "stripeSessionId": "cs_test_..."
}
```

Confirm payment body manually:

```json
{
  "paymentId": "PAYMENT_ID_HERE",
  "transactionId": "TRANSACTION_ID_HERE",
  "status": "COMPLETED",
  "gatewayResponse": {
    "source": "manual-confirm"
  }
}
```

Stripe success URL format:

```txt
/api/payments/success?session_id=cs_test_...
```

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/reviews` | Tenant | Create review after completed payment |
| PATCH | `/api/reviews/:id` | Tenant | Update own review |
| DELETE | `/api/reviews/:id` | Tenant | Delete own review |

Create review body:

```json
{
  "rentalRequestId": "RENTAL_REQUEST_ID_HERE",
  "rating": 5,
  "comment": "Great property and smooth rental process."
}
```

Update review body:

```json
{
  "rating": 4,
  "comment": "Updated review comment."
}
```

For update/delete, `:id` can be either `reviewId` or `rentalRequestId`.

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | Admin | Get users with pagination/filter |
| GET | `/api/admin/users/:id` | Admin | Get single user details |
| PATCH | `/api/admin/users/:id` | Admin | Ban or unban user |
| GET | `/api/admin/properties` | Admin | Get properties with pagination/filter |
| GET | `/api/admin/properties/:id` | Admin | Get single property details |
| PATCH | `/api/admin/properties/:id/status` | Admin | Update property status |
| GET | `/api/admin/categories` | Admin | Get categories with pagination/search |
| GET | `/api/admin/categories/:categoryId` | Admin | Get single category details |
| POST | `/api/admin/categories` | Admin | Create category |
| PATCH | `/api/admin/categories/:categoryId` | Admin | Update category |
| GET | `/api/admin/payments` | Admin | Get payments with pagination/filter |
| GET | `/api/admin/payments/:id` | Admin | Get single payment details |
| GET | `/api/admin/rentals` | Admin | Get rental requests with pagination/filter |
| PATCH | `/api/admin/rentals/:id/status` | Admin | Update rental status |
| DELETE | `/api/admin/reviews/:id` | Admin | Delete any tenant review |

Admin users query params:

```txt
searchTerm
role=TENANT|LANDLORD|ADMIN
activeStatus=ACTIVE|BLOCKED
page
limit
```

Admin properties query params:

```txt
searchTerm
location
categoryId
landlordId
status=AVAILABLE|UNAVAILABLE|RENTED
page
limit
```

Admin payments query params:

```txt
userId
rentalRequestId
status=PENDING|COMPLETED|FAILED|REFUNDED
provider=STRIPE|SSLCOMMERZ
page
limit
```

Admin rentals query params:

```txt
status=PENDING|APPROVED|REJECTED|ACTIVE|COMPLETED|CANCELLED
tenantId
propertyId
landlordId
page
limit
```

## PATCH And DELETE Guide

### PATCH Endpoints

| Endpoint | Role | Body | Notes |
| --- | --- | --- | --- |
| `PATCH /api/users/me` | Tenant, Landlord, Admin | `name`, `phone`, `address`, `profilePhoto` | Own profile update |
| `PATCH /api/categories/:categoryId` | Admin | `name`, `description` | Public admin-protected route |
| `PATCH /api/landlord/requests/:id` | Landlord | `status` | Only `APPROVED` or `REJECTED` |
| `PATCH /api/rentals/:id/cancel` | Tenant | empty body `{}` | Only pending request can be cancelled |
| `PATCH /api/reviews/:id` | Tenant | `rating`, `comment` | Only own review |
| `PATCH /api/admin/users/:id` | Admin | `activeStatus` | `ACTIVE` or `BLOCKED` |
| `PATCH /api/admin/properties/:id/status` | Admin | `status` | `AVAILABLE`, `UNAVAILABLE`, `RENTED` |
| `PATCH /api/admin/categories/:categoryId` | Admin | `name`, `description` | Admin category update |
| `PATCH /api/admin/rentals/:id/status` | Admin | `status` | Any rental status value |

Profile update:

```json
{
  "name": "Updated Name",
  "phone": "01800000000",
  "address": "Dhaka",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

Category update:

```json
{
  "name": "Studio Apartment",
  "description": "Updated category details"
}
```

Landlord approve/reject request:

```json
{
  "status": "APPROVED"
}
```

Tenant cancel rental request:

```json
{}
```

Review update:

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

Admin user ban/unban:

```json
{
  "activeStatus": "BLOCKED"
}
```

Admin property status update:

```json
{
  "status": "UNAVAILABLE"
}
```

Admin rental status update:

```json
{
  "status": "COMPLETED"
}
```

### DELETE Endpoints

| Endpoint | Role | Body | Actual Behavior |
| --- | --- | --- | --- |
| `DELETE /api/users/me/profile-photo` | Tenant, Landlord, Admin | No body | Sets `profilePhoto` to `null` |
| `DELETE /api/users/me` | Tenant, Landlord, Admin | No body | Deactivates account by setting `activeStatus` to `BLOCKED` |
| `DELETE /api/landlord/properties/:id` | Landlord | No body | Sets property `status` to `UNAVAILABLE`, does not hard delete |
| `DELETE /api/reviews/:id` | Tenant | No body | Deletes own review only |
| `DELETE /api/admin/reviews/:id` | Admin | No body | Admin can delete any review |

Remove profile photo:

```txt
DELETE /api/users/me/profile-photo
```

Deactivate own account:

```txt
DELETE /api/users/me
```

Remove landlord property from public availability:

```txt
DELETE /api/landlord/properties/PROPERTY_ID_HERE
```

Delete own review:

```txt
DELETE /api/reviews/REVIEW_ID_OR_RENTAL_REQUEST_ID_HERE
```

Admin delete any review:

```txt
DELETE /api/admin/reviews/REVIEW_ID_HERE
```

## Important Notes

- Admin registration is not allowed from public register endpoint.
- Public property list only shows `AVAILABLE` properties.
- Landlord delete property does not hard delete data; it sets property status to `UNAVAILABLE`.
- User account delete does not hard delete data; it sets user `activeStatus` to `BLOCKED`.
- Category delete route is removed to avoid deleting related properties and history.
- Stripe payment amount is taken from the property rent amount in the database.
- Tenant can review only after successful completed payment.