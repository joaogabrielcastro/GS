# 🚀 Início Rápido

## Para usuários Windows

### Instalação Automática

1. **Execute o instalador:**
   ```
   Clique duas vezes em: install.bat
   ```

2. **Configure o banco de dados:**
   - Abra o PostgreSQL (pgAdmin ou terminal)
   - Execute:
     ```sql
     CREATE DATABASE transportadora;
     ```

3. **Configure o .env:**
   - Abra `backend\.env`
   - Ajuste a DATABASE_URL se necessário

4. **Execute as migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Inicie os servidores:**
   ```
   Clique duas vezes em: start.bat
   ```

### Acesso Rápido

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health

---

## Criando Primeiro Usuário

### Via Prisma Studio (Mais Fácil)

1. No diretório `backend`, execute:
   ```bash
   npx prisma studio
   ```

2. Acesse http://localhost:5555

3. Clique em "User" → "Add record"

4. Preencha:
   - **email:** admin@test.com
   - **password:** `$2a$10$YourHashedPasswordHere` (use uma ferramenta online para gerar hash bcrypt)
   - **name:** Administrador
   - **role:** ADMINISTRADOR
   - **active:** true

### Via API (Recomendado)

Use o Postman, Insomnia ou cURL:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"name\":\"Administrador\",\"role\":\"ADMINISTRADOR\"}"
```

---

## Login no Sistema

1. Acesse: http://localhost:5173

2. Use as credenciais:
   - **Email:** admin@test.com
   - **Senha:** admin123

3. Explore os dashboards!

---

## Estrutura Básica

```
GS/
├── backend/          → API Node.js
├── frontend/         → React App
├── install.bat       → Instalador automático
├── start.bat         → Iniciador dos servidores
├── README.md         → Documentação principal
├── INSTALACAO.md     → Guia completo de instalação
├── API_EXAMPLES.md   → Exemplos de uso da API
└── RESUMO_EXECUTIVO.md → Visão geral do projeto
```

---

## Principais Funcionalidades

### 👤 Motorista
- Checklist diário com fotos
- Registro de ocorrências
- Notificações

### ⚙️ Administrador
- Dashboard completo
- Gestão de caminhões
- Controle de pneus
- Análise de ocorrências

### 💰 Financeiro
- Relatórios de custos
- Análise de pneus
- Exportação de dados

---

## Comandos Úteis

### Backend
```bash
cd backend

# Desenvolvimento
npm run dev

# Build
npm run build

# Migrations
npx prisma migrate dev

# Prisma Studio
npx prisma studio
```

### Frontend
```bash
cd frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## Solução Rápida de Problemas

### Backend não inicia?
1. Verifique se PostgreSQL está rodando
2. Confirme DATABASE_URL no .env
3. Execute `npm install` novamente

### Frontend não carrega?
1. Verifique se backend está rodando
2. Limpe cache: `npm cache clean --force`
3. Reinstale: `rm -rf node_modules && npm install`

### Erro nas migrations?
```bash
cd backend
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

---

## Próximos Passos

1. ✅ Instalar e configurar
2. ✅ Criar usuários de teste
3. ✅ Cadastrar caminhões
4. ✅ Cadastrar pneus
5. ✅ Testar checklist
6. ✅ Testar ocorrências
7. ✅ Explorar relatórios

---

## Suporte

- 📖 Documentação completa: `INSTALACAO.md`
- 🔌 Exemplos de API: `API_EXAMPLES.md`
- 📊 Visão do projeto: `RESUMO_EXECUTIVO.md`
- ✅ Status do desenvolvimento: `CHECKLIST.md`

---

**Desenvolvido para transformar a gestão de transportadoras!** 🚚✨
