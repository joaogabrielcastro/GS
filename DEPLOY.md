# Deploy GS — produção

## Checklist obrigatório

### 1. Banco de dados (obrigatório após cada deploy com mudança em `schema.prisma`)

```bash
cd backend
npm ci
npx prisma migrate deploy
```

**Sintoma:** painel admin com erro 500 em `/api/dashboard/admin-stats` ou `/api/checklists`.

**Causa usual:** API atualizada, mas migração não rodou no Postgres (colunas `odometer`, `reviewNotes`, `reviewedById`, `reviewedAt` faltando).

**Correção rápida no servidor:**

```bash
cd backend && npx prisma migrate deploy
```

Ou aplique manualmente `scripts/production-schema-patch.sql` no banco e reinicie o backend.

Não use apenas `prisma db push` em produção após a primeira migração versionada.

Se o banco já tinha `odometer` via `db push` e `migrate deploy` reclamar da migração `20260528120000_add_checklist_odometer`, marque como aplicada e siga:

```bash
npx prisma migrate resolve --applied 20260528120000_add_checklist_odometer
npx prisma migrate deploy
```

### 2. Uploads persistentes

Configure no backend:

```env
UPLOAD_PATH=/data/gs/uploads
UPLOAD_CLEANUP_ENABLED=false
ALLOW_PUBLIC_REGISTER=false
```

No Docker/Coolify, monte um **volume** em `/data/gs/uploads` (ou o path escolhido).

Estrutura esperada:

```
uploads/
  checklist/
  occurrences/
  tires/
```

### 3. Variáveis frontend (build)

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_SOCKET_URL=https://api.seudominio.com
VITE_ALLOW_PUBLIC_REGISTER=false
```

### 4. Healthcheck

Após deploy: `GET https://api.seudominio.com/api/health` → `{ "status": "OK" }`

### 5. Backup diário

Use `scripts/backup.sh` no cron do VPS (ajuste `DATABASE_URL` e paths).

## Restaurar fotos

1. Restaurar pasta `uploads` do backup para `UPLOAD_PATH`
2. Restaurar dump PostgreSQL
3. Reiniciar backend

## Socket.IO

O cliente envia JWT em `auth.token`. Não é mais possível entrar na sala de outro usuário informando `userId` manualmente.
