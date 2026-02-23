# Chit Collection Management System

A web application for managing loan/chit collections with member records and payment tracking.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Database Setup
1. Install PostgreSQL
2. Create database:
```bash
psql -U postgres
CREATE DATABASE chit_collection;
\q
```
3. Run schema:
```bash
psql -U postgres -d chit_collection -f server/database.sql
```

### Backend Setup
```bash
cd server
npm install
mkdir uploads
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## Usage
1. Backend runs on http://localhost:5000
2. Frontend runs on http://localhost:3000
3. Add members with photo, details, and chit amount
4. Track collections with dates and amounts
5. View collection history per member

## Features
- Member management with photo upload
- Collection tracking
- Payment history
- Date-based records
- Responsive UI matching the paper form layout
