# Hotel Room Management App

React + Tailwind frontend, Express backend, and PostgreSQL schema for an Excel-style hotel room scheduler.

## Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    repositories/
    routes/
    services/
    utils/
    validators/
database/
  schema.sql
  seed.sql
frontend/
  src/
    api/
    components/
    hooks/
    lib/
    styles/
```

## Run

1. Create the database and load the SQL in `database/schema.sql`, then seed with `database/seed.sql`.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
3. Copy `frontend/.env.example` to `frontend/.env` if you want to override the default API URL.
4. Install and start backend.

```bash
cd backend
npm install
npm run dev
```

5. Install and start frontend.

```bash
cd frontend
npm install
npm run dev
```

## API

- `GET /api/rooms`
- `GET /api/bookings?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `POST /api/bookings/:id/extend`

## Notes

- Conflict detection is enforced both in service logic and the database exclusion constraint.
- OTA sync/import stubs are prepared in `backend/src/services/otaService.js`.
- Drag across empty cells to create a booking, drag a booking to another row to change room, and drag booking edges to resize stay dates.
