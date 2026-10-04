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
- `setup.sql` – počáteční databázové nastavení
- `security-hardening.sql` – dodatečné omezení pokusů a zpřísnění oprávnění

## Spuštění

1. V Supabase spusť `setup.sql` a nahraď `TVUJ_EMAIL`.
2. V Supabase Authentication vytvoř admin uživatele se stejným e-mailem.
3. V GitHub repozitáři zapni Settings → Pages → Deploy from a branch → `main` / `(root)`.

Produkční web:
`https://stuzkovaci-vecirek-8a.eu/`

Admin:
`https://stuzkovaci-vecirek-8a.eu/admin.html`

> Důležité: čtyřmístný kód je pozvánkový identifikátor, ne heslo pro citlivá data. Do poznámek se nemají psát citlivé osobní údaje.
