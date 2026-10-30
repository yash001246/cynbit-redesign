# BitElevate Pathfinder

A MERN prototype that turns the placeholder **"Generate My Custom Path"** button on
`cynbit.in/bitelevate/paths` into a working feature: six questions in, a ranked lab match
and a dated 60-day plan out (including the programme's 14-day exam freeze). Plans are saved
behind a short shareable link, and students can send theirs to the BitElevate team.

Full write-up: [REPORT.md](./REPORT.md).

## Stack
MongoDB (Mongoose) · Express 4 · React 18 (Vite) · Node 22. One deployable service: Express serves the built client.

## Run locally
```bash
cp .env.example .env            # MONGODB_URI is optional locally (falls back to memory)
npm install                     # root dev tooling
npm run install:all             # server + client deps
npm run dev                     # API :5000, web :5173 (proxied)
npm test                        # 16 server tests (engine + API)
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness and active store |
| GET | `/api/options` | Quiz options (single source of truth for the client) |
| POST | `/api/paths` | Validate answers, generate and save a plan, returns `{ id, result }` |
| GET | `/api/paths/:id` | Load a saved plan (powers share links `#/p/<id>`) |
| POST | `/api/paths/:id/lead` | Attach name, email and college to a plan |

## Deploy (Render + MongoDB Atlas)
1. Create a free Atlas cluster, a database user, and allow network access (0.0.0.0/0 for the demo). Copy the connection string.
2. Push this repo to GitHub. In Render choose **New > Blueprint** and select the repo (`render.yaml` is picked up).
3. Set `MONGODB_URI` when prompted. Deploy. The service URL is your live demo; `/api/health` should report `"store":"mongo"`.

## Notes
Lab names, projects, the five roadmap phases and the 60-day / 14-day-freeze rules mirror what is
published on cynbit.in/bitelevate. Match weights are this prototype's own judgement and are
meant to be tuned by the BitElevate team.
