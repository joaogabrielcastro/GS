# 🚚 Sistema de Gestão para Transportadora

Sistema completo de gestão operacional focado em controle de motoristas, caminhões e pneus, com comunicação direta entre motorista, administrador e financeiro.

## 🎯 Funcionalidades Principais

### 👤 Perfis de Usuário

- **Motorista**: Checklist diário, registro de ocorrências, upload de fotos
- **Administrador**: Painel central, gestão de caminhões e motoristas
- **Financeiro**: Controle de custos, relatórios e análises

### 🚛 Módulos

- ✅ Controle diário do motorista (checklist com fotos)
- 🚨 Registro de ocorrências em tempo real
- 🔔 Sistema de notificações
- 🚛 Gestão completa de caminhões
- 🛞 **Controle detalhado de pneus** (foco principal)
- 📊 Painel administrativo
- 💰 Módulo financeiro com relatórios

## 🛠️ Stack Tecnológica

### Backend

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (banco de dados relacional)
- **Prisma ORM** (gerenciamento de banco de dados)
- **JWT** (autenticação)
- **Multer** (upload de arquivos)
- **Socket.io** (notificações em tempo real)

### Frontend

- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **React Query** (gerenciamento de estado)
- **React Router** (navegação)
- **Axios** (requisições HTTP)

## 📁 Estrutura do Projeto

```
GS/
├── backend/              # API REST
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── models/       # Modelos Prisma
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middlewares
│   │   ├── services/     # Lógica de negócio
│   │   ├── utils/        # Utilitários
│   │   └── index.ts      # Entry point
│   ├── prisma/           # Schema do banco
│   ├── uploads/          # Armazenamento de fotos
│   └── package.json
│
└── frontend/             # Aplicação React
    ├── src/
    │   ├── components/   # Componentes reutilizáveis
    │   ├── pages/        # Páginas
    │   ├── services/     # Serviços API
    │   ├── hooks/        # Custom hooks
    │   ├── contexts/     # Contexts (auth, etc)
    │   ├── types/        # TypeScript types
    │   └── App.tsx
    └── package.json
```

## 🚀 Início Rápido

### Instalação

```bash
# 1. Instale as dependências
cd backend && npm install
cd ../frontend && npm install

# 2. Configure as variáveis de ambiente
# Copie backend/.env.example → backend/.env e preencha DATABASE_URL, JWT_SECRET, etc.

# 3. Execute as migrations e o seed
cd backend
npx prisma migrate dev
npx prisma db seed

# 4. Inicie os servidores (em terminais separados)
cd backend && npm run dev
cd frontend && npm run dev
```

### Acesso

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: `npx prisma studio`

## ☁️ Deploy em Produção (Uploads)

Para não perder imagens a cada deploy, **não use** upload em disco efêmero do container.

1. Crie um **volume persistente** na plataforma (Coolify/Render/Railway/VPS).
2. Monte o volume no serviço backend (exemplo de mount path: `/data/transportadora/uploads`).
3. Configure a variável de ambiente:

```bash
UPLOAD_PATH=/data/transportadora/uploads
```

4. Faça deploy.
5. Valide:
   - envie uma foto no checklist;
   - confirme leitura no admin;
   - faça novo deploy e confirme que a mesma foto continua disponível.

## 📊 Modelo de Dados

### Principais Entidades

- **Users** (Usuários com perfis)
- **Trucks** (Caminhões)
- **Tires** (Pneus com histórico completo)
- **DailyChecklist** (Checklist diário)
- **Occurrences** (Ocorrências)
- **TireEvents** (Eventos de pneus)
- **Notifications** (Notificações)

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Senhas criptografadas com bcrypt
- Upload de arquivos com validação
- Rate limiting
- CORS configurado

## 📈 Recursos Avançados

- Notificações em tempo real
- Relatórios exportáveis (PDF/Excel)
- Histórico imutável de eventos
- Alertas automáticos de manutenção
- Dashboard com métricas em tempo real
- Sistema escalável e multi-tenant pronto

## 🎯 Roadmap

- [ ] Implementação de cache (Redis)
- [ ] Integração com AWS S3 para fotos
- [ ] App mobile nativo (React Native)
- [ ] Geolocalização em tempo real
- [ ] Integração com sistemas de pagamento
- [ ] API de integração para terceiros

## 📝 Licença

Proprietary - Sistema comercializável como SaaS

## 📚 Documentação Completa

- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Exemplos práticos de uso da API
- **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)** - Visão completa do projeto

## 🎯 Principais Recursos

### 🛞 Controle de Pneus (Diferencial)

- Cadastro individual com código único
- Histórico completo de eventos
- Cálculo automático de custo/km
- Alertas inteligentes de manutenção
- Análise de ROI e economia

### 📱 Dashboards por Perfil

- **Motorista**: Checklist diário e ocorrências
- **Administrador**: Visão 360° da operação
- **Financeiro**: Relatórios e análise de custos

### 🔔 Notificações em Tempo Real

- Socket.IO para comunicação instantânea
- Alertas automáticos por perfil
- Histórico de notificações

### 📊 Relatórios e Análises

- Estatísticas de pneus
- Custos por caminhão/motorista
- Exportação de dados

---

Desenvolvido para otimizar gestão de transportadoras com foco em economia e controle operacional.
