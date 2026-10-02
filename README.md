# Stužkovací večírek 8.A

Samostatný web pozvánky na stužkovací večírek 8.A Gymnázia Kroměříž.

- Datum: 13. 11. 2026
- Čas: od 18:00
- Místo: Sladovna Kroměříž
- Téma: Back to the 90s
- Backend: Supabase
- Hosting: GitHub Pages

## Stránky

- `index.html` – pozvánka pro učitele
- `admin.html` – administrace RSVP
- `404.html` – převádí odkazy typu `/5831` na pozvánku s kódem
- `setup.sql` – jednorázové vytvoření databáze v Supabase

## Spuštění

1. V Supabase spusť `setup.sql` a nahraď `TVUJ_EMAIL`.
2. V Supabase Authentication vytvoř admin uživatele se stejným e-mailem.
3. V GitHub repozitáři zapni Settings → Pages → Deploy from a branch → `main` / `(root)`.

Potom bude web na:
`https://tt2802.github.io/stuzkovaci-vecirek-8a/`

Admin:
`https://tt2802.github.io/stuzkovaci-vecirek-8a/admin.html`

Testovací kód: `5831`
