# MCPaaS
Dynamic MCP instantiation as edge functions

## Features
- Next.js 15 App Router with React Server Components
- TypeScript-first development
- Tailwind CSS with dark/light mode support
- FastAPI backend integration
- Automatic API route handling
- Modern UI components with Shadcn-like styling
- Vercel deployment-ready configuration

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS + Geist font
- **Backend**: FastAPI (Python)
- **Build**: Turbopack

## Getting Started
1. Clone the repository
2. Install dependencies:
   ```bash
   cd app && npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables
Create `.env.local` in the app directory with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the API
1. Set up Python environment (3.10+ recommended)
2. Install FastAPI requirements:
   ```bash
   pip install fastapi uvicorn[standard]
   ```
3. Start API server:
   ```bash
   uvicorn main:app --reload
   ```

## Deployment
Vercel deployment is pre-configured. Connect your repository and deploy:
1. Set up environment variables in Vercel dashboard
2. Enable Turbopack for optimized builds
3. Deploy from main branch

## Project Structure
```bash
app/
├── app/            # Next.js 15 app router
│   ├── api/       # API routes
│   ├── layouts/   # Shared layouts
│   └── styles/    # Global CSS
└── public/        # Static assets
```

> Note: Update API endpoints in `app/page.tsx` to match your backend configuration
