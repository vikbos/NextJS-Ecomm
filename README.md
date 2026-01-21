This is a small E-commerce project built with  [Next.js](https://nextjs.org) / [Auth.js](https://authjs.dev/) / [Prisma](https://www.prisma.io/) / [PostgreSQL](https://www.postgresql.org/) / [Shadcn](https://ui.shadcn.com/) / [Stripe](https://stripe.com/)

Project is live on Vercel [here](https://next-js-ecomm-omega.vercel.app/)

## Environment Variables

To run this project, you will need to add the following variables to your .env (Local) or .env.local (Production/Vercel) files:

- <kbd>DATABASE_URL</kbd>: Your pooled database connection string.
- <kbd>DIRECT_DATABASE_URL</kbd>: Your direct TCP connection string (required for migrations/push).
- <kbd>AUTH_SECRET</kbd>: Used by Auth.js for session encryption.
- <kbd>STRIPE_SECRET_KEY</kbd>: Your Stripe API key.

## Local Development

Start development server:

```bash
npm run dev
```

Sync local DB and generate Prisma client

```bash
npx prisma db push
npx prisma generate
```

## Production & Deployment

After testing changes locally, push the schema to the live database and update your local types:

```bash
npx dotenv-cli -e .env.local -- npx prisma db push
# Update local generated client to match production schema
npx prisma generate
```

Once the database is synced, commit and push your code. Vercel will automatically trigger a build, run the postinstall script to regenerate the client on their servers, and deploy the latest version of the main branch.
