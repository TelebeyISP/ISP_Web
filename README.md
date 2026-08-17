# Telebey ISP Web

Telebey is the customer-facing MVNO web app: plans, eSIM activation, account, cart, and identity login.

This frontend talks to **[ApiGate](https://github.com/TelebeyISP/ApiGate)** for authentication, data plans, and SIM lifecycle. The Sylius shop API remains available for cart/catalog when that service is running.

## App preview

Screenshots and a walkthrough video are added after a local run (see `docs/`).

![Telebey home](docs/screenshots/home.png)

![Plans catalog](docs/screenshots/plans.png)

<video src="docs/demo.mp4" controls width="100%" title="Telebey app walkthrough"></video>

If the video does not embed in GitHub, download it from [docs/demo.mp4](docs/demo.mp4).

## Connect to ApiGate

ApiGate is the NestJS gateway at [TelebeyISP/ApiGate](https://github.com/TelebeyISP/ApiGate.git). This app calls it through a Vite proxy so the browser never has to fight CORS in local development.

| Frontend route | ApiGate endpoint |
| --- | --- |
| Email login / register | `POST /auth/login`, `POST /auth/register` |
| Session | `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Plans catalog | `GET /plans` |
| SIM usage | `GET /sim` |
| eSIM activation | `POST /sim/activate` |
| Health check | `GET /health` |

1. Clone and start ApiGate (Postgres + Redis + NestJS on port **4000**):

```bash
git clone https://github.com/TelebeyISP/ApiGate.git
cd ApiGate
cp telebey-platform/.env.example telebey-platform/.env
# start postgres/redis + API, or run the API in watch mode:
# docker compose -f telebey-platform/docker-compose.auth.yml up -d
cd telebey-platform/apps/api
npm install
npm run start:dev
```

2. Copy env for this web app:

```bash
cp .env.example .env.local
```

`VITE_APIGATE_URL=/apigate` sends browser requests to Vite, which proxies `/apigate/*` to `http://127.0.0.1:4000`. Override the target with `APIGATE_PROXY_TARGET` if ApiGate is not on localhost:4000.

Demo accounts (from ApiGate seed data):

- User: `user@test.com` / `Test1234!`
- Admin: `admin@telebey.com` / `Admin1234!`

## Run the web app

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Plans fall back to a local catalog if ApiGate is offline; login, SIM usage, and eSIM activation require ApiGate.

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
