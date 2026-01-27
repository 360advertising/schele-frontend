# Deployment Backend în Coolify - backend-schele.360digital.ro

## Fișiere create pentru deployment

- ✅ `Dockerfile` - Configurație Docker pentru build și run
- ✅ `.dockerignore` - Fișiere excluse din build
- ✅ `src/main.ts` - Actualizat pentru PORT din env și CORS

## Setări necesare în Coolify

### 1. Creează aplicație nouă

1. În Coolify, mergi la **Projects** → Selectează proiectul tău
2. Click **"New Application"** sau **"Add Application"**
3. Selectează **"GitHub"** sau **"Git Repository"**
4. Introdu URL-ul repository-ului: `https://github.com/360advertising/schele-backend`

### 2. Build Configuration

În setările aplicației, secțiunea **"Build"**:

- **Build Pack**: `Dockerfile`
- **Base Directory**: `/` (root-ul repository-ului)
- **Dockerfile Location**: `Dockerfile` (sau `/Dockerfile`)
- **Docker Build Stage Target**: (lasă gol)

### 3. Network Configuration

În secțiunea **"Network"**:

- **Ports Exposes**: `3001`
- **Ports Mappings**: `3001:3001`

### 4. Environment Variables

În secțiunea **"Environment Variables"**, adaugă:

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/schele_db

# JWT
JWT_SECRET=your-strong-secret-key-minimum-32-characters-long-change-this

# Frontend URL for CORS
FRONTEND_URL=https://schele.360digital.ro
```

**IMPORTANT:** 
- Înlocuiește `DATABASE_URL` cu connection string-ul real către PostgreSQL
- `JWT_SECRET` trebuie să fie un string sigur (minimum 32 de caractere)

### 5. Domain Configuration

În secțiunea **"Domains"** sau **"FQDNs"**:

- **Domain**: `backend-schele.360digital.ro`
- **Generate SSL**: Activ (Let's Encrypt)
- **Force HTTPS**: Activ

### 6. Health Check (Opțional)

În secțiunea **"Health Check"**:

- **Health Check Path**: `/` (sau `/health` dacă ai endpoint)
- **Health Check Port**: `3001`
- **Health Check Protocol**: HTTP

### 7. Database Setup

**IMPORTANT:** Backend-ul necesită PostgreSQL.

Asigură-te că:
- PostgreSQL este deployat în Coolify (sau accesibil)
- `DATABASE_URL` pointează către baza de date corectă
- Baza de date `schele_db` există
- Migrațiile Prisma vor rula automat la start (datorită `prisma migrate deploy` din Dockerfile)

## Setări în Cloudflare

### 1. Adaugă DNS Record

1. Mergi la **Cloudflare Dashboard** → Selectează domeniul `360digital.ro`
2. Mergi la **DNS** → **Records**
3. Click **"Add record"**
4. Configurează:
   - **Type**: `A` (sau `CNAME` dacă preferi)
   - **Name**: `backend-schele`
   - **IPv4 address** (pentru A): IP-ul serverului Coolify
   - **Proxy status**: 🟡 **DNS only** (OFF - dezactivează proxy-ul pentru backend!)
   - **TTL**: Auto

**IMPORTANT:** Dezactivează Cloudflare Proxy (orange cloud) pentru backend! Backend-ul trebuie să aibă acces direct la IP pentru SSL și funcționalități corecte.

### 2. Verificare DNS

După adăugarea record-ului, verifică:
```bash
nslookup backend-schele.360digital.ro
# sau
dig backend-schele.360digital.ro
```

Ar trebui să returneze IP-ul serverului Coolify.

## Deploy Process

### 1. Prima dată

1. **Configurează toate setările** din Coolify (build, network, env vars, domain)
2. **Adaugă DNS record** în Cloudflare
3. **Salvează** configurația în Coolify
4. **Deploy** aplicația (click "Deploy" sau "Redeploy")

### 2. Verificări după deploy

1. **Build logs**: Verifică că build-ul a reușit
2. **Container logs**: Verifică că:
   - Prisma migrations au rulat cu succes
   - Backend-ul pornește pe portul 3001
   - Nu există erori de conectare la baza de date
3. **Test endpoint**: Încearcă să accesezi `https://backend-schele.360digital.ro/` sau `/health`
4. **SSL**: Verifică că certificatul SSL este generat corect

## Troubleshooting

### Problema: Build eșuează

**Soluții:**
- Verifică că `Dockerfile` este la root-ul repository-ului
- Verifică că `package.json` există și este valid
- Verifică log-urile de build pentru erori specifice

### Problema: Container pornește dar nu răspunde

**Soluții:**
- Verifică că portul este `3001` în toate setările
- Verifică container logs pentru erori
- Verifică că `DATABASE_URL` este corect și baza de date este accesibilă

### Problema: Prisma migrations eșuează

**Soluții:**
- Verifică că `DATABASE_URL` este corect
- Verifică că baza de date este accesibilă din container
- Verifică că schema Prisma este corectă
- Verifică log-urile pentru erori specifice de migration

### Problema: CORS errors

**Soluții:**
- Verifică că `FRONTEND_URL` este setat corect în env vars
- Verifică că `https://schele.360digital.ro` este în lista `allowedOrigins`
- Verifică că `backend-schele.360digital.ro` este în `allowedOrigins` (dacă e necesar)

### Problema: SSL nu se generează

**Soluții:**
- Verifică că DNS record-ul este propagat corect
- Verifică că Cloudflare Proxy este OFF (DNS only)
- Verifică că porturile 80 și 443 sunt deschise
- Verifică log-urile Let's Encrypt în Coolify

## URL-uri importante

- **Backend API**: `https://backend-schele.360digital.ro`
- **Frontend**: `https://schele.360digital.ro`
- **Health Check**: `https://backend-schele.360digital.ro/` (sau `/health`)

## Variabile de mediu pentru frontend

După ce backend-ul este deployat, actualizează în Coolify (pentru frontend):

```env
NEXT_PUBLIC_API_URL=https://backend-schele.360digital.ro
```

Și fă redeploy frontend-ului pentru ca să folosească noul URL.

## Securitate

- ✅ JWT tokens pentru autentificare
- ✅ CORS configurat pentru domenii specifice
- ✅ Parole hash-uite cu bcrypt
- ✅ Validare input cu DTOs
- ✅ Soft delete pentru toate entitățile
- ✅ HTTPS obligatoriu în producție

## Suport

Dacă întâmpini probleme:
1. Verifică log-urile din Coolify (build, container, Traefik)
2. Verifică că toate variabilele de mediu sunt setate corect
3. Verifică conectivitatea la baza de date
4. Verifică DNS și SSL configuration
