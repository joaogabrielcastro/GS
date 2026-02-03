# 📡 Exemplos de Uso da API

Este documento contém exemplos práticos de como usar a API do sistema.

---

## 🔐 Autenticação

### Registrar Usuário

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "cpf": "12345678900",
  "phone": "11999999999",
  "role": "MOTORISTA"
}
```

Roles disponíveis: `MOTORISTA`, `ADMINISTRADOR`, `FINANCEIRO`

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "role": "MOTORISTA"
  }
}
```

### Obter Perfil

```bash
GET /api/auth/profile
Authorization: Bearer {token}
```

---

## 🚚 Caminhões

### Criar Caminhão (Admin)

```bash
POST /api/trucks
Authorization: Bearer {token}
Content-Type: application/json

{
  "plate": "ABC-1234",
  "model": "Scania R450",
  "brand": "Scania",
  "year": 2022,
  "status": "ATIVO",
  "totalKm": 50000,
  "acquisitionDate": "2022-01-15",
  "notes": "Caminhão novo da frota"
}
```

### Listar Caminhões

```bash
GET /api/trucks
Authorization: Bearer {token}

# Com filtros
GET /api/trucks?status=ATIVO&active=true
```

### Buscar Caminhão por ID

```bash
GET /api/trucks/{id}
Authorization: Bearer {token}
```

### Atribuir Motorista

```bash
POST /api/trucks/{id}/assign-driver
Authorization: Bearer {token}
Content-Type: application/json

{
  "driverId": "uuid-do-motorista"
}
```

### Atualizar Caminhão

```bash
PUT /api/trucks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "MANUTENCAO",
  "totalKm": 55000,
  "notes": "Em manutenção preventiva"
}
```

---

## 🛞 Pneus (Foco Principal)

### Criar Pneu (Admin)

```bash
POST /api/tires
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "PN-001",
  "brand": "Pirelli",
  "model": "Formula Driver",
  "position": "DIANTEIRO_ESQUERDO",
  "truckId": "uuid-do-caminhao",
  "cost": 1500.00,
  "initialKm": 50000,
  "lifeExpectancyKm": 100000,
  "notes": "Pneu novo instalado"
}
```

Posições disponíveis:
- `DIANTEIRO_ESQUERDO`
- `DIANTEIRO_DIREITO`
- `TRASEIRO_ESQUERDO_EXTERNO`
- `TRASEIRO_ESQUERDO_INTERNO`
- `TRASEIRO_DIREITO_EXTERNO`
- `TRASEIRO_DIREITO_INTERNO`
- `ESTEPE`

### Listar Pneus

```bash
GET /api/tires
Authorization: Bearer {token}

# Filtros
GET /api/tires?truckId={id}&status=NOVO&active=true
```

### Registrar Evento no Pneu

```bash
POST /api/tires/{id}/event
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventType": "ESTOURO",
  "description": "Pneu estourou na rodovia",
  "kmAtEvent": 75000,
  "cost": 1500.00,
  "photoUrl": "/uploads/tires/foto.jpg"
}
```

Tipos de evento:
- `INSTALACAO`
- `REMOCAO`
- `ESTOURO`
- `TROCA`
- `RECAPAGEM`
- `MANUTENCAO`
- `DESGASTE`

### Obter Estatísticas de Pneus

```bash
GET /api/tires/statistics
Authorization: Bearer {token}

# Por caminhão
GET /api/tires/statistics?truckId={id}
```

**Resposta:**
```json
{
  "totalTires": 48,
  "totalCost": 72450.00,
  "totalEvents": 156,
  "averageLifeKm": 85000,
  "eventsByType": [
    { "eventType": "INSTALACAO", "_count": 48 },
    { "eventType": "ESTOURO", "_count": 12 }
  ],
  "costPerKm": "0.8900"
}
```

### Obter Alertas de Pneus

```bash
GET /api/tires/alerts
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "alerts": [
    {
      "tireId": "uuid",
      "tireCode": "PN-001",
      "truck": { "plate": "ABC-1234" },
      "type": "VIDA_UTIL",
      "severity": "CRITICO",
      "message": "Pneu próximo do fim da vida útil (95000/100000 km)"
    }
  ],
  "count": 5
}
```

---

## ✅ Checklist Diário

### Upload de Fotos

```bash
POST /api/checklists/upload-photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

cabinPhoto: [arquivo]
tiresPhoto: [arquivo]
canvasPhoto: [arquivo]
```

**Resposta:**
```json
{
  "message": "Fotos enviadas com sucesso",
  "photoUrls": {
    "cabinPhotoUrl": "/uploads/checklist/uuid.jpg",
    "tiresPhotoUrl": "/uploads/checklist/uuid.jpg",
    "canvasPhotoUrl": "/uploads/checklist/uuid.jpg"
  }
}
```

### Criar Checklist

```bash
POST /api/checklists
Authorization: Bearer {token}
Content-Type: application/json

{
  "truckId": "uuid-do-caminhao",
  "cabinPhotoUrl": "/uploads/checklist/uuid.jpg",
  "tiresPhotoUrl": "/uploads/checklist/uuid.jpg",
  "canvasPhotoUrl": "/uploads/checklist/uuid.jpg",
  "overallCondition": "BOM",
  "notes": "Tudo em ordem",
  "location": "São Paulo - SP",
  "latitude": -23.550520,
  "longitude": -46.633308
}
```

