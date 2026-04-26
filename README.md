
**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your environment variables:
   `cp .env.example .env.local`
3. Add your `GEMINI_API_KEY` and, if needed, `COMFLY_API_KEY` in `.env.local`
4. Run the app:
   `npm run dev`

> The app uses a secure Next.js API route at `/api/gemini` so the `GEMINI_API_KEY` stays on the server and is never exposed to the browser.
