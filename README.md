<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6a45416d-90ed-418e-902c-321eea46f594

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your environment variables:
   `cp .env.example .env.local`
3. Add your `GEMINI_API_KEY` and, if needed, `COMFLY_API_KEY` in `.env.local`
4. Run the app:
   `npm run dev`

> The app uses a secure Next.js API route at `/api/gemini` so the `GEMINI_API_KEY` stays on the server and is never exposed to the browser.
