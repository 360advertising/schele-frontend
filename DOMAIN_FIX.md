# Fix pentru schele.360digital.ro - 404 / nu funcționează

## Situația actuală
- ✅ Containerul rulează corect (Running healthy)
- ✅ Next.js pornește pe port 3000
- ❌ Domeniul `schele.360digital.ro` nu funcționează

## Verificări necesare în Coolify

### 1. Verifică configurația domeniului (Domains / FQDNs)

În Coolify, pentru aplicația ta, mergi la secțiunea **"Domains"** sau **"FQDNs"** și verifică:

**A. Domeniul este adăugat:**
- `schele.360digital.ro` trebuie să fie în listă

**B. Configurare DNS:**
- DNS pentru `schele.360digital.ro` trebuie să pointeze către serverul Coolify
- Verifică că record-ul A sau CNAME este configurat corect

**C. SSL/TLS Certificate:**
- Trebuie să existe un certificat SSL configurat (automat sau manual)
- Dacă nu există, Coolify ar trebui să genereze automat cu Let's Encrypt

### 2. Verifică setările de Reverse Proxy (Traefik Labels)

În setările aplicației, verifică dacă există **Traefik Labels** configurate. Ar trebui să fie ceva de genul:

```yaml
traefik.http.routers.schele-frontend.rule: Host(`schele.360digital.ro`)
traefik.http.routers.schele-frontend.entrypoints: websecure
traefik.http.routers.schele-frontend.tls.certresolver: letsencrypt
traefik.http.services.schele-frontend.loadbalancer.server.port: 3000
```

### 3. Verifică Port Mapping

În setările aplicației:
- **Exposed Port**: Trebuie să fie `3000`
- **Port Mapping**: Verifică că portul containerului (3000) este mapat corect

### 4. Verifică Health Check Configuration

În setările de health check:
- **Health Check Path**: `/` sau `/dashboard`
- **Health Check Port**: `3000`
- **Health Check Protocol**: HTTP

### 5. Verifică Log-urile Traefik

În Coolify, verifică log-urile Traefik pentru a vedea dacă:
- Request-urile ajung la Traefik
- Există erori de routing
- Există probleme cu certificatul SSL

## Pași de rezolvare pas cu pas

### Pasul 1: Verifică domeniul în Coolify

1. Mergi la aplicația ta în Coolify
2. Click pe tab-ul **"Domains"** sau **"FQDNs"**
3. Verifică că `schele.360digital.ro` este adăugat
4. Dacă nu este, adaugă-l:
   - Click "Add Domain" sau "Add FQDN"
   - Introdu `schele.360digital.ro`
   - Selectează să genereze certificat SSL automat (dacă e opțiunea disponibilă)

### Pasul 2: Verifică DNS

Pe serverul DNS (unde este configurat `360digital.ro`):

```bash
# Verifică DNS record
dig schele.360digital.ro
# sau
nslookup schele.360digital.ro
```

Record-ul trebuie să pointeze către IP-ul serverului Coolify.

### Pasul 3: Verifică Port și Service Configuration

În Coolify, pentru aplicația ta:

1. Mergi la **"Settings"** sau **"Configuration"**
2. Verifică:
   - **Port**: `3000`
   - **Service Port**: `3000`
   - Nu trebuie să existe base path sau prefix configurat

### Pasul 4: Forțează regenerarea configurației Traefik

1. În Coolify, pentru aplicația ta
2. Click **"Redeploy"** sau **"Restart"**
3. Așteaptă să se regenereze configurația Traefik

### Pasul 5: Verifică log-urile

După redeploy, verifică:
- **Container logs**: Ar trebui să vezi "Ready" pentru Next.js
- **Traefik logs**: Ar trebui să vezi request-uri când accesezi domeniul

## Ce să verifici dacă tot nu merge

### Test 1: Accesează direct containerul (dacă e posibil)

Încearcă să accesezi aplicația direct prin IP-ul serverului și portul expus (dacă Coolify permite accesul direct temporar).

### Test 2: Verifică în browser

Când accesezi `schele.360digital.ro`, verifică în **Developer Tools > Network**:
- Ce status code primești (404, 502, 503, etc.)?
- Există redirect-uri?
- Ce URL apare în browser după accesare?

### Test 3: Verifică certificatul SSL

În browser, când accesezi `https://schele.360digital.ro`:
- Apare un certificat valid?
- Există erori de certificat?

## Ce să-mi trimiți pentru debugging

1. **Screenshot din Coolify cu secțiunea "Domains/FQDNs"** - să văd configurația domeniului
2. **Screenshot din setările aplicației** (ports, environment, etc.)
3. **Screenshot cu eroarea din browser** când accesezi `schele.360digital.ro`
4. **Log-urile Traefik** (dacă sunt disponibile în Coolify)
5. **Rezultatul comenzii DNS** pentru `schele.360digital.ro`

## Soluție alternativă: Verifică middleware-ul Next.js

Dacă problema este că Next.js face redirect-uri greșite, poate fi necesar să adăugăm configurație explicită pentru base path, dar de obicei nu e necesar pentru domenii directe.
