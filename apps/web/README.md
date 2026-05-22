# NewMarket.co.in

The official digital platform for **New Market, Bhopal** — local news, job listings, shop directory, and property listings, all in one place. Bilingual (English / हिंदी).

---

## Features

- **Local News** — Community-submitted articles with admin moderation, comments, and reactions
- **Job Listings** — Local job postings with salary ranges, categories, and application contact
- **Shop Directory** — Verified shops with photos, hours, tags, and location
- **Property Listings** — Commercial spaces for rent, sale, or lease with images and amenities
- **Bilingual** — Full English / Hindi toggle across all pages
- **Auth** — Email/password sign-up, login, forgot password, reset password
- **Comments & Reactions** — Thumbs up/down on articles and comments; community discussion on news
- **Anonymous Submissions** — News can be submitted anonymously with identity protected
- **Admin Newsroom** — Approve/reject/delete content across all four modules; moderate comments
- **SEO** — Open Graph metadata, structured canonical URLs, sitemap-ready

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase SSR (`@supabase/ssr`) |
| Hosting | Vercel |
| Domain | newmarket.co.in |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yashitamoulin01-star/newmarket-web.git
cd newmarket-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key from your [Supabase dashboard](https://supabase.com/dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the database migrations

In your Supabase SQL editor, run these files in order:

```
supabase/schema.sql
supabase/jobs-schema.sql
supabase/shops-schema.sql
supabase/property-schema.sql
supabase/add-anonymous-column.sql
supabase/comments-schema.sql
```

Optionally seed sample data:

```
supabase/seed.sql
supabase/seed-additional.sql
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                  # Next.js App Router pages
  admin/              # Admin moderation dashboard (news, jobs, shops, property, comments)
  news/               # News listing + article detail + submit form
  jobs/               # Job listings + post a job
  shops/              # Shop directory + add a shop
  property/           # Property listings + list a property
  login/ signup/      # Auth pages
  forgot-password/    # Password reset flow
  reset-password/

components/
  home/               # Hero, news ticker, module cards, CTA
  layout/             # Header, footer, user nav, language toggle
  news/               # NewsCard, FeaturedNewsCard, ArticleComments, ArticleReactions
  jobs/ shops/        # JobCard, ShopCard
  property/           # PropertyCard

lib/
  supabase/           # All Supabase query functions + type definitions
  actions/            # Server actions (auth)
  data/               # Cached data fetchers (unstable_cache)
  i18n.ts             # Bilingual translation strings

contexts/
  language-context.tsx  # EN/HI language toggle (localStorage-backed)

supabase/             # SQL schema + seed files
```

## Deployment

Deployed on **Vercel** with the following environment variables set in the project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://newmarket.co.in
```

Custom domain: **newmarket.co.in** — DNS configured via domain registrar pointing to Vercel.

---

## Copyright & License

© 2026 NewMarket.co.in — All Rights Reserved.

This project, source code, design, branding, concept, UI/UX, database structure, and business logic are proprietary intellectual property.

No part of this project may be copied, reproduced, modified, distributed, sublicensed, reverse engineered, or reused in any form without explicit written permission from the owner.
