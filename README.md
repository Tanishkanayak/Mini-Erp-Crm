# Fundsroom ERP

A lightweight ERP/CRM system for wholesale distribution built with Node.js, TypeScript, Express, SQLite, React, and Vite.

## Features
- JWT-based auth with role-based access
- Customer CRM with search, edit, and follow-up notes
- Product and inventory management with stock movement logging
- Sales challans with draft/confirmed workflow and stock reduction logic

## Default Login
- Email: admin@fundsroom.com
- Password: admin123

## Local Setup
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Build the app:
   ```powershell
   npm run build
   ```
3. Start both backend and frontend:
   ```powershell
   npm run dev
   ```
4. Open the frontend at the port shown by Vite, for example:
   ```text
   http://localhost:5175/
   ```
5. Backend API is available at:
   ```text
   http://localhost:5000/
   ```

## Environment Variables
The backend uses:
- PORT
- JWT_SECRET

Copy [backend/.env.example](backend/.env.example) to [backend/.env](backend/.env) and update values as needed.

## Notes
- The app uses SQLite for local development and persistence.
- The database file is created automatically in the backend/data folder.
- If Vite tries another port, use the URL shown in the terminal after `npm run dev`.
