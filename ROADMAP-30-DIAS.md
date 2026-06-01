# Roadmap GS — 30 dias

Objetivo: transformar o MVP em produto **confiável, seguro e vendável**, sem rewrite total.

**Premissas**
- 1 dev em tempo parcial (~3–4 h/dia) ≈ **60–80 h** no mês
- 1 dev em tempo integral ≈ **120–160 h** no mês (ajuste as estimativas ÷2)
- Produção já em VPS/Coolify com PostgreSQL

---

## Visão por semana

| Semana | Foco | Resultado para o cliente |
|--------|------|---------------------------|
| **1** | Fotos + infra | Fotos não somem após deploy; política de retenção clara |
| **2** | Segurança + API | Cadastro fechado; socket seguro ou removido; buscas estáveis |
| **3** | Arquitetura + qualidade | Código mais fácil de manter; menos regressão |
| **4** | Produto + valor comercial | Painel de conformidade; UX motorista; relatórios |

---

## Progresso (implementado no repositório)

- [x] Semana 1 — cleanup seguro, DEPLOY.md, backup.sh, migrations, .env.example
- [x] Semana 2 — register fechado, socket JWT, debounce buscas
- [x] Semana 3 (parcial) — services (dashboard, checklist query, review), DriversTab, testes `npm test`
- [x] Semana 4 (parcial) — KPI conformidade, auditoria de revisão, export CSV (com filtro de datas), wizard checklist motorista
- [x] Removido `@tanstack/react-query` (não utilizado)
- [x] Rate limit no login (20 tentativas / 15 min por IP)

---

## Semana 1 — Preservação de dados (P0)

> **Risco que você já sentiu:** fotos apagadas, KM errado, deploy sem volume.

| # | Tarefa | Estimativa | Entregável |
|---|--------|------------|------------|
| 1.1 | Configurar `UPLOAD_PATH` absoluto + volume Docker persistente no VPS | 2–4 h | Documentação `DEPLOY.md` + compose/env de exemplo |
| 1.2 | Desabilitar cleanup agressivo: `UPLOAD_CLEANUP_RETENTION_DAYS=0` ou job só em dev; em prod mínimo 365 dias ou desligado para `checklist`/`occurrences` | 2–3 h | Env documentado; log do job não apaga evidências |
| 1.3 | Backup automático: pasta `uploads` + dump Postgres (cron diário, retenção 7–30 dias) | 3–5 h | Script + onde restaurar (já discutido com cliente) |
| 1.4 | Healthcheck deploy: após subir, validar `/api/health` + 1 arquivo de teste em `uploads` | 1 h | Checklist pós-deploy |
| 1.5 | Rodar `prisma migrate dev` inicial e passar deploy para `migrate deploy` (não só `db push`) | 2–4 h | Pasta `prisma/migrations` versionada |
| 1.6 | Garantir coluna `odometer` em produção (`migrate deploy`) | 0,5 h | KM visível em checklists novos e legados com fallback |

**Critério de aceite semana 1:** redeploy do container **não** apaga fotos; backup restaurável em ambiente de teste.

---

## Semana 2 — Segurança e estabilidade (P0 + P1)

| # | Tarefa | Estimativa | Entregável |
|---|--------|------------|------------|
| 2.1 | Fechar `POST /auth/register` público (flag `ALLOW_PUBLIC_REGISTER=false` ou remover rota + página) | 1–2 h | Só admin cria motorista |
| 2.2 | Socket.IO: autenticar handshake com JWT **ou** remover socket e usar polling no admin | 4–6 h | Impossível entrar em `user_{id}` alheio |
| 2.3 | Debounce 350 ms nas buscas (motoristas, checklists, ocorrências, caminhões) | 2 h | Digitar sem perder foco / sem flood de API |
| 2.4 | Unificar respostas de erro da API (sempre envelope ou sempre legado — 1 padrão) | 4–6 h | Frontend trata erro de forma previsível |
| 2.5 | Rate limit em `/auth/login` e `/checklists/upload-photos` (mais restritivo) | 1–2 h | Proteção brute-force / abuso upload |
| 2.6 | Revisar CORS e `TRUST_PROXY` no Coolify (documentar valores exatos) | 1 h | Sem 502/CORS intermitente |

**Critério de aceite semana 2:** pentest manual básico (register, socket join com outro userId) falha; busca admin fluida.

---

## Semana 3 — Manutenção e arquitetura (P1)

| # | Tarefa | Estimativa | Entregável |
|---|--------|------------|------------|
| 3.1 | Extrair `getImageUrl` + regras de URL para `lib/mediaUrls.ts` | 2 h | `AdminDashboardContainer` menor |
| 3.2 | Quebrar `AdminDashboardContainer`: `DriversTab`, `DriversTab` search, modais isolados | 6–8 h | Arquivo principal &lt; 250 linhas |
| 3.3 | Backend: criar `services/checklistService.ts`, `truckService.ts` (mover regra de negócio dos controllers) | 8–12 h | Controllers finos |
| 3.4 | Remover `@tanstack/react-query` **ou** migrar hooks admin para `useQuery`/`useMutation` | 6–10 h | Um padrão de data-fetching |
| 3.5 | Dividir `types/index.ts` → `domain/vehicle.ts`, `domain/tire.ts`, `domain/checklist.ts` | 3–4 h | Imports claros |
| 3.6 | Decidir `TruckHistory`: tela “Histórico do veículo” **ou** remover modelo + writes | 4–8 h | Sem código morto |
| 3.7 | Testes mínimos: auth login, list trucks+search, file 403, create checklist | 8–12 h | CI roda `npm test` |

