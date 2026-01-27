# Fix pentru SSL/HTTPS pe schele.360digital.ro

## Verificări în Coolify pentru SSL

### 1. Verifică configurația domeniului (FQDNs)

În aplicația ta din Coolify:

1. **Mergi la secțiunea "Domains" sau "FQDNs"**
2. **Verifică că `schele.360digital.ro` este adăugat**
3. **Verifică setările SSL/TLS pentru domeniu:**
   - **SSL Provider**: Ar trebui să fie `Let's Encrypt` (automat) sau `Custom`
   - **Generate SSL Certificate**: Trebuie să fie activat/enabled
   - **Force HTTPS**: Ar trebui să fie activat (redirect HTTP → HTTPS)
   - **Status**: Verifică că certificatul este "Valid" sau "Active"

### 2. Dacă certificatul lipsește sau este invalid

**Opțiunea A: Regenerare automată (recomandat)**

1. În secțiunea "Domains" pentru `schele.360digital.ro`
2. Click pe butonul "Regenerate SSL" sau "Generate Certificate"
3. Selectează `Let's Encrypt` ca provider
4. Așteaptă câteva minute pentru generare
5. Verifică că status-ul devine "Valid"

**Opțiunea B: Verifică configurația Let's Encrypt**

1. În Coolify, mergi la **"Settings" → "SSL"** sau **"Certificate Resolver"**
2. Verifică că:
   - Let's Encrypt este configurat corect
   - Email-ul pentru Let's Encrypt este setat (necesar pentru notificări)
   - API endpoint este `https://acme-v02.api.letsencrypt.org/directory` (production)

### 3. Verifică Traefik Labels (dacă sunt configurate manual)

În setările aplicației, verifică dacă există **Traefik Labels** și că conțin:

```yaml
traefik.http.routers.schele-frontend.rule: Host(`schele.360digital.ro`)
traefik.http.routers.schele-frontend.entrypoints: websecure
traefik.http.routers.schele-frontend.tls.certresolver: letsencrypt
traefik.http.routers.schele-frontend.tls: "true"
traefik.http.services.schele-frontend.loadbalancer.server.port: 3000
```

**Important**: Label-ul `tls.certresolver: letsencrypt` este necesar pentru SSL automat.

### 4. Forțează HTTPS redirect (HTTP → HTTPS)

În setările domeniului sau în Traefik Labels, adaugă (dacă nu există deja):

```yaml
traefik.http.routers.schele-frontend-redirect.rule: Host(`schele.360digital.ro`)
traefik.http.routers.schele-frontend-redirect.entrypoints: web
traefik.http.routers.schele-frontend-redirect.middlewares: redirect-to-https
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme: https
traefik.http.middlewares.redirect-to-https.redirectscheme.permanent: "true"
```

SAU folosește opțiunea din Coolify: **"Force HTTPS"** sau **"Redirect HTTP to HTTPS"** (dacă este disponibilă).

### 5. Verifică DNS și firewall

Pentru ca Let's Encrypt să funcționeze:

1. **DNS**: Record-ul pentru `schele.360digital.ro` trebuie să pointeze către IP-ul serverului Coolify
2. **Porturi deschise**: Porturile 80 (HTTP) și 443 (HTTPS) trebuie să fie deschise în firewall
3. **Accessibilitate**: Domeniul trebuie să fie accesibil public (pentru validarea Let's Encrypt)

### 6. Redeploy după modificări SSL

După ce modifici setările SSL:

1. **Salvează** toate modificările
2. **Redeploy** aplicația (sau restart)
3. **Așteaptă** 2-5 minute pentru ca certificatul să fie generat/aplicat
4. **Verifică** domeniul în browser

## Troubleshooting SSL

### Problema: "Certificate not trusted" sau "Invalid certificate"

**Soluții:**
- Verifică că certificatul Let's Encrypt este generat corect
- Verifică că domeniul DNS pointează corect
- Verifică că nu există un certificat self-signed sau expirat

### Problema: Mixed content warnings (HTTP resources pe HTTPS)

**Soluții:**
- Verifică că toate resursele externe (API calls, imagini, fonts) folosesc HTTPS
- În Next.js, asigură-te că nu există link-uri hardcodate cu `http://`

### Problema: Certificatul nu se generează

**Cauze posibile:**
1. DNS nu este propagat corect
2. Porturile 80/443 nu sunt deschise
3. Limită rate-limit de la Let's Encrypt (max 5 certificate per domeniu pe săptămână)
4. Email invalid pentru Let's Encrypt

**Soluții:**
- Așteaptă propagarea DNS (poate dura până la 24h, de obicei < 1h)
- Verifică firewall-ul
- Așteaptă dacă ai depășit rate limit-ul
- Verifică configurația email în Coolify

### Problema: Certificatul expiră frecvent

**Soluție:**
- Coolify ar trebui să reînnoiască automat certificatul (Let's Encrypt certifica-tele expiră la 90 de zile)
- Verifică că cron job-ul pentru reînnoire este activ

## Verificare finală

După configurare, verifică:

1. **În browser:**
   - Accesează `https://schele.360digital.ro/dashboard`
   - Click pe iconița de lock în browser (lângă URL)
   - Verifică că certificatul este "Valid" și emis de "Let's Encrypt"

2. **Test cu SSL Labs (opțional):**
   - Accesează: https://www.ssllabs.com/ssltest/
   - Introdu `schele.360digital.ro`
   - Verifică rating-ul SSL

3. **Test redirect HTTP → HTTPS:**
   - Accesează `http://schele.360digital.ro` (fără 's')
   - Ar trebui să fii redirecționat automat la `https://schele.360digital.ro`

## Contact

Dacă problema persistă, verifică:
- Log-urile Traefik pentru erori SSL
- Log-urile Let's Encrypt în Coolify
- Configurația firewall/ports pe server
