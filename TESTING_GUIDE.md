# 🧪 Ghid de Testare - Funcționalități Implementate

**Data**: 22 Ianuarie 2026

---

## ✅ **VERIFICĂRI TEHNICE COMPLETE**

### **Backend**
- ✅ **Compilare**: Backend compilează fără erori
- ✅ **Module**: Toate modulele sunt importate în `app.module.ts`
- ✅ **Endpoint-uri**: Toate endpoint-urile sunt definite corect
- ✅ **TypeScript**: Fără erori de tipuri

### **Frontend**
- ✅ **Import-uri**: `API_BASE_URL` este exportat și importat corect
- ✅ **Linter**: Fără erori de linting
- ✅ **TypeScript**: Fără erori de tipuri

---

## 📋 **CHECKLIST DE TESTARE MANUALĂ**

### **1. Componente Schele** (`/components`)

#### **Teste de Bază**
- [ ] **Accesare pagină**: Navighează la `/components` - ar trebui să vezi lista de componente (sau mesaj "Nu există componente")
- [ ] **Buton "Adaugă componentă"**: Click pe buton - ar trebui să se deschidă dialog-ul
- [ ] **Formular validare**: 
  - Încearcă să salvezi fără nume → ar trebui să apară eroare
  - Încearcă să setezi stoc disponibil > stoc total → ar trebui să apară eroare
- [ ] **Adăugare componentă**: Completează formularul și salvează → ar trebui să apară în listă
- [ ] **Editare componentă**: Click pe "Editează" → ar trebui să se deschidă dialog-ul cu datele completate
- [ ] **Ștergere componentă**: Click pe "Șterge" → ar trebui să dispară din listă

#### **Teste Funcționale**
- [ ] **Progress bar stoc**: Verifică dacă progress bar-ul se actualizează corect când modifici stocul
- [ ] **Status badge**: Verifică dacă badge-urile de status au culorile corecte
- [ ] **Filtrare proiect**: Verifică dacă poți selecta un proiect pentru componentă

---

### **2. Tarifare Proiect** (`/pricings`)

#### **Teste de Bază**
- [ ] **Accesare pagină**: Navighează la `/pricings` - ar trebui să vezi lista de prețuri
- [ ] **Filtrare după proiect**: Selectează un proiect din filtru → ar trebui să vezi doar prețurile pentru acel proiect
- [ ] **Buton "Adaugă preț"**: Click pe buton → ar trebui să se deschidă dialog-ul
- [ ] **Formular validare**:
  - Încearcă să salvezi fără proiect/componentă/preț → ar trebui să apară eroare
  - Încearcă să setezi preț negativ → ar trebui să apară eroare
- [ ] **Adăugare preț**: Completează formularul și salvează → ar trebui să apară în listă
- [ ] **Editare preț**: Click pe "Editează" → ar trebui să se deschidă dialog-ul cu datele completate
- [ ] **Ștergere preț**: Click pe "Șterge" → ar trebui să dispară din listă

#### **Teste Funcționale**
- [ ] **Perioadă valabilitate**: Verifică dacă poți seta "Valabil până" sau lăsa gol pentru nelimitat
- [ ] **Prevenire duplicate**: Încearcă să adaugi același preț pentru aceeași combinație proiect+componentă în aceeași perioadă → ar trebui să apară eroare

---

### **3. Procese Verbale - Linii** (`/work-reports`)

#### **Teste de Bază**
- [ ] **Accesare pagină**: Navighează la `/work-reports` - ar trebui să vezi lista de procese verbale
- [ ] **Buton "Proces verbal nou"**: Click pe buton → ar trebui să se deschidă dialog-ul
- [ ] **Creare proces verbal**: Completează formularul și salvează → ar trebui să apară în listă cu status "Draft"
- [ ] **Buton "👁️" (Eye)**: Click pe buton → ar trebui să se deschidă dialog-ul cu detalii
- [ ] **Buton "+" (Plus)**: Click pe buton pentru un proces verbal DRAFT → ar trebui să se deschidă dialog-ul pentru adăugare linie

#### **Teste Linii Proces Verbal**
- [ ] **Adăugare linie**: 
  - Selectează componentă
  - Introdu cantitate și unitate măsură
  - Salvează → ar trebui să apară în dialog-ul de detalii
- [ ] **Validare linie**:
  - Încearcă să salvezi fără componentă/cantitate → ar trebui să apară eroare
  - Verifică dacă prețul se calculează automat (dacă există preț definit în tarifare)
- [ ] **Ștergere linie**: Click pe "🗑️" (Trash) pentru o linie → ar trebui să dispară
- [ ] **Restricții**: 
  - Încearcă să adaugi linie la un proces verbal facturat → ar trebui să apară eroare
  - Încearcă să ștergi linie dintr-un proces verbal facturat → ar trebui să apară eroare

