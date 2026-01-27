# API Usage Guide - Schele Management System

## 🌐 Base URL

**Development**: `http://localhost:3001`
**Production**: `https://backend-schele.360digital.ro`

## 🔗 Quick Links

- **Health Check**: http://localhost:3001/health
- **API Info**: http://localhost:3001/api
- **Create User**: http://localhost:3001/auth/register

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Clients](#clients)
4. [Projects](#projects)
5. [Scaffolds](#scaffolds)
6. [Scaffold Components](#scaffold-components)
7. [Work Reports](#work-reports)
8. [Proforma Invoices](#proforma-invoices)
9. [Dashboard](#dashboard)

---

## 🔐 Authentication

All endpoints require JWT authentication except the public ones marked with 🌍.

### Register User 🌍

**First user created will be ADMIN automatically**. Subsequent ADMIN users can only be created by existing ADMIN users.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "ADMIN" | "OPERATOR" | "ACCOUNTING" | "CLIENT"
}
```

**Response**:
```json
{
  "id": "cmkp53jur0000ccysn8wj8xks",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "createdAt": "2026-01-22T07:37:55.011Z"
}
```

### Login 🌍

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@local.dev",
  "password": "admin123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmkdosxl50000ccygsxej1odo",
    "email": "admin@local.dev",
    "name": "Administrator",
    "role": "ADMIN"
  }
}
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

### Verify Token

```http
GET /auth/verify
Authorization: Bearer <token>
```

---

## 👤 Default Credentials

A default admin user is created automatically:

- **Email**: `admin@local.dev`
- **Password**: `admin123`
- **Role**: `ADMIN`

⚠️ **IMPORTANT**: Change this password after first login!

---

## 👥 Clients

### Create Client

```http
POST /clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ABC Company SRL",
  "code": "ABC001",
  "taxId": "RO12345678",
  "address": "Str. Exemplu nr. 1, București",
  "phone": "+40712345678",
  "email": "contact@abc.com",
  "notes": "Client important"
}
```

### Get All Clients

```http
GET /clients
Authorization: Bearer <token>
```

### Get Client by ID

```http
GET /clients/:id
Authorization: Bearer <token>
```

### Update Client

```http
PATCH /clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ABC Company SRL - Updated",
  "phone": "+40712345679"
}
```

### Delete Client (Soft Delete)

```http
DELETE /clients/:id
Authorization: Bearer <token>
```

---

## 📁 Projects

### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Proiect Construcție Mall",
  "code": "PROJ001",
  "clientId": "client_id_here",
  "location": "București, Sector 1",
  "description": "Montare schele pentru construcție mall"
}
```

### Get All Projects

```http
GET /projects
Authorization: Bearer <token>
```

### Get Project by ID

```http
GET /projects/:id
Authorization: Bearer <token>
```

### Update Project

```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "București, Sector 2"
}
```

### Delete Project (Soft Delete)

```http
DELETE /projects/:id
Authorization: Bearer <token>
```

---

## 🏗️ Scaffolds

### Create Scaffold

```http
POST /scaffolds
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "SCH-001",
  "status": "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED",
  "currentProjectId": "project_id_here",
  "location": "Depozit Central",
  "notes": "Schemă nouă"
}
```

### Get All Scaffolds

```http
GET /scaffolds
Authorization: Bearer <token>
```

### Get Scaffold by ID

```http
GET /scaffolds/:id
Authorization: Bearer <token>
```

### Update Scaffold

```http
PATCH /scaffolds/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_USE",
  "currentProjectId": "project_id_here"
}
```

### Delete Scaffold (Soft Delete)

```http
DELETE /scaffolds/:id
Authorization: Bearer <token>
```

---

## 🔩 Scaffold Components

### Create Component

```http
POST /components
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Țeavă 2m",
  "code": "COMP-001",
  "type": "Țeavă",
  "totalStock": 100,
  "availableStock": 80,
  "currentProjectId": "project_id_here",
  "location": "Depozit A",
  "notes": "Componentă standard"
}
```

### Get All Components

```http
GET /components
Authorization: Bearer <token>
```

### Get Component by ID

```http
GET /components/:id
Authorization: Bearer <token>
```

### Update Component

```http
PATCH /components/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "availableStock": 75
}
```

### Delete Component (Soft Delete)

```http
DELETE /components/:id
Authorization: Bearer <token>
```

---

## 📝 Work Reports

### Create Work Report

```http
POST /work-reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "PV-001",
  "clientId": "client_id_here",
  "projectId": "project_id_here",
  "workType": "INSTALLATION" | "UNINSTALLATION" | "MODIFICATION",
  "reportDate": "2026-01-22T10:00:00Z",
  "location": "București, Sector 1",
  "notes": "Montare schele nivel 1"
}
```

### Get All Work Reports

```http
GET /work-reports
Authorization: Bearer <token>
```

### Get Work Report by ID

```http
GET /work-reports/:id
Authorization: Bearer <token>
```

### Update Work Report

```http
PATCH /work-reports/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Montare finalizată"
}
```

### Add Item to Work Report

```http
POST /work-reports/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "scaffoldComponentId": "component_id_here",
  "quantity": 50,
  "length": 2.0,
  "weight": 100.5,
  "unitOfMeasure": "METER" | "KILOGRAM" | "PIECE" | "SQUARE_METER",
  "notes": "Țevi 2m"
}
```

### Bill Work Report (Make Immutable)

```http
POST /work-reports/:id/bill
Authorization: Bearer <token>
```

**Note**: Once billed, work reports cannot be modified.

### Delete Work Report (Soft Delete)

```http
DELETE /work-reports/:id
Authorization: Bearer <token>
```

---

## 💰 Proforma Invoices

### Create Proforma Invoice

```http
POST /proformas
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "PROF-001",
  "clientId": "client_id_here",
  "workReportIds": ["work_report_id_1", "work_report_id_2"],
  "issueDate": "2026-01-22T10:00:00Z",
  "dueDate": "2026-02-22T10:00:00Z",
  "notes": "Proforma pentru luna ianuarie"
}
```

**Note**: All work reports must belong to the same client and will be automatically marked as BILLED.

### Get All Proforma Invoices

```http
GET /proformas
Authorization: Bearer <token>
```

### Get Proforma Invoice by ID

```http
GET /proformas/:id
Authorization: Bearer <token>
```

### Delete Proforma Invoice (Soft Delete)

```http
DELETE /proformas/:id
Authorization: Bearer <token>
```

---

## 📊 Dashboard

### Get Dashboard Summary

```http
GET /dashboard/summary
Authorization: Bearer <token>
```

**Response**:
```json
{
  "totalClients": 10,
  "totalProjects": 15,
  "activeProjects": 8,
  "totalScaffolds": 50,
  "scaffoldsInUse": 30,
  "totalComponents": 200,
  "totalWorkReports": 45,
  "unbilledWorkReportsCount": 12,
  "unbilledWorkReportsValue": 15000.50,
  "totalProformas": 20,
  "totalProformasValue": 85000.00
}
```

---

## 🔍 Health & Info Endpoints

### Health Check 🌍

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T07:37:24.275Z",
  "database": "connected",
  "uptime": 80.5723098
}
```

### API Info 🌍

```http
GET /api
```

**Response**: Full list of all available endpoints with URLs.

---

## 📌 User Roles

- **ADMIN**: Full access to all endpoints
- **OPERATOR**: Can manage scaffolds, components, work reports
- **ACCOUNTING**: Can manage invoices and financial data
- **CLIENT**: Read-only access to their own data

---

## 🛠️ Error Handling

All errors return standard HTTP status codes with JSON responses:

```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## 🧪 Testing with cURL

### Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "role": "OPERATOR"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@local.dev",
    "password": "admin123"
  }'
```

### Get Dashboard (with auth)

```bash
curl http://localhost:3001/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Quick Start

1. **Start the server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Login with default admin**:
   ```
   Email: admin@local.dev
   Password: admin123
   ```

3. **Get your JWT token** from the login response

4. **Use the token** in the `Authorization: Bearer <token>` header for all protected endpoints

---

## 📞 Support

For issues or questions, check:
- Health endpoint: `/health`
- API info: `/api`
- Documentation: This file

---

**Last Updated**: January 22, 2026
**API Version**: 1.0.0
