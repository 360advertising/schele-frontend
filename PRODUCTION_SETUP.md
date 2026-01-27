# Configurare Modul Producție - Schema Management ERP

## Modificări efectuate

Modul demo a fost dezactivat și aplicația este acum configurată pentru producție cu:
- ✅ Autentificare reală cu backend-ul
- ✅ Salvare date în baza de date
- ✅ API calls reale la backend
- ✅ Protecție rutelor cu middleware
- ✅ CORS configurat pentru producție

## Variabile de mediu necesare

### Frontend (Next.js)

Creează un fișier `.env.local` în directorul `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Pentru producție (Coolify):**

În setările aplicației din Coolify, adaugă variabila de mediu:

```env
NEXT_PUBLIC_API_URL=https://api.schele.360digital.ro
```

**Notă:** Înlocuiește URL-ul cu URL-ul real al backend-ului tău.

### Backend (NestJS)

Creează un fișier `.env` în directorul `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/schele_db"
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
FRONTEND_URL="https://schele.360digital.ro"
PORT=3001
```

**Pentru producție:**

În setările aplicației backend din Coolify:

```env
DATABASE_URL="postgresql://user:password@postgres:5432/schele_db"
JWT_SECRET="your-strong-secret-key-minimum-32-characters-long"
FRONTEND_URL="https://schele.360digital.ro"
NODE_ENV=production
PORT=3001
```

**Important:**
- `JWT_SECRET` trebuie să fie un string lung și sigur (minimum 32 de caractere)
- `DATABASE_URL` trebuie să pointeze către baza de date PostgreSQL configurată
- `FRONTEND_URL` trebuie să fie URL-ul frontend-ului pentru CORS

## Structura aplicației

### Frontend → Backend

Frontend-ul face request-uri la backend prin:
- `NEXT_PUBLIC_API_URL/auth/login` - Autentificare
- `NEXT_PUBLIC_API_URL/auth/register` - Înregistrare
- `NEXT_PUBLIC_API_URL/auth/profile` - Profil utilizator
- `NEXT_PUBLIC_API_URL/clients` - Management clienți
- `NEXT_PUBLIC_API_URL/projects` - Management proiecte
- `NEXT_PUBLIC_API_URL/scaffolds` - Management schele
- `NEXT_PUBLIC_API_URL/proformas` - Proforme
- `NEXT_PUBLIC_API_URL/work-reports` - Procese verbale
- `NEXT_PUBLIC_API_URL/dashboard/summary` - Dashboard

### Autentificare

1. Utilizatorul completează formularul de login
2. Frontend face POST la `/auth/login` cu email și parolă
3. Backend verifică credențialele și returnează JWT token
4. Frontend salvează token-ul în `localStorage` și cookie
5. Toate request-urile ulterioare includ token-ul în header: `Authorization: Bearer <token>`
6. Middleware-ul Next.js verifică token-ul în cookie pentru protecția rutelor

## Deployment în Coolify

### Frontend

1. **Variabile de mediu:**
   - `NEXT_PUBLIC_API_URL` - URL-ul backend-ului

2. **Build Settings:**
   - Build Pack: `Dockerfile`
   - Build Context: `frontend/`
   - Dockerfile Path: `frontend/Dockerfile`
   - Port: `3000`

### Backend

1. **Variabile de mediu:**
   - `DATABASE_URL` - Connection string PostgreSQL
   - `JWT_SECRET` - Secret key pentru JWT
   - `FRONTEND_URL` - URL frontend pentru CORS
   - `NODE_ENV=production`
   - `PORT=3001`

2. **Database:**
   - Asigură-te că PostgreSQL este configurat și accesibil
   - Rulează migrațiile: `npx prisma migrate deploy`

3. **Build Settings:**
   - Port: `3001`
   - Health Check: `/` sau un endpoint specific

## Pași pentru activare completă

### 1. Configurează baza de date

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Creează utilizator admin (dacă este necesar)

Poți crea un utilizator prin:
- Endpoint `/auth/register` (dacă nu există restricții)
- Sau prin seed script: `npx prisma db seed`

### 3. Testează local

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run start:dev
```

### 4. Verifică conectivitatea

1. Accesează `http://localhost:3000/login`
2. Încearcă să te autentifici
3. Verifică în Network tab că request-urile merg la backend
4. Verifică că datele se salvează în baza de date

## Securitate

- ✅ JWT tokens pentru autentificare
- ✅ Parole hash-uite cu bcrypt
- ✅ CORS configurat pentru domenii specifice
- ✅ Middleware de protecție rutelor
- ✅ Soft delete pentru entități
- ✅ Validare input cu DTOs

## Troubleshooting

### Frontend nu se conectează la backend

**Verifică:**
- `NEXT_PUBLIC_API_URL` este setat corect
- Backend-ul rulează și este accesibil
- CORS este configurat corect în backend

### Eroare "Unauthorized" sau 401

**Verifică:**
- Token-ul este salvat corect în localStorage
- Token-ul nu este expirat
- Backend-ul verifică corect token-ul
- `JWT_SECRET` este același în backend și dacă folosești multiple instanțe

### Datele nu se salvează

**Verifică:**
- Backend-ul primește request-urile
- Conectivitatea la baza de date (DATABASE_URL)
- Log-urile backend-ului pentru erori

### CORS errors

**Verifică:**
- `FRONTEND_URL` este setat corect în backend
- URL-ul frontend-ului este în lista `allowedOrigins` din `main.ts`

## Urmează

După configurare, aplicația este gata pentru producție și:
- Toate datele se salvează în baza de date
- Utilizatorii trebuie să se autentifice
- Rutele sunt protejate
- API-ul comunică corect între frontend și backend
