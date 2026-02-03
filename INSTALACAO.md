# 🚀 Guia de Instalação e Execução

## Sistema de Gestão para Transportadora

Este guia irá ajudá-lo a configurar e executar o sistema completo.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** versão 14 ou superior ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn** (vem com Node.js)

Para verificar as instalações:

```bash
node --version
npm --version
psql --version
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco de dados PostgreSQL

Abra o terminal PostgreSQL:

```bash
psql -U postgres
```

Execute os comandos:

```sql
CREATE DATABASE transportadora;
CREATE USER transportadora_user WITH ENCRYPTED PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE transportadora TO transportadora_user;
\q
```

### 2. Configurar variáveis de ambiente

No diretório `backend`, copie o arquivo de exemplo:

```bash
cd backend
copy .env.example .env
```

Edite o arquivo `.env` e configure:

```env
DATABASE_URL="postgresql://transportadora_user:senha_segura@localhost:5432/transportadora?schema=public"
JWT_SECRET="mude-para-um-secret-super-seguro-em-producao"
JWT_REFRESH_SECRET="mude-para-um-refresh-secret-super-seguro"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

---

## 🔧 Instalação do Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Gerar cliente Prisma e executar migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. (Opcional) Visualizar banco de dados

```bash
npx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555` para visualizar e editar dados.

### 4. Iniciar o servidor backend

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

✅ **Teste**: Acesse `http://localhost:3000/api/health` - deve retornar `{"status":"OK"}`

---

## 🎨 Instalação do Frontend

### 1. Instalar dependências

Abra um **novo terminal** e execute:

```bash
cd frontend
npm install
```

### 2. Iniciar o servidor frontend

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

---

## 👥 Criando Usuários de Teste

Você pode criar usuários usando a API ou o Prisma Studio.

### Opção 1: Via API (usando Postman, Insomnia ou curl)

**Criar Administrador:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@transportadora.com\",
    \"password\": \"admin123\",
    \"name\": \"Administrador\",
    \"role\": \"ADMINISTRADOR\"
  }"
```

**Criar Motorista:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"motorista@transportadora.com\",
    \"password\": \"motorista123\",
    \"name\": \"João Motorista\",
    \"cpf\": \"12345678900\",
    \"role\": \"MOTORISTA\"
  }"
```

**Criar Financeiro:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"financeiro@transportadora.com\",
    \"password\": \"financeiro123\",
    \"name\": \"Maria Financeiro\",
    \"role\": \"FINANCEIRO\"
  }"
```

### Opção 2: Via Prisma Studio

1. Execute `npx prisma studio` no diretório backend
2. Clique em "User"
3. Clique em "Add record"
4. Preencha os campos (a senha deve ser um hash bcrypt)

---

## 🎯 Testando o Sistema

### 1. Acessar o sistema

Abra o navegador em `http://localhost:5173`

### 2. Fazer login

Use as credenciais criadas:

**Administrador:**
- Email: `admin@transportadora.com`
- Senha: `admin123`

**Motorista:**
- Email: `motorista@transportadora.com`
- Senha: `motorista123`

**Financeiro:**
- Email: `financeiro@transportadora.com`
- Senha: `financeiro123`

### 3. Explorar funcionalidades

- **Motorista**: Checklist diário e registro de ocorrências
- **Administrador**: Visão geral, gestão de caminhões e pneus
- **Financeiro**: Relatórios de custos e análises

---

## 📚 Estrutura de Dados

### Principais Entidades

- **Users**: Usuários do sistema (MOTORISTA, ADMINISTRADOR, FINANCEIRO)
- **Trucks**: Caminhões da frota
- **Tires**: Pneus com controle detalhado
- **TireEvents**: Histórico de eventos dos pneus
- **DailyChecklist**: Checklist diário dos motoristas
- **Occurrences**: Ocorrências reportadas
- **Notifications**: Sistema de notificações

---

## 🔥 Recursos Implementados

### Backend
✅ API REST completa com Express e TypeScript
✅ Autenticação JWT com refresh tokens
✅ Sistema de roles (MOTORISTA, ADMINISTRADOR, FINANCEIRO)
✅ Upload de imagens com Multer
✅ Socket.IO para notificações em tempo real
✅ Prisma ORM com PostgreSQL
✅ Middleware de segurança (helmet, CORS, rate limiting)

### Frontend
✅ React com TypeScript e Vite
✅ Tailwind CSS para estilização
✅ React Query para gerenciamento de estado
✅ React Router para navegação
✅ Socket.IO client para notificações em tempo real
✅ Dashboards específicos por perfil
✅ Sistema de notificações toast

### Funcionalidades Principais
✅ Controle de caminhões e atribuição de motoristas
✅ **Controle detalhado de pneus** (foco principal)
✅ Eventos de pneus (instalação, troca, estouro, recapagem)
✅ Estatísticas e alertas de pneus
✅ Checklist diário com upload de fotos
✅ Registro de ocorrências com fotos
✅ Notificações automáticas para administrador e financeiro
✅ Histórico completo de ações
✅ Análise de custos por caminhão e por pneu

---

## 🚧 Próximos Passos (Roadmap)

### Curto Prazo
- [ ] Implementar CRUD completo de caminhões no frontend
- [ ] Implementar CRUD completo de pneus no frontend
- [ ] Adicionar formulários para checklist e ocorrências
- [ ] Implementar upload de fotos no frontend
- [ ] Adicionar gráficos e relatórios visuais

### Médio Prazo
- [ ] Integração com AWS S3 para armazenamento de imagens
- [ ] Exportação de relatórios em PDF e Excel
- [ ] Sistema de busca e filtros avançados
- [ ] Dashboard com métricas em tempo real
- [ ] Geolocalização em tempo real

### Longo Prazo
- [ ] App mobile React Native
- [ ] Sistema multi-tenant (SaaS)
- [ ] Integração com APIs de pagamento
- [ ] Machine Learning para previsão de manutenção
- [ ] API pública para integrações
- [ ] Sistema de backup automático

---

## 🐛 Resolução de Problemas

### Erro de conexão com banco de dados

Verifique se:
1. PostgreSQL está rodando
2. As credenciais no `.env` estão corretas
3. O banco de dados foi criado

### Erro ao executar migrations

```bash
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

### Porta já em uso

Altere as portas no `.env` (backend) e `vite.config.ts` (frontend)

### Problemas com Socket.IO

Verifique se ambos backend e frontend estão rodando e se o CORS está configurado corretamente.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend e frontend
2. Consulte a documentação do Prisma: https://www.prisma.io/docs
3. Consulte a documentação do React: https://react.dev

---

## 📄 Licença

Sistema proprietário desenvolvido para gestão de transportadoras.
Todos os direitos reservados © 2026

---

**Desenvolvido com foco em controle de pneus e economia operacional** 🛞
