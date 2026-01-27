# Status Report - Aplicație Locală

## ✅ Servicii Pornite

### 1. PostgreSQL Database
- **Status**: ✅ RUNNING
- **Container**: `schele_postgres`
- **Port**: `5433` (local) → `5432` (container)
- **Database**: `schele_db`
- **User**: `postgres` / `postgres`

### 2. Backend (NestJS)
- **Status**: ✅ RUNNING
- **Port**: `3001`
- **URL**: http://localhost:3001
- **Note**: Eroare minoră la Prisma generate (EPERM), dar backend-ul pornește

### 3. Frontend (Next.js)
- **Status**: ✅ RUNNING
- **Port**: `3000`
- **URL**: http://localhost:3000

## ⚠️ Probleme Identificate

### 1. Prisma Generate Error
```
Error: EPERM: operation not permitted, rename '...query_engine-windows.dll.node'
```

**Cauză**: Fișierul Prisma este blocat (probabil de un proces care rulează)

**Soluție**:
1. Oprește toate procesele Node.js
2. Rulează din nou: `cd backend && npx prisma generate`
3. Sau restart backend-ul

### 2. Fișiere .env lipsă
- `backend/.env` - trebuie creat manual
- `frontend/.env.local` - trebuie creat manual

**Conținut necesar**:

**backend/.env**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/schele_db"
JWT_SECRET="local-development-secret-key-minimum-32-characters-long"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV=development
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔗 Link-uri Locale

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5433

## 📝 Pași pentru Prima Utilizare

### 1. Creează fișierele .env
Creează manual fișierele `.env` cu conținutul de mai sus.

### 2. Setup Database (prima dată)
```bash
cd backend
npx prisma migrate dev
```

Aceasta va crea schema în baza de date.

### 3. Creează utilizator admin
Folosește Postman sau curl:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "name": "Admin",
    "role": "ADMIN"
  }'
```

### 4. Autentifică-te
- Accesează http://localhost:3000/login
- Folosește credențialele create

## 🛠️ Comenzi Utile

### Verifică servicii
```powershell
# Verifică PostgreSQL
docker ps | Select-String "schele_postgres"

# Verifică porturi
Test-NetConnection localhost -Port 3000
Test-NetConnection localhost -Port 3001
Test-NetConnection localhost -Port 5433
```

### Restart servicii
```powershell
# Restart PostgreSQL
docker restart schele_postgres

# Restart Backend (oprește procesul Node.js și repornește)
cd backend
npm run start:dev

# Restart Frontend (oprește procesul Node.js și repornește)
cd frontend
npm run dev
```

### Verifică log-uri
```powershell
# PostgreSQL logs
docker logs schele_postgres

# Backend logs (în terminalul unde rulează)
# Frontend logs (în terminalul unde rulează)
```

## ✅ Verificare Finală

După ce ai creat fișierele `.env` și ai rulat migrațiile:

1. ✅ PostgreSQL rulează
2. ✅ Backend rulează pe port 3001
3. ✅ Frontend rulează pe port 3000
4. ✅ Poți accesa http://localhost:3000 în browser
5. ✅ Poți crea un utilizator și să te autentifici

## 🐛 Troubleshooting

### Backend nu pornește
- Verifică că PostgreSQL rulează
- Verifică că `DATABASE_URL` este corect în `.env`
- Verifică că portul 3001 nu este ocupat

### Frontend nu pornește
- Verifică că portul 3000 nu este ocupat
- Verifică că `NEXT_PUBLIC_API_URL` este corect în `.env.local`
- Șterge `.next` folder și repornește: `rm -rf .next && npm run dev`

### Eroare Prisma
- Oprește toate procesele Node.js
- Rulează: `npx prisma generate`
- Repornește backend-ul

### CORS errors
- Verifică că `FRONTEND_URL` este setat corect în backend `.env`
- Verifică că `NEXT_PUBLIC_API_URL` este setat corect în frontend `.env.local`
