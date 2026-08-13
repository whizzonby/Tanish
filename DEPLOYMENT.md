# Deploying to the shared EC2 box (Apache + Certbot + PM2)

This app is a standard Next.js Node server (`next build` / `next start`) —
no special adapter needed. It runs as its own PM2 process on a private port,
and Apache reverse-proxies `caringtouchreno.com` to it. Every step below only
touches files specific to this site, so the other sites on the box are not
affected.

## 0. Requirements

- Node.js 20 LTS or newer (`node -v`)
- PM2 installed globally (`npm install -g pm2` if not already present)
- PostgreSQL already running on the box (per your setup)
- Apache with `mod_proxy`, `mod_proxy_http`, `mod_headers` enabled
- Certbot with the Apache plugin (`sudo apt install certbot python3-certbot-apache` if missing)

## 1. Pull the code

```bash
git clone https://github.com/whizzonby/Tanish.git caringtouchreno
cd caringtouchreno
npm ci
```

## 2. Create the production database

As the `postgres` user (or whoever has createdb rights):

```sql
CREATE DATABASE caringtouchreno;
CREATE USER caringtouchreno WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE caringtouchreno TO caringtouchreno;
```

## 3. Configure environment variables

Copy the template and fill in real values:

```bash
cp .env.example .env.local
```

Required for a working site:
- `DATABASE_URL` — `postgresql://caringtouchreno:<password>@localhost:5432/caringtouchreno`
- `AUTH_SECRET` — generate with `npx auth secret`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script to create the first admin login (change the password after first login if you like — there's no in-app "change password" screen yet, so update it via the seed script + re-seed, or ask to add one)
- `NEXT_PUBLIC_SITE_URL` — `https://caringtouchreno.com`

Add when ready (checkout/email won't work without these, but the site runs fine without them — those features just stay disabled):
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_ENV`
- `WIPAY_ACCOUNT_NUMBER` / `WIPAY_API_KEY` / `WIPAY_ENVIRONMENT=live` (sandbox works with no credentials — leave `WIPAY_ENVIRONMENT` unset to keep testing in sandbox before going live)
- `MAILTRAP_API_TOKEN` / `MAILTRAP_SENDER_EMAIL` (requires a Verified sending domain in Mailtrap first)

**`.env.local` is gitignored on purpose — never commit it.**

## 4. Run migrations and seed

```bash
npx prisma migrate deploy
npx prisma db seed
```

`migrate deploy` (not `migrate dev`) applies the existing migrations as-is —
it won't try to generate new ones or prompt for anything.

## 5. Build

```bash
npm run build
```

## 6. Start with PM2

The included `ecosystem.config.js` runs the app on port **3011** — confirm
that's free first:

```bash
sudo ss -tlnp | grep 3011
```

If it's taken, edit the `PORT` value in `ecosystem.config.js` and update the
Apache config in step 7 to match.

```bash
pm2 start ecosystem.config.js
pm2 save          # persist across reboots
pm2 startup       # follow the printed instructions once, if not already done for other apps
```

Useful commands: `pm2 logs caringtouchreno`, `pm2 restart caringtouchreno`,
`pm2 status`.

## 7. Apache vhost + SSL

Full instructions are in `deploy/apache-caringtouchreno.conf.example` —
summary:

```bash
sudo a2enmod proxy proxy_http headers
sudo cp deploy/apache-caringtouchreno.conf.example /etc/apache2/sites-available/caringtouchreno.conf
sudo a2ensite caringtouchreno.conf
sudo apachectl configtest
sudo systemctl reload apache2
sudo certbot --apache -d caringtouchreno.com -d www.caringtouchreno.com
```

Certbot only edits `caringtouchreno.conf` — it does not touch the other
sites' vhost files.

**After Certbot runs**, open the new `<VirtualHost *:443>` block it added in
`/etc/apache2/sites-available/caringtouchreno.conf` and change:

```
RequestHeader set X-Forwarded-Proto "http"
```

to

```
RequestHeader set X-Forwarded-Proto "https"
```

in that 443 block specifically (leave the port-80 block as `"http"` — it
still exists to redirect to https). This matters: without it, Auth.js and
Next.js can't tell the connection is actually secure, which breaks admin
login cookies in production. Then:

```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

## 8. Point DNS at the server

In your registrar/DNS for `caringtouchreno.com`, add/update:
- `A` record: `@` → the EC2 instance's public IP
- `A` (or `CNAME`) record: `www` → same IP (or `caringtouchreno.com`)

DNS propagation can take a few minutes to a few hours.

## 9. Verify

- `https://caringtouchreno.com` loads the homepage
- `https://caringtouchreno.com/admin/login` loads and you can log in with
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` from step 3
- Confirm the **other sites on the server still load correctly** — this
  setup shouldn't have touched their configs, but always worth a quick check
  after any Apache reload

## Redeploying after future code changes

```bash
cd caringtouchreno
git pull
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 restart caringtouchreno
```

`db seed` is safe to re-run — it upserts by slug/email and skips anything
that already exists, so it only inserts what's new (e.g. new blog posts or
services added in that update) without touching content you've since edited
in the admin dashboard.

## Media uploads

Admin image uploads (content photos, product photos, blog covers) currently
save to `public/uploads` on disk (see `src/lib/storage.ts`). On a single
persistent EC2 box this works fine and survives restarts/redeploys as long as
you don't delete the directory — just be aware it's local disk storage, not
S3, so back it up along with the database if that matters to you.
