# Ron's Retirement Planning Dashboard

A private, client-side React + TypeScript dashboard for modeling a CalPERS retirement strategy.

## Features
- Fully client-side with no backend
- True monthly compounding math
- Annual projection visualizations
- Stress test parameters in real-time
- Beautiful, responsive UI using Tailwind CSS and Recharts

## Tech Stack
- React
- TypeScript
- Vite
- Recharts
- Tailwind CSS (v4)
- Lucide React (Icons)

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production (static site deployment):
   ```bash
   npm run build
   ```

## Configuration
The initial values and calculation logic are defined in `src/config.ts` and `src/projection.ts`.

## Deployment
This project can be deployed as a static site to services like GitHub Pages, Vercel, Netlify, or AWS S3. Run `npm run build` and deploy the `dist` folder.
