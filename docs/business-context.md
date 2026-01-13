# Context business – Aplicație Management Schele

## 1. Scop aplicație
Aplicația este un ERP verticalizat pentru managementul schelelor închiriate.
Procesul verbal este baza de facturare, nu contractul.

---

## 2. Observații-cheie

### Proces verbal
- Fiecare schelă are număr unic
- Conține:
  - client (beneficiar)
  - proiect + locație
  - tip lucrare: instalare / dezinstalare / modificare
  - listă de componente:
    - cantitate
    - lungime / greutate
    - unitate de măsură
- Procesul verbal este baza de facturare

### Inventar
- Există inventar de schele și componente
- Componentele sunt reutilizabile
- Se urmărește:
  - unde sunt
  - în ce proiect
  - stare
  - disponibilitate

---

## 3. Entități principale

Client, Contract, Proiect, Schelă, Componentă schelă, Proces verbal, Linii proces verbal,
Tarifare proiect, Proformă, Utilizatori.

---

## 4. Reguli critice
- Prețurile sunt definite pe proiect + componentă
- Procesele verbale facturate NU pot fi modificate
- O proformă poate include mai multe procese verbale ale aceluiași client
