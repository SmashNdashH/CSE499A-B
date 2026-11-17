# AeroRescue-site

Website for our NSU CSE499B project: post-disaster building-damage assessment from before/after imagery. It has a public showcase (Home, Data, Method, Results, Gallery, About) and a Demo page where a before and after image pair can be uploaded.

Decision-support only. Outputs need expert human validation.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The Demo page shows a clearly labelled sample output until a backend exists. To connect one, copy `.env.example` to `.env.local` and set `VITE_API_URL` to the API's address. The request and response format is written in `src/services/api.js`.

## Where the numbers come from

All content and numbers live in `src/data/`, never in the pages. Each number must come from the project's results files (`Task_Ledger.md` and the linked result folders). To update a result, edit `src/data/results.js` only.