### Listar Checklists

```bash
GET /api/checklists
Authorization: Bearer {token}

# Filtros
GET /api/checklists?truckId={id}&startDate=2026-01-01&endDate=2026-01-31
```

---

## 🚨 Ocorrências

### Upload de Fotos

```bash
POST /api/occurrences/upload-photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

photos: [arquivo1, arquivo2, arquivo3]
```

### Criar Ocorrência

```bash
POST /api/occurrences
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "PNEU_ESTOURADO",
  "description": "Pneu dianteiro esquerdo estourou na rodovia",
  "truckId": "uuid-do-caminhao",
  "location": "Rod. Presidente Dutra, KM 180",
  "latitude": -23.550520,
  "longitude": -46.633308,
  "photoUrls": ["/uploads/occurrences/uuid1.jpg", "/uploads/occurrences/uuid2.jpg"],
  "estimatedCost": 1500.00,
  "hasFinalcialImpact": true
}
```

Tipos de ocorrência:
- `PNEU_ESTOURADO`
- `PROBLEMA_MECANICO`
- `LONA_RASGADA`
- `ACIDENTE`
- `MANUTENCAO`
- `OUTRO`

### Listar Ocorrências

```bash
GET /api/occurrences
Authorization: Bearer {token}

# Filtros
GET /api/occurrences?truckId={id}&type=PNEU_ESTOURADO&status=PENDENTE
```

### Atualizar Status (Admin/Financeiro)

```bash
PUT /api/occurrences/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "RESOLVIDO",
  "resolutionNotes": "Pneu trocado, caminhão liberado",
  "actualCost": 1520.00
}
```

Status disponíveis:
- `PENDENTE`
- `EM_ANALISE`
- `APROVADO`
- `REJEITADO`
- `RESOLVIDO`

### Obter Estatísticas

```bash
GET /api/occurrences/statistics
Authorization: Bearer {token}

# Por período
GET /api/occurrences/statistics?startDate=2026-01-01&endDate=2026-01-31
```

**Resposta:**
```json
{
  "total": 45,
  "byType": {
    "PNEU_ESTOURADO": 12,
    "PROBLEMA_MECANICO": 8,
    "LONA_RASGADA": 5
  },
  "byStatus": {
    "PENDENTE": 3,
    "RESOLVIDO": 42
  },
  "withFinancialImpact": 38,
  "totalEstimatedCost": 45000.00,
  "totalActualCost": 47200.00
}
```

---

## 📊 Exemplos de Fluxos Completos

### Fluxo 1: Motorista Inicia o Dia

1. **Login**
```bash
POST /api/auth/login
{ "email": "motorista@example.com", "password": "senha123" }
```

2. **Upload de fotos do checklist**
```bash
POST /api/checklists/upload-photos
[cabinPhoto, tiresPhoto, canvasPhoto]
```

3. **Criar checklist**
```bash
POST /api/checklists
{ "truckId": "...", "photoUrls": [...], "notes": "Tudo OK" }
```

### Fluxo 2: Motorista Reporta Problema

1. **Upload de fotos da ocorrência**
```bash
POST /api/occurrences/upload-photos
[foto1, foto2, foto3]
```

2. **Criar ocorrência**
```bash
POST /api/occurrences
{
  "type": "PNEU_ESTOURADO",
  "description": "...",
  "photoUrls": [...],
  "hasFinalcialImpact": true
}
```

3. **Notificação automática é enviada para Admin e Financeiro via Socket.IO**

### Fluxo 3: Admin Cadastra Novo Pneu

1. **Criar pneu**
```bash
POST /api/tires
{
  "code": "PN-050",
  "brand": "Pirelli",
  "truckId": "...",
  "cost": 1500
}
```

2. **Sistema automaticamente cria evento de INSTALACAO**

3. **Verificar estatísticas atualizadas**
```bash
GET /api/tires/statistics?truckId={id}
```

### Fluxo 4: Financeiro Gera Relatório

1. **Buscar estatísticas de pneus**
```bash
GET /api/tires/statistics
```

2. **Buscar ocorrências com impacto financeiro**
```bash
GET /api/occurrences?hasFinalcialImpact=true
```

3. **Buscar estatísticas de ocorrências**
```bash
GET /api/occurrences/statistics?startDate=2026-01-01&endDate=2026-01-31
```

---

## 🔌 WebSocket (Socket.IO)

### Conectar ao Socket

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Após autenticação
socket.emit('join', userId);

// Escutar notificações
socket.on('newNotification', (data) => {
  console.log('Nova notificação:', data);
});
```

### Eventos Disponíveis

- `join`: Entrar na sala do usuário
- `newNotification`: Nova notificação recebida

---

## 🧪 Testando com cURL

### Criar usuário admin e fazer login

```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","name":"Admin","role":"ADMINISTRADOR"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Copie o token da resposta

# Usar token nas requisições
curl -X GET http://localhost:3000/api/trucks \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📱 Integração com Frontend

### Exemplo com Axios

```typescript
import api from './services/api';

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
};

// Buscar pneus
const getTires = async (truckId: string) => {
  const response = await api.get(`/tires?truckId=${truckId}`);
  return response.data;
};

// Criar ocorrência
const createOccurrence = async (data: any) => {
  const response = await api.post('/occurrences', data);
  return response.data;
};
```

---

**API REST completa e documentada!** 🚀