#### **Teste Marcare ca Facturat**
- [ ] **Buton "Marchează ca facturat"**: 
  - Click pe buton pentru un proces verbal cu linii → ar trebui să se marcheze ca "Facturat"
  - După marcare, butoanele "Editează" și "+" ar trebui să dispară
- [ ] **Validare**: Încearcă să marchezi ca facturat un proces verbal fără linii → ar trebui să apară eroare

#### **Teste Descărcare PDF**
- [ ] **Buton "📥" (Download)**: Click pe buton → ar trebui să se descarce PDF-ul
- [ ] **Verificare PDF**: Deschide PDF-ul descărcat → ar trebui să conțină:
  - Număr proces verbal
  - Date client și proiect
  - Lista de linii cu componente
  - Total valoare (dacă există prețuri)
  - Semnături

---

### **4. Proforme** (`/proformas`)

#### **Teste de Bază**
- [ ] **Accesare pagină**: Navighează la `/proformas` - ar trebui să vezi lista de proforme
- [ ] **Buton "Generează proformă"**: Click pe buton → ar trebui să se deschidă dialog-ul
- [ ] **Creare proformă**:
  - Selectează client
  - Selectează procese verbale (multiple, același client)
  - Introdu număr proformă
  - Salvează → ar trebui să apară în listă

#### **Teste Descărcare PDF**
- [ ] **Buton "📥" (Download)**: Click pe buton → ar trebui să se descarce PDF-ul
- [ ] **Verificare PDF**: Deschide PDF-ul descărcat → ar trebui să conțină:
  - Număr proformă
  - Date client
  - Lista proceselor verbale incluse
  - Total valoare agregat

---

## 🔍 **TESTE DE INTEGRARE**

### **Flux Complet: Proces Verbal → Proformă**

1. **Pregătire**:
   - [ ] Creează un client
   - [ ] Creează un proiect pentru client
   - [ ] Adaugă componente
   - [ ] Setează prețuri pentru componente în proiect

2. **Creare Proces Verbal**:
   - [ ] Creează un proces verbal pentru proiect
   - [ ] Adaugă linii în proces verbal (cu componente care au prețuri)
   - [ ] Verifică dacă totalul se calculează corect în PDF

3. **Marcare ca Facturat**:
   - [ ] Marchează procesul verbal ca facturat
   - [ ] Verifică dacă nu mai poate fi editat

4. **Generare Proformă**:
   - [ ] Creează o proformă cu procesul verbal facturat
   - [ ] Verifică dacă totalul în PDF este corect
   - [ ] Verifică dacă procesele verbale sunt listate corect

---

## 🐛 **TESTE DE ERORI**

### **Validări Backend**
- [ ] **Preț duplicat**: Încearcă să adaugi același preț pentru aceeași combinație proiect+componentă în aceeași perioadă → ar trebui să apară eroare
- [ ] **Linie fără preț**: Încearcă să adaugi linie cu o componentă care nu are preț definit în proiect → ar trebui să apară eroare
- [ ] **Marcare fără linii**: Încearcă să marchezi ca facturat un proces verbal fără linii → ar trebui să apară eroare
- [ ] **Editare proces facturat**: Încearcă să editezi un proces verbal facturat → ar trebui să apară eroare

### **Validări Frontend**
- [ ] **Formulare incomplete**: Verifică dacă toate câmpurile obligatorii sunt validate
- [ ] **Erori de rețea**: Simulează o eroare de rețea → verifică dacă mesajele de eroare sunt afișate corect

---

## 📊 **TESTE DE PERFORMANȚĂ**

- [ ] **Încărcare pagină componente**: Verifică timpul de încărcare pentru 100+ componente
- [ ] **Încărcare pagină procese verbale**: Verifică timpul de încărcare pentru 100+ procese verbale
- [ ] **Generare PDF**: Verifică timpul de generare pentru un proces verbal cu 50+ linii

---

## ✅ **REZULTAT AȘTEPTAT**

După testare, toate funcționalitățile ar trebui să funcționeze corect:
- ✅ Adăugare/editare/ștergere componente
- ✅ Setare prețuri per proiect
- ✅ Adăugare linii în procese verbale
- ✅ Calcul automat prețuri
- ✅ Marcare procese verbale ca facturate
- ✅ Generare PDF pentru procese verbale
- ✅ Generare PDF pentru proforme
- ✅ Validări corecte pentru toate operațiunile

---

## 🚨 **PROBLEME CUNOSCUTE**

Niciuna la momentul actual.

---

**Notă**: Dacă întâmpini probleme, verifică:
1. Backend-ul rulează pe `http://localhost:3001`
2. Frontend-ul rulează pe `http://localhost:3000`
3. Variabila de mediu `NEXT_PUBLIC_API_URL` este setată corect în `.env.local`
4. Token-ul de autentificare este valid
