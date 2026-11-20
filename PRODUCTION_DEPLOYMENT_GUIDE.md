# CleanTN 360 – Production Deployment, Backup & Compliance Guide (Phase 6)

## 1. Environment Separation Strategy
| Environment | Branch | URL Pattern | Payout Mode | Database |
|:---|:---|:---|:---|:---|
| **Development** | `dev` / feature | `http://localhost:5173` | Simulated Pilot | Local / Dev Supabase |
| **Staging** | `staging` | `https://staging.cleantn360.tn.gov.in` | Razorpay Sandbox | Staging PostgreSQL |
| **Production** | `main` | `https://cleantn360.tn.gov.in` | Controlled Pilot / Approved | Production Supabase (PITR Enabled) |

## 2. Automated CI/CD Pipeline
- Configured in `.github/workflows/ci-cd.yml`.
- Runs automatically on push to `main` and `staging`:
  1. Scans `src/` to verify zero hardcoded `service_role` keys or JWT secrets.
  2. Executes `npm ci` and `npm run build` via Vite 6.
  3. Verifies `/api/health.json` manifest presence.
  4. Validates Python ML forecasting pipeline (`backend_ml/train_model.py`).

## 3. SSL/HTTPS & Custom Domain Configuration
- Enforce TLS 1.3 with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
- Terminate SSL via Cloudflare / Vercel / NIC Reverse Proxy with automated Let's Encrypt certificate renewal.
- Configure CORS allowlists on FastAPI (`backend_ml/forecasting_service.py`) strictly to approved domain origins in production.

## 4. Database Backup & Disaster Recovery
- **Automated Daily Backups**: Run `./scripts/backup_database.sh` via cron (`0 2 * * *`) to create gzipped `pg_dump` archives with SHA-256 checksum verification.
- **Point-in-Time Recovery (PITR)**: Enable Supabase PITR (7-day minimum window) for financial wallet ledger safety.
- **Recovery Execution**: Validate checksum and run `./scripts/restore_database.sh backups/cleantn360_backup_<timestamp>.sql.gz`.

## 5. Health Check & Uptime Monitoring
- Frontend Health Manifest: `GET /api/health.json`
- Python ML Service Health: `GET /` (FastAPI returns operational JSON + timestamp)
- Recommended Uptime Probes: 60-second interval HTTP 200 checks with Slack/Email escalation on 2 consecutive failures.
