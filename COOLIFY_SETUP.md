# Ghid de configurare Coolify pentru Frontend Next.js

## Problema: 404 Page Not Found

Dacă primești eroarea 404 în Coolify, urmează acest ghid pas cu pas.

## ✅ Verificări în Git

Toate fișierele necesare sunt comise:
- ✅ `frontend/package.json`
- ✅ `frontend/next.config.ts` (cu `output: 'standalone'`)
- ✅ `frontend/Dockerfile` (nou creat)
- ✅ Toate fișierele din `frontend/src/`

**Important**: Asigură-te că ai făcut commit și push pentru:
```bash
git add frontend/Dockerfile frontend/.dockerignore
git commit -m "Add Dockerfile for Coolify deployment"
git push
```

## ⚙️ Setări în Coolify

### 1. **Build Settings (Build Configuration)**

În panoul de configurare a aplicației din Coolify:

- **Build Pack**: `Dockerfile` sau `Docker`
- **Dockerfile Path**: `frontend/Dockerfile`
- **Build Context**: `frontend/` sau `./frontend/`
  - ⚠️ **IMPORTANT**: Contextul trebuie să fie directorul `frontend/`
  - Dacă repository-ul este monorepo, setează build context la `frontend/`

### 2. **Port Configuration**

- **Port**: `3000`
- **Exposed Port**: `3000`

Next.js rulează implicit pe portul 3000 (configurat în `package.json` start script).

### 3. **Environment Variables**

Nu sunt necesare variabile de mediu pentru moment, dar poți adăuga dacă ai nevoie:
- `NODE_ENV=production` (setat automat în Dockerfile)
- `PORT=3000` (setat automat în Dockerfile)

### 4. **Health Check** (Optional, dar recomandat)

- **Health Check Path**: `/` sau `/dashboard`
- **Health Check Port**: `3000`

### 5. **Reverse Proxy Settings**

În setările de reverse proxy (Traefik/Nginx) din Coolify:

- Asigură-te că proxy-ul trimite request-urile către container pe portul `3000`
- Nu adăuga prefix sau base path dacă nu e necesar

## 🔍 Verificări după deployment

### 1. Verifică build logs

În Coolify, vezi log-urile de build și verifică:
- ✅ Build-ul se face cu succes
- ✅ Nu există erori de dependențe
- ✅ Dockerfile-ul este găsit și folosit corect

### 2. Verifică container logs

După deploy, verifică log-urile containerului:
- Ar trebui să vezi: `Ready on http://0.0.0.0:3000`
- Nu ar trebui să vezi erori de port sau binding

### 3. Testează endpoint-urile

Încearcă să accesezi:
- `https://your-domain.com/` → ar trebui să redirecționeze la `/dashboard`
- `https://your-domain.com/dashboard` → ar trebui să afișeze dashboard-ul
- `https://your-domain.com/login` → ar trebui să afișeze pagina de login

## 🐛 Troubleshooting

### Problema: Build eșuează

**Soluție**: 
- Verifică că build context este setat la `frontend/`
- Verifică că Dockerfile este la path-ul corect: `frontend/Dockerfile`

### Problema: Container pornește dar 404

**Cauze posibile**:
1. Portul nu este expus corect → Verifică setările de port
2. Reverse proxy nu trimite către container → Verifică configurația Traefik
3. Next.js nu pornește corect → Verifică log-urile containerului

**Soluții**:
- Verifică că portul este `3000` în toate setările
- Verifică log-urile containerului pentru erori
- Încearcă să accesezi direct container-ul (dacă e posibil în Coolify)

### Problema: Static files nu se încarcă (404 pentru assets)

**Soluție**:
- Verifică că `.next/static` este copiat corect în Dockerfile
- Verifică că middleware-ul permite request-uri pentru `/_next/static`

## 📝 Structura necesară în Git

Asigură-te că în repository ai:

```
schele-management/
├── frontend/
│   ├── Dockerfile          ← NOU (important!)
│   ├── .dockerignore       ← NOU (important!)
│   ├── package.json
│   ├── next.config.ts
│   ├── src/
│   │   └── app/
│   └── ... (alte fișiere)
```

## 🚀 Pași finali

1. **Commit Dockerfile**:
   ```bash
   git add frontend/Dockerfile frontend/.dockerignore
   git commit -m "Add Dockerfile for Coolify deployment"
   git push
   ```

2. **În Coolify**:
   - Actualizează repository-ul sau forțează rebuild
   - Verifică că build context este `frontend/`
   - Verifică că Dockerfile path este `frontend/Dockerfile`
   - Verifică că portul este `3000`

3. **Redeploy**:
   - Fă un nou deploy
   - Monitorizează log-urile
   - Testează aplicația

## 📞 Contact

Dacă problema persistă, verifică:
- Log-urile de build din Coolify
- Log-urile containerului după deploy
- Configurația reverse proxy din Coolify