**Critério de aceite semana 3:** PR de feature média não mexe em 700 linhas de um arquivo; 5+ testes verdes.

---

## Semana 4 — Produto e valor comercial (P2)

| # | Tarefa | Estimativa | Entregável |
|---|--------|------------|------------|
| 4.1 | Painel admin “Conformidade hoje”: % caminhões com checklist / pendentes revisão | 6–8 h | KPI vendável |
| 4.2 | Revisão checklist: campo `reviewNotes` + `reviewedBy` + `reviewedAt` | 4–6 h | Auditoria |
| 4.3 | Checklist motorista em wizard (3 passos: geral → cabine/lona → pneus) | 8–12 h | Menos abandono no fluxo |
| 4.4 | `ImageWithFallback`: mensagem “Foto indisponível” + link suporte | 2 h | UX quando arquivo sumiu |
| 4.5 | Export PDF ou CSV: checklists por período/placa (admin) | 6–10 h | Entregável para cliente |
| 4.6 | Enums Prisma para condições checklist (`BOM`/`RUIM`/…) + migration | 4–6 h | Relatórios consistentes |
| 4.7 | Documentação operacional 1 página: como cadastrar caminhão, motorista, revisar checklist | 2 h | Onboarding cliente |

**Critério de aceite semana 4:** admin vê conformidade do dia; motorista completa checklist com menos confusão; export para arquivo.

---

## Backlog pós-30 dias (não bloquear lançamento)

| Item | Esforço | Quando |
|------|---------|--------|
| Storage S3/R2 (abstração `IFileStorage`) | 2–3 dias | Antes de 2ª transportadora ou &gt;50 GB fotos |
| Multi-tenant (`organizationId`) | 2–4 semanas | Modelo SaaS B2B |
| JWT em httpOnly cookie | 2–3 dias | Hardening segurança |
| Compressão imagens no upload (sharp) | 1–2 dias | Rede 4G motorista |
| PWA offline (fila de upload) | 1–2 semanas | Operação sem sinal |
| Alertas WhatsApp/e-mail | 3–5 dias | Upsell |
| OpenAPI + tipos gerados no frontend | 2–3 dias | Escala do time |

---

## Ordem de execução (se só der para 1 coisa por dia)

```
D1  → 1.1 volume uploads
D2  → 1.2 cleanup seguro
D3  → 1.3 backup
D4  → 1.5 migrations
D5  → 2.1 fechar register
D6  → 2.3 debounce buscas
D7  → 2.2 socket auth
D8  → 2.4 erros API
D9  → 3.1 getImageUrl
D10 → 3.2 fatiar AdminDashboard
D11 → 3.3 services backend (checklist)
D12 → 3.3 services backend (trucks)
D13 → 3.7 testes auth + trucks
D14 → 3.7 testes checklist + files
D15 → 4.1 conformidade KPI
D16 → 4.2 revisão auditável
D17 → 4.4 fallback imagem
D18 → 4.3 wizard checklist (parte 1)
D19 → 4.3 wizard checklist (parte 2)
D20 → 4.5 export relatório
D21 → buffer / deploy / QA com cliente
```

---

## Métricas de sucesso (30 dias)

| Métrica | Meta |
|---------|------|
| Fotos após redeploy | 100% preservadas (volume) |
| Tempo busca admin | &lt; 500 ms p95 com debounce |
| Registros públicos não autorizados | 0 |
| Cobertura testes críticos | ≥ 5 fluxos automatizados |
| Tamanho maior arquivo frontend | &lt; 300 linhas |
| Checklist completo (motorista) | Reduzir passos visíveis ou tempo médio (medir com cliente) |

---

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Cliente sem backup antigo | Recuperação manual via prints (processo já definido) |
| `db push` em prod quebra dados | Parar push; só `migrate deploy` |
| Escopo estourar 30 dias | Cortar semana 4.5 (export) e 3.7 (testes parciais), manter semana 1 inteira |
| Uma pessoa só | Fazer só P0 (semanas 1–2) = já vendável e estável |

---

## Investimento sugerido (comunicação com cliente)

Para o recibo/escopo de **R$ 450** já entregue: correções de busca, KM, foco no campo — **manutenção corretiva**.

Este roadmap 30 dias = **evolução estrutural** — orçar separadamente, por exemplo:

- **Pacote Estabilidade (Semanas 1–2):** 20–30 h  
- **Pacote Profissional (Semanas 3–4):** 25–35 h  
- **Total referência:** 45–65 h (ajustar valor/h do desenvolvedor)

---

*Gerado com base na auditoria técnica do repositório GS (maio/2026). Revisar datas ao iniciar a sprint.*
