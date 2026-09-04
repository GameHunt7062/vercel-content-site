# Vercel + Supabase + Tiptap Content Site

A Next.js content site with:
- Public articles
- Public artwork gallery
- Supabase Auth
- Admin allowlist via `admins` table
- Rich Tiptap article editor
- Admin-only create/edit permissions
- Edit buttons visible on public pages only to the admin
- Supabase Storage for artwork
- Optional Supabase Realtime enabled in SQL

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Put your Supabase project URL and publishable key in `.env.local`.

## 2. Supabase

Run `supabase/schema.sql` in Supabase SQL Editor.

Create an Auth user in Supabase Authentication.

Then add that user's UUID to `public.admins`:

```sql
insert into public.admins (user_id)
values ('YOUR_AUTH_USER_UUID');
```

## 3. Run

```bash
npm run dev
```

## 4. GitHub

Create a private GitHub repository and push this project.

Do NOT commit `.env.local`.

## 5. Vercel

Import the private GitHub repository into Vercel.

Add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Deploy.

## Important

The UI hides edit controls from visitors, but the real security comes from Supabase RLS policies. Only users listed in `public.admins` can insert/update/delete content.

This starter intentionally keeps the editor and admin workflow straightforward. For production, add image upload inside Tiptap, delete/replace cleanup in Storage, slug editing, autosave, richer toolbar controls, validation, rate limiting, and better error UI.
