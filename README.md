# NO.23

Perfume discovery, collection & identity platform.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

Feature-based layout:

- `app/` — routing shell
- `features/` — domain modules (`landing` today; others added later)
- `shared/` — cross-feature UI, layout, hooks, lib
- `styles/` — global tokens and site CSS
- `legacy/` — original static landing (reference for pixel parity)

## Deploy

Vercel. Framework preset: Next.js. Domain: `no23.com.ar`.
