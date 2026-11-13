# Horizon Cart Marketplace

A full-stack e-commerce product filtering application featuring category selection, dual-range price filtering, minimum star ratings, instant product updates, and sorting, powered by React, TypeScript, Node.js, and Express.

## Features

- Left-side sticky filter sidebar
- Multi-category checklist filters
- Dual-handle price range slider
- Minimum star rating selector
- Live product search
- Server-side filtering, sorting, and validation
- Responsive product grid
- Empty-state handling with reset flow
- Shopping bag with quantity controls, item removal, and subtotal
- Local image fallback when a product image cannot load

## Tech stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Express + TypeScript
- Data: Static product seed inventory in TypeScript dataset

## Getting started

1. Install dependencies:
   npm install
2. Start the development environment:
   npm run dev
3. Open the app:
   http://localhost:5173/

The frontend uses a Vite proxy to communicate with the backend API at http://localhost:5000.

## API endpoints

- GET /api/health
- GET /api/products

Query parameters:

- categories
- minPrice
- maxPrice
- minRating
- sortBy
- search

## Notes

All filtering, rating comparison, range validation, and sorting are handled on the backend in the reusable `filterProducts` function.
