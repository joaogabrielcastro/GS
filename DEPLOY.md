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

### 2. Fotos de checklist “sumiram” no dia seguinte

O checklist **fica no banco** (placa, observações, lista de fotos), mas a imagem só existe se o arquivo ainda estiver em `UPLOAD_PATH/checklist/`.

**Causas mais comuns:**

1. **Volume montado, mas `UPLOAD_PATH` diferente** — ex.: volume em `/data/uploads` e API gravando em `./uploads` (padrão).
2. Redeploy sem volume (menos provável se você já configurou storage no Coolify).
3. `UPLOAD_CLEANUP_ENABLED=true` apagando arquivos (desligue em produção).

**Correção:**

1. `UPLOAD_PATH` = mesmo caminho do **Destination Path** do volume (ex.: `/data/uploads`)
2. `UPLOAD_CLEANUP_ENABLED=false`
3. Verificar/copiar fotos de `./uploads/checklist` para o volume (ver seção 3)
4. Backup da pasta `uploads` se existir

Teste no servidor:

```bash
ls -la "$UPLOAD_PATH/checklist" | head
```

### 3. Volume persistente no Coolify (caminho tem que bater)

No print do Coolify, o volume está em **Destination Path** `/data/uploads`.  
A API só usa esse volume se a variável de ambiente for **exatamente o mesmo caminho**:

```env
UPLOAD_PATH=/data/uploads
UPLOAD_CLEANUP_ENABLED=false
ALLOW_PUBLIC_REGISTER=false
```

| Configuração | Valor (exemplo seu) |
|--------------|---------------------|
| Coolify → Persistent Storage → **Destination Path** | `/data/uploads` |
| Coolify → Environment → **UPLOAD_PATH** | `/data/uploads` |

Se o volume aponta para `/data/uploads` mas `UPLOAD_PATH` não está definido (ou é `./uploads`), as fotos vão para **outra pasta** dentro do container e **somem no redeploy** — o volume fica vazio e parece que “não funciona”.

**Depois de corrigir:** Terminal do backend no Coolify:

```bash
echo "UPLOAD_PATH=$UPLOAD_PATH"
ls -la /data/uploads/checklist | head
ls -la ./uploads/checklist 2>/dev/null | head
```

- Se só `./uploads/checklist` tiver arquivos → fotos de ontem estão na pasta errada; copie para o volume:

```bash
mkdir -p /data/uploads/checklist
cp -a ./uploads/checklist/. /data/uploads/checklist/ 2>/dev/null || true
```

Estrutura esperada no volume:

```
/data/uploads/
  checklist/
  occurrences/
  tires/
```

### 4. Variáveis frontend (build)

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_SOCKET_URL=https://api.seudominio.com
VITE_ALLOW_PUBLIC_REGISTER=false
```

### 5. Healthcheck

Após deploy: `GET https://api.seudominio.com/api/health` → `{ "status": "OK" }`

### 6. Backup diário

Use `scripts/backup.sh` no cron do VPS (ajuste `DATABASE_URL` e paths).

## Restaurar fotos

1. Restaurar pasta `uploads` do backup para `UPLOAD_PATH`
2. Restaurar dump PostgreSQL
3. Reiniciar backend

## Erro 429 no login

Significa **muitas tentativas com senha errada** no mesmo IP em 15 minutos.

- Após deploy com `skipSuccessfulRequests`, **logins corretos não contam** no limite.
- Opcional: `LOGIN_RATE_LIMIT_MAX=40` (padrão 40 falhas / 15 min).
- Se ainda bloquear: aguarde 15 min ou reinicie o container backend (zera contador em memória).
- Confirme `TRUST_PROXY=1` no Coolify para o IP não ser o do proxy para todos os usuários.

## Socket.IO

O cliente envia JWT em `auth.token`. Não é mais possível entrar na sala de outro usuário informando `userId` manualmente.
