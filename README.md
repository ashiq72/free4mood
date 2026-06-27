# Free4Mood

Free4Mood is the social frontend for Base360. It uses Next.js, React,
TypeScript, Tailwind CSS, and the Base360 Express/MongoDB API.

## Features

- Feed posts, likes, comments, editing, reporting, and blocking
- Stories, follows, friends, and friend requests
- Notifications and messages with server-sent event updates
- User profiles, profile media, search, and account settings
- Tenant-aware authentication for local hosts and subdomains

## Local development

1. Start `base360` on port `4000`.
2. Copy `.env.example` to `.env`.
3. Install dependencies and start Next.js:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

When Cloudinary is not configured, Base360 stores development uploads in its
ignored `uploads/` directory and serves them from `http://localhost:4000`.
Production requires valid Cloudinary credentials.

## Verification

```powershell
npm run lint
npm run build
npm audit --omit=dev
```

Password recovery is intentionally unavailable until OTP or signed reset-token
verification is implemented.
