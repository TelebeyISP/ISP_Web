# Telebey ISP Web

Telebey is the customer-facing MVNO web app: plans, eSIM activation, account, cart, and identity login.

This frontend talks to **[ApiGate](https://github.com/TelebeyISP/ApiGate)** for authentication, data plans, and SIM lifecycle. The Sylius shop API remains available for cart/catalog when that service is running.

## App preview

Captured from a local run with Vite on port 5173 and ApiGate on port 4000. The plans page shows **Live catalog from ApiGate**.

### Home

![Telebey home](docs/screenshots/home.png)

### Plans (ApiGate catalog)

![Plans catalog](docs/screenshots/plans.png)

### Sign in

![Auth / MytID](docs/screenshots/auth.png)

### eSIM activation

![Activate eSIM](docs/screenshots/activate.png)

### Cart

![Empty cart](docs/screenshots/cart.png)

### Walkthrough video

<video src="docs/demo.mp4" controls width="100%" title="Telebey app walkthrough"></video>

If the video does not embed, open [docs/demo.mp4](docs/demo.mp4).

## Connect to ApiGate

ApiGate is the NestJS gateway at [TelebeyISP/ApiGate](https://github.com/TelebeyISP/ApiGate.git). In development the browser calls `/apigate/*`, and Vite proxies those requests to `http://127.0.0.1:4000`.

| Frontend | ApiGate |
| --- | --- |
| Email login / register | `POST /auth/login`, `POST /auth/register` |
| Session | `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Plans catalog | `GET /plans` |
| SIM usage | `GET /sim` |
| eSIM activation | `POST /sim/activate` |
| Health | `GET /health` |

1. Clone and start ApiGate (Postgres + Redis + NestJS on port **4000**):

```bash
git clone https://github.com/TelebeyISP/ApiGate.git
cd ApiGate
cp telebey-platform/.env.example telebey-platform/.env
# docker compose -f telebey-platform/docker-compose.auth.yml up -d
cd telebey-platform/apps/api
npm install
npm run start:dev
```

2. Copy env for this web app:

```bash
cp .env.example .env.local
```

`VITE_APIGATE_URL=/apigate` uses the Vite proxy. Override the backend with `APIGATE_PROXY_TARGET` if ApiGate is not on localhost:4000.

Demo accounts (ApiGate seed data):

- User: `user@test.com` / `Test1234!`
- Admin: `admin@telebey.com` / `Admin1234!`

## Run the web app

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Plans fall back to a local catalog if ApiGate is offline. Login, SIM usage, and eSIM activation require ApiGate.

```bash
npm run build
npm run preview
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Axios client in `src/lib/apigate.ts`
- ApiGate (NestJS) for auth / SIMs / plans
- Optional Sylius shop API for cart (`VITE_SYLIUS_API_URL`)
