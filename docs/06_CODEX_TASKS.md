# 06_CODEX_TASKS — OrdemPro

**Arquivo:** `docs/06_CODEX_TASKS.md`  
**App:** OrdemPro  
**Stack prevista:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Modo:** Offline-first  
**Objetivo:** organizar tarefas pequenas, seguras e econômicas para implementação no Codex, com foco em alto desempenho, baixa utilização de créditos, baixo retrabalho e alta previsibilidade.

---

## 1. Princípio central deste documento

O Codex não deve receber pedidos amplos como:

```txt
Crie o app inteiro.
Implemente todas as telas.
Refatore tudo.
Leia tudo e faça funcionar.
```

O OrdemPro deve ser implementado por **tarefas curtas, verificáveis e com escopo limitado**.

Cada tarefa deve ter:

```txt
1 objetivo claro
arquivos permitidos
arquivos proibidos
referências mínimas
critérios de aceitação
comando de verificação
regra de parada
```

A meta é reduzir:

- leitura desnecessária de arquivos;
- alterações grandes difíceis de revisar;
- loops de correção;
- consumo excessivo de créditos;
- perda de contexto;
- risco de quebrar telas prontas.

---

## 2. Diretrizes de desempenho e economia para Codex

### 2.1. Contexto mínimo, não contexto gigante

Em cada tarefa, enviar apenas:

```txt
Objetivo
Arquivos relevantes
Restrições
Critério de conclusão
```

Evitar colar documentos inteiros no prompt. Preferir referenciar arquivos:

```txt
Leia apenas:
- PROJECT_GUIDE.md
- docs/04_SCREEN_SPECS.md, seção da tela atual
- docs/05_DATA_MODEL.md, seção da entidade atual
```

### 2.2. Reutilizar regras com `AGENTS.md`

Criar um `AGENTS.md` curto na raiz do repositório para que as regras globais não precisem ser repetidas em todo prompt.

O `AGENTS.md` deve conter:

- stack do projeto;
- comandos de verificação;
- estrutura de pastas;
- convenções TypeScript;
- regras de SQLite;
- regras de UI;
- arquivos que não devem ser alterados sem autorização;
- definition of done.

### 2.3. Usar `/plan` só quando necessário

Usar modo de planejamento apenas em tarefas complexas, como:

- criação da arquitetura de banco;
- migrações SQLite;
- geração de PDF;
- refatoração de erro recorrente;
- debug difícil;
- auditoria final.

Para tarefas simples e bem definidas, usar execução direta.

### 2.4. Escolher nível de raciocínio por dificuldade

Sugestão operacional:

| Tipo de tarefa | Modo sugerido | Motivo |
|---|---|---|
| Criar componente visual simples | Low | Menor custo e escopo claro |
| Implementar tela baseada em spec | Low/Medium | Depende da complexidade da tela |
| Criar schema SQLite | Medium | Exige consistência entre tipos e tabelas |
| Debug de erro de build | Medium/High | Exige rastrear causa |
| PDF e backup | Medium/High | Operações críticas e com arquivos |
| Auditoria final | High | Precisa cruzar projeto inteiro |

Não usar esforço alto por padrão.

### 2.5. Não usar modo rápido como padrão

Modo rápido pode ser útil para tarefas simples, mas não deve ser padrão se aumentar consumo de créditos. Usar somente quando a tarefa for pequena e urgente.

### 2.6. Sempre limitar arquivos permitidos

Cada tarefa deve declarar:

```txt
Arquivos permitidos:
- ...

Arquivos proibidos:
- ...
```

Se o Codex precisar alterar arquivo fora da lista, deve parar e justificar.

### 2.7. Verificar ao final de cada tarefa

Ao final de cada tarefa, Codex deve tentar:

```bash
npm run typecheck
```

Se existir:

```bash
npm run lint
```

Se a tarefa alterar banco, hooks ou navegação, também verificar importações e rotas.

### 2.8. Corrigir só erro causado pela tarefa

Se o `typecheck` apontar erro antigo ou fora do escopo, o Codex deve:

1. relatar o erro;
2. indicar arquivo e causa provável;
3. não refatorar áreas fora do escopo sem autorização.

### 2.9. Evitar dependências novas

Instalar biblioteca nova só quando:

- for indispensável;
- estiver alinhada à stack;
- houver justificativa curta;
- a tarefa autorizar mudança no `package.json`.

### 2.10. Preferir implementação incremental

Sequência correta:

```txt
Base → tipos → banco → repositories → hooks → componentes → telas → fluxos → PDF → backup → auditoria
```

Não implementar tela que depende de dados antes de existir tipo/hook mínimo.

---

## 3. Pacote de contexto fixo para todas as tarefas

Todo prompt ao Codex deve começar com este bloco curto:

```md
# Contexto Atual do Projeto

App: OrdemPro
Stack: Expo + React Native + TypeScript + Expo Router + SQLite local
Modo: offline-first
Fase atual: [preencher]
Objetivo desta tarefa: [preencher]

Leia apenas o necessário:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md, se precisar validar escopo
- docs/03_USER_FLOW.md, se a tarefa envolver navegação/fluxo
- docs/04_SCREEN_SPECS.md, seção da tela atual
- docs/05_DATA_MODEL.md, seção da entidade atual

Regras:
- implemente somente o objetivo desta tarefa;
- não crie recurso fora da V1;
- não altere arquivos fora da lista permitida;
- não instale dependências sem autorização;
- preserve TypeScript;
- rode typecheck ao final;
- se precisar sair do escopo, pare e explique.
```

---

## 4. Template curto de prompt para Codex

Usar este template para quase todas as tarefas:

```md
Você é um dev sênior de Expo, React Native, TypeScript e SQLite.

Objetivo:
[descrever em 1 frase]

Referências:
- [arquivo/seção]

Arquivos permitidos:
- [lista]

Arquivos proibidos:
- [lista]

Regras:
- implemente somente esta tarefa;
- reutilize componentes/tipos existentes;
- não crie recurso fora do escopo;
- mantenha responsivo para celular pequeno e tablet;
- mantenha suporte a tema claro/escuro quando aplicável;
- evite `any`;
- limpe imports;
- rode `npm run typecheck`.

Critérios de aceitação:
- [critério 1]
- [critério 2]
- typecheck passa ou erro externo é relatado.

Pare e pergunte antes se:
- precisar instalar dependência;
- precisar alterar arquivo fora dos permitidos;
- encontrar conflito entre documentos;
- o requisito estiver ambíguo.
```

---

## 5. `AGENTS.md` recomendado para a raiz

Criar este arquivo antes de iniciar implementação real.

```md
# AGENTS.md — OrdemPro

## Projeto

OrdemPro é um app mobile offline-first para gestão de ordens de serviço.

Stack:
- Expo
- React Native
- TypeScript
- Expo Router
- SQLite local

Fluxo principal:
Empresa → Cliente → Equipamento → OS → Peças/Serviços → Valores → Assinatura → PDF → Backup

## Documentos fonte

- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md, quando existir
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md
- docs/06_CODEX_TASKS.md

## Regras de escopo

Não implementar na V1:
- login obrigatório;
- sincronização em nuvem;
- multiusuário;
- nota fiscal;
- estoque completo;
- agenda complexa;
- CRM;
- portal do cliente;
- IA para diagnóstico;
- WhatsApp Business API;
- relatórios avançados;
- múltiplas empresas.

## Regras de código

- Não usar `any` sem justificativa.
- Tipos ficam em `src/types/`.
- Banco fica em `src/database/`.
- Acesso ao banco deve passar por repositories/services.
- Telas não acessam SQLite diretamente.
- Hooks ficam em `src/hooks/`.
- Componentes globais ficam em `src/components/ui/`.
- Componentes de domínio ficam em `src/components/[dominio]/`.
- Não misturar UI, storage, regra de negócio e navegação no mesmo arquivo.

## Regras de dados

- IDs são UUID local em string.
- Datas são ISO string.
- Dinheiro é inteiro em centavos.
- Booleanos no SQLite são 0/1.
- Arquivos são armazenados por `localUri`, nunca base64 no banco.
- Entidades com histórico usam soft delete.
- OS cancelada mantém histórico.
- OS entregue não deve ser editada sem confirmação.

## Regras de UI

- Mobile-first.
- Respeitar safe area.
- Um CTA principal por tela.
- Cards consistentes.
- Não duplicar informação.
- Tema claro/escuro não pode quebrar.
- Formulários longos devem usar ScrollView.

## Comandos de verificação

Preferencial:
```bash
npm run typecheck
npm run lint
```

Se não existir `typecheck`, sugerir adicionar:
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

## Definition of done

Uma tarefa só está pronta quando:
- implementou apenas o combinado;
- não alterou arquivos fora do escopo;
- visual/funcional segue os documentos;
- não criou duplicação;
- imports estão limpos;
- typecheck passa ou erro externo é relatado com precisão.
```

---

## 6. Estratégia de fases

### Fase 0 — Auditoria sem alteração

Objetivo: entender o estado real do projeto antes de codar.

### Fase 1 — Preparação do repositório

Objetivo: criar regras duráveis, scripts e estrutura base.

### Fase 2 — Base visual

Objetivo: tokens, componentes globais e tema.

### Fase 3 — Modelo local

Objetivo: tipos, SQLite, migrações, repositories e hooks.

### Fase 4 — Navegação e onboarding

Objetivo: entrada correta do app e configuração da empresa.

### Fase 5 — Cadastros principais

Objetivo: clientes, equipamentos, serviços e peças.

### Fase 6 — Ordem de serviço

Objetivo: fluxo guiado, detalhes, status e cálculos.

### Fase 7 — Mídia, assinatura e PDF

Objetivo: fotos, assinatura, PDF local e compartilhamento.

### Fase 8 — Backup e restauração

Objetivo: exportar/importar dados locais.

### Fase 9 — Polimento, auditoria e build

Objetivo: corrigir inconsistências, validar responsividade e preparar publicação.

---

# Tarefas para Codex

## T00 — Auditoria inicial sem alteração

**Modo sugerido:** `/plan`  
**Raciocínio:** Medium  
**Custo esperado:** baixo/médio  
**Alteração de arquivos:** proibida

### Objetivo

Analisar o projeto atual sem alterar arquivos e indicar a primeira tarefa segura.

### Referências

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`

### Arquivos permitidos

Nenhum.

### Arquivos proibidos

Todos.

### Prompt

```md
Você é um dev sênior de Expo, React Native, TypeScript e SQLite.

Analise este projeto sem alterar arquivos.

Leia:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md

Entregue:
1. estrutura atual do projeto;
2. dependências relevantes;
3. scripts disponíveis;
4. arquivos ausentes;
5. riscos técnicos;
6. ordem segura de implementação;
7. primeira tarefa recomendada.

Não altere arquivos.
Não instale dependências.
Não gere código ainda.
```

### Critérios de aceitação

- relatório objetivo;
- nenhum arquivo alterado;
- primeira tarefa sugerida é pequena e verificável.

---

## T01 — Criar `AGENTS.md` e scripts mínimos

**Modo sugerido:** execução direta  
**Raciocínio:** Low  
**Custo esperado:** baixo

### Objetivo

Criar `AGENTS.md` e garantir script `typecheck` no `package.json`, sem mudar arquitetura.

### Referências

- `docs/06_CODEX_TASKS.md`, seção 5
- `package.json`

### Arquivos permitidos

- `AGENTS.md`
- `package.json`

### Arquivos proibidos

- `app/**`
- `src/**`
- arquivos de lock, salvo se pacote for alterado; esta tarefa não deve instalar pacotes

### Prompt

```md
Crie um AGENTS.md curto para o projeto OrdemPro baseado em docs/06_CODEX_TASKS.md, seção 5.

Depois verifique se package.json tem script:
"typecheck": "tsc --noEmit"

Se não existir, adicione apenas esse script.

Não instale dependências.
Não altere código do app.
Rode npm run typecheck se possível e relate o resultado.
```

### Critérios de aceitação

- `AGENTS.md` criado;
- `typecheck` disponível;
- nenhuma alteração fora do escopo.

---

## T02 — Estrutura de pastas base

**Modo sugerido:** execução direta  
**Raciocínio:** Low  
**Custo esperado:** baixo

### Objetivo

Criar estrutura base de pastas sem implementar telas ou lógica.

### Referências

- `docs/05_DATA_MODEL.md`, organização sugerida
- `docs/04_SCREEN_SPECS.md`, componentes globais obrigatórios

### Arquivos permitidos

- `src/components/ui/.gitkeep`
- `src/components/onboarding/.gitkeep`
- `src/components/home/.gitkeep`
- `src/components/orders/.gitkeep`
- `src/components/customers/.gitkeep`
- `src/components/equipments/.gitkeep`
- `src/components/catalog/.gitkeep`
- `src/components/settings/.gitkeep`
- `src/components/pdf/.gitkeep`
- `src/types/.gitkeep`
- `src/database/.gitkeep`
- `src/repositories/.gitkeep`
- `src/services/.gitkeep`
- `src/hooks/.gitkeep`
- `src/utils/.gitkeep`
- `src/constants/.gitkeep`

### Arquivos proibidos

- telas em `app/**`
- `package.json`, salvo se já necessário e autorizado

### Prompt

```md
Crie apenas a estrutura de pastas base do OrdemPro usando arquivos .gitkeep quando necessário.

Não implemente componentes.
Não altere telas.
Não instale dependências.
Rode npm run typecheck se possível.
```

### Critérios de aceitação

- pastas criadas;
- nenhuma lógica adicionada;
- typecheck não piora.

---

## T03 — Tipos comuns e enums

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium  
**Custo esperado:** baixo

### Objetivo

Criar tipos comuns usados por todas as entidades.

### Referências

- `docs/05_DATA_MODEL.md`, seções de convenções e tipos

### Arquivos permitidos

- `src/types/common.ts`
- `src/types/index.ts`

### Arquivos proibidos

- `app/**`
- `src/database/**`
- repositories

### Prompt

```md
Crie os tipos comuns do OrdemPro em src/types/common.ts.

Inclua:
- BaseEntity
- SoftDelete fields
- MoneyCents
- ISODateString
- ThemeMode
- SyncState placeholder local
- tipos utilitários para IDs

Crie src/types/index.ts exportando common.ts.

Não implemente banco.
Não altere telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- tipos compilam;
- sem `any`;
- arquivo reutilizável pelas próximas tarefas.

---

## T04 — Tipos de empresa, PDF settings e termos

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Criar tipos para `CompanyProfile`, `PdfSettings` e `DefaultTerms`.

### Referências

- `docs/01_APP_BLUEPRINT.md`, cadastro da empresa e PDF
- `docs/05_DATA_MODEL.md`, entidades de empresa/settings

### Arquivos permitidos

- `src/types/company.ts`
- `src/types/pdf.ts`
- `src/types/index.ts`

### Prompt

```md
Implemente apenas os tipos TypeScript de empresa, configurações de PDF e termos padrão.

Arquivos:
- src/types/company.ts
- src/types/pdf.ts
- src/types/index.ts

Regras:
- dinheiro não é necessário aqui;
- datas em ISO string;
- logo e assinatura padrão por localUri;
- usar union types para modelo do PDF.

Não implemente SQLite.
Não altere telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- tipos exportados;
- alinhado ao PDF profissional;
- sem dependência de UI.

---

## T05 — Tipos de cliente e equipamento

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Criar tipos de clientes e equipamentos.

### Referências

- `docs/01_APP_BLUEPRINT.md`, seções clientes/equipamentos
- `docs/05_DATA_MODEL.md`, entidades correspondentes

### Arquivos permitidos

- `src/types/customer.ts`
- `src/types/equipment.ts`
- `src/types/index.ts`

### Prompt

```md
Crie os tipos TypeScript para Customer e Equipment.

Inclua:
- enums/unions de tipo de cliente, status, origem e preferência de contato;
- categorias de equipamento;
- acessórios;
- estado físico;
- vínculo Equipment.customerId;
- campos de auditoria via BaseEntity.

Não implemente banco.
Não altere telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- cliente pode ser PF/PJ;
- equipamento sempre possui `customerId`;
- soft delete previsto.

---

## T06 — Tipos de catálogo, OS, pagamento, mídia e backup

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Criar tipos centrais restantes.

### Referências

- `docs/05_DATA_MODEL.md`
- `docs/04_SCREEN_SPECS.md`, entidades previstas

### Arquivos permitidos

- `src/types/catalog.ts`
- `src/types/order.ts`
- `src/types/payment.ts`
- `src/types/media.ts`
- `src/types/backup.ts`
- `src/types/settings.ts`
- `src/types/index.ts`

### Prompt

```md
Crie os tipos TypeScript restantes do OrdemPro:
- catálogo de serviços;
- catálogo de peças;
- ordem de serviço;
- itens da OS;
- pagamentos;
- fotos;
- assinaturas;
- backup;
- configurações do app.

Regras:
- valores monetários em centavos;
- datas em ISO string;
- arquivos por localUri;
- status da OS como union type;
- itens da OS devem congelar dados copiados do catálogo.

Não implemente SQLite.
Não altere telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- tipos cobrem fluxo completo da OS;
- não há `any`;
- exports centralizados.

---

## T07 — Utilitários de formatação e validação

**Modo sugerido:** execução direta  
**Raciocínio:** Low

### Objetivo

Criar utilitários puros para formatação BRL, datas, documentos e validações simples.

### Referências

- `docs/05_DATA_MODEL.md`, regras de validação e cálculo
- `docs/04_SCREEN_SPECS.md`, regras comuns de formulários

### Arquivos permitidos

- `src/utils/formatters.ts`
- `src/utils/validators.ts`
- `src/utils/money.ts`
- `src/utils/dates.ts`

### Prompt

```md
Crie utilitários puros para:
- formatar dinheiro em BRL a partir de centavos;
- converter input monetário para centavos;
- formatar telefone/documento de forma simples;
- validar e-mail apenas se preenchido;
- validar obrigatórios;
- lidar com ISO date string.

Não crie dependências novas.
Não altere telas.
Não acesse SQLite.
Rode npm run typecheck.
```

### Critérios de aceitação

- funções puras;
- testáveis;
- sem dependências externas.

---

## T08 — Cálculos da OS

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Implementar cálculo de itens e total da OS em centavos.

### Referências

- `docs/04_SCREEN_SPECS.md`, seção Regras comuns de cálculo
- `docs/05_DATA_MODEL.md`, regras comerciais

### Arquivos permitidos

- `src/services/orders/orderCalculations.ts`
- `src/utils/money.ts`

### Prompt

```md
Implemente funções puras de cálculo de OS em src/services/orders/orderCalculations.ts.

Regras:
- totalItem = quantidade * valorUnitario - desconto;
- total nunca negativo;
- totalServicos;
- totalPecas;
- subtotal;
- descontoGeral;
- total;
- valorPendente.

Valores em centavos.
Não acesse SQLite.
Não altere telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- cálculo centralizado;
- valores negativos bloqueados ou normalizados;
- pronto para hooks e telas.

---

## T09 — Schema SQLite V1

**Modo sugerido:** `/plan` antes; implementar após plano aprovado se necessário  
**Raciocínio:** Medium  
**Custo esperado:** médio

### Objetivo

Criar schema SQLite V1 e migração inicial.

### Referências

- `docs/05_DATA_MODEL.md`, tabelas SQLite V1, índices e migrações

### Arquivos permitidos

- `src/database/db.ts`
- `src/database/schema.ts`
- `src/database/migrations.ts`

### Arquivos proibidos

- telas
- componentes
- repositories, salvo helpers mínimos se combinados

### Prompt

```md
/plan
Planeje a implementação do schema SQLite V1 do OrdemPro com base em docs/05_DATA_MODEL.md.

Depois implemente apenas:
- src/database/db.ts
- src/database/schema.ts
- src/database/migrations.ts

Regras:
- criar função initDatabase;
- controlar versão de schema;
- criar tabelas V1;
- criar índices de busca local;
- não implementar repositories ainda;
- não alterar telas;
- não instalar dependência sem autorização.

Rode npm run typecheck.
Se faltar biblioteca SQLite no projeto, pare e informe qual dependência é necessária.
```

### Critérios de aceitação

- schema V1 centralizado;
- migração idempotente;
- não quebra app existente.

---

## T10 — Repositories base de empresa e settings

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Criar repositories para empresa, PDF settings, termos e app settings.

### Referências

- `docs/05_DATA_MODEL.md`, repositories sugeridos

### Arquivos permitidos

- `src/repositories/companyRepository.ts`
- `src/repositories/settingsRepository.ts`
- `src/repositories/pdfRepository.ts`, apenas settings/metadados se necessário
- `src/database/db.ts`, somente imports/exports se necessário

### Prompt

```md
Implemente repositories locais para:
- CompanyProfile;
- PdfSettings;
- DefaultTerms;
- AppSettings.

Regras:
- telas não acessam SQLite diretamente;
- usar tipos de src/types;
- criar CRUD mínimo;
- soft delete quando aplicável;
- não implementar geração de PDF ainda;
- não alterar telas.

Rode npm run typecheck.
```

### Critérios de aceitação

- salvar/carregar empresa;
- salvar/carregar configurações;
- pronto para onboarding.

---

## T11 — Repositories de clientes e equipamentos

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Criar repositories de clientes e equipamentos com busca local.

### Referências

- `docs/05_DATA_MODEL.md`
- `docs/04_SCREEN_SPECS.md`, Clientes e Equipamentos

### Arquivos permitidos

- `src/repositories/customerRepository.ts`
- `src/repositories/equipmentRepository.ts`

### Prompt

```md
Implemente repositories para Customer e Equipment.

Inclua:
- create;
- update;
- getById;
- list;
- search;
- softDelete/inactivate;
- listEquipmentsByCustomer.

Regras:
- busca local por nome, telefone, documento, marca, modelo e série;
- equipamento sempre vinculado a customerId;
- não alterar telas;
- não criar UI.

Rode npm run typecheck.
```

### Critérios de aceitação

- operações CRUD locais;
- busca offline;
- soft delete preserva histórico.

---

## T12 — Repositories de catálogo

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Criar repositories para serviços e peças de catálogo.

### Referências

- `docs/05_DATA_MODEL.md`
- `docs/04_SCREEN_SPECS.md`, Catálogo de serviços e peças

### Arquivos permitidos

- `src/repositories/catalogRepository.ts`

### Prompt

```md
Implemente catalogRepository para ServiceCatalogItem e PartCatalogItem.

Inclua:
- create;
- update;
- list;
- search;
- activate/inactivate.

Regras:
- não implementar estoque;
- alterações no catálogo não afetam OS antigas;
- não alterar telas.

Rode npm run typecheck.
```

### Critérios de aceitação

- cadastro reutilizável;
- busca local;
- status ativo/inativo.

---

## T13 — Repositories de OS, itens, status e pagamento

**Modo sugerido:** `/plan` se o projeto já estiver grande  
**Raciocínio:** Medium/High

### Objetivo

Implementar persistência principal de ordens de serviço.

### Referências

- `docs/05_DATA_MODEL.md`, ServiceOrder, ServiceOrderItem, Payment e StatusHistory
- `docs/04_SCREEN_SPECS.md`, regras de status e cálculo

### Arquivos permitidos

- `src/repositories/orderRepository.ts`
- `src/repositories/paymentRepository.ts`
- `src/services/orders/orderNumberService.ts`
- `src/services/orders/orderStatusService.ts`
- `src/services/orders/orderCalculations.ts`, se ajuste for necessário

### Prompt

```md
Implemente persistência local de ServiceOrder, ServiceOrderItem, Payment e histórico de status.

Regras:
- toda OS tem número sequencial único;
- OS pode existir sem equipamento;
- OS sempre tem cliente;
- alteração de status registra data/hora;
- cancelar OS pede motivo no nível de serviço/repository;
- não excluir OS fisicamente por padrão;
- valores em centavos;
- usar cálculo centralizado.

Não implemente telas.
Rode npm run typecheck.
```

### Critérios de aceitação

- criar OS completa;
- listar por status;
- buscar;
- atualizar status;
- itens persistem;
- pagamento básico persiste.

---

## T14 — Repositories de mídia, assinatura e PDF metadata

**Modo sugerido:** execução direta ou `/plan` se houver dependência de biblioteca  
**Raciocínio:** Medium

### Objetivo

Criar persistência para fotos, assinaturas e registros de PDF.

### Referências

- `docs/05_DATA_MODEL.md`, media/pdf
- `docs/04_SCREEN_SPECS.md`, PDF e anexos

### Arquivos permitidos

- `src/repositories/mediaRepository.ts`
- `src/repositories/pdfRepository.ts`
- `src/services/media/fileStorageService.ts`

### Prompt

```md
Implemente repositories para PhotoAttachment, SignatureRecord e ServiceOrderPdf metadata.

Regras:
- banco salva localUri, não base64;
- fotos/assinaturas pertencem a uma OS;
- PDF guarda versão, caminho local, data de geração e flag de desatualizado;
- não implementar template de PDF ainda;
- não alterar telas.

Rode npm run typecheck.
Se faltar biblioteca para manipulação de arquivos, pare e informe.
```

### Critérios de aceitação

- arquivos referenciados por localUri;
- metadados persistem;
- PDF pode ser marcado como desatualizado.

---

## T15 — Hooks de dados locais

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Criar hooks que encapsulam repositories para uso nas telas.

### Referências

- `docs/04_SCREEN_SPECS.md`, regra de acesso a dados
- `docs/05_DATA_MODEL.md`, hooks sugeridos

### Arquivos permitidos

- `src/hooks/useCompanyProfile.ts`
- `src/hooks/useCustomers.ts`
- `src/hooks/useEquipments.ts`
- `src/hooks/useServiceOrders.ts`
- `src/hooks/useCatalog.ts`
- `src/hooks/useBackup.ts`, placeholder se backup ainda não existir

### Prompt

```md
Crie hooks de dados locais para encapsular repositories.

Regras:
- telas não devem acessar SQLite diretamente;
- hooks devem expor loading, error e ações;
- evitar lógica visual;
- não implementar telas;
- não fazer fetch de internet.

Rode npm run typecheck.
```

### Critérios de aceitação

- hooks compilam;
- loading/error previstos;
- pronto para telas.

---

## T16 — Design tokens e tema

**Modo sugerido:** execução direta  
**Raciocínio:** Low

### Objetivo

Criar tokens visuais e suporte base a tema claro/escuro.

### Referências

- `docs/04_SCREEN_SPECS.md`, direção visual consolidada
- `docs/02_DESIGN_SYSTEM.md`, se existir

### Arquivos permitidos

- `src/constants/colors.ts`
- `src/constants/spacing.ts`
- `src/constants/typography.ts`
- `src/hooks/useAppTheme.ts`

### Prompt

```md
Implemente tokens visuais base do OrdemPro.

Inclua:
- cores;
- espaçamentos;
- tipografia;
- hook useAppTheme simples.

Regras:
- visual empresarial azul/branco;
- tema claro/escuro preparado;
- não alterar telas ainda;
- não instalar dependências.

Rode npm run typecheck.
```

### Critérios de aceitação

- tokens exportados;
- tema não quebra;
- pronto para componentes UI.

---

## T17 — Componentes UI base I

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Criar componentes globais essenciais.

### Referências

- `docs/04_SCREEN_SPECS.md`, componentes globais obrigatórios

### Arquivos permitidos

- `src/components/ui/ScreenContainer.tsx`
- `src/components/ui/AppHeader.tsx`
- `src/components/ui/AppCard.tsx`
- `src/components/ui/AppButton.tsx`
- `src/components/ui/SectionTitle.tsx`
- `src/components/ui/index.ts`

### Prompt

```md
Crie apenas os componentes UI base:
- ScreenContainer;
- AppHeader;
- AppCard;
- AppButton;
- SectionTitle.

Regras:
- usar tokens existentes;
- mobile-first;
- safe area;
- não implementar telas;
- props tipadas;
- sem any.

Rode npm run typecheck.
```

### Critérios de aceitação

- componentes compilam;
- reutilizáveis;
- sem regra de negócio.

---

## T18 — Componentes UI base II

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Criar campos, estados e badges.

### Arquivos permitidos

- `src/components/ui/AppInput.tsx`
- `src/components/ui/AppTextArea.tsx`
- `src/components/ui/SearchInput.tsx`
- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/StepIndicator.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorState.tsx`
- `src/components/ui/LoadingState.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/ui/BottomActionBar.tsx`
- `src/components/ui/index.ts`

### Prompt

```md
Crie os componentes UI de formulário, status e estados globais.

Referência:
- docs/04_SCREEN_SPECS.md, seções Loading, Error, Empty e ConfirmDialog.

Regras:
- sem acesso a banco;
- sem navegação embutida;
- callbacks por props;
- tipagem forte;
- visual alinhado aos tokens.

Rode npm run typecheck.
```

### Critérios de aceitação

- loading/erro/vazio reutilizáveis;
- confirm dialog não permite confirmar duas vezes em loading;
- typecheck passa.

---

## T19 — Navegação base e gate de onboarding

**Modo sugerido:** `/plan` se rotas existentes forem desconhecidas  
**Raciocínio:** Medium

### Objetivo

Configurar Expo Router para enviar usuário novo ao onboarding e usuário configurado à Home.

### Referências

- `docs/03_USER_FLOW.md`, entrada do app e mapa de navegação
- `docs/04_SCREEN_SPECS.md`, mapa de rotas

### Arquivos permitidos

- `app/_layout.tsx`
- `app/onboarding/company.tsx`, placeholder mínimo se necessário
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`, placeholder mínimo se necessário
- `src/hooks/useCompanyProfile.ts`

### Prompt

```md
Configure a navegação base do OrdemPro.

Regras:
- usuário sem CompanyProfile vai para onboarding;
- usuário com CompanyProfile vai para tabs/Home;
- criar bottom tabs: Home, OS, Clientes, Equipamentos, Configurações;
- usar placeholders mínimos se telas ainda não existirem;
- não implementar telas completas;
- não alterar banco além do necessário.

Rode npm run typecheck.
```

### Critérios de aceitação

- app abre sem rota quebrada;
- onboarding gate funciona;
- tabs existem.

---

## T20 — Onboarding da empresa

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Implementar fluxo de onboarding com etapas internas.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 7.1 a 7.5
- imagens 01 a 05

### Arquivos permitidos

- `app/onboarding/company.tsx`
- `src/components/onboarding/**`
- `src/hooks/useCompanyProfile.ts`, se ajuste for necessário

### Prompt

```md
Implemente o onboarding da empresa em app/onboarding/company.tsx.

Referências:
- docs/04_SCREEN_SPECS.md, seções 7.1 a 7.5
- imagens 01 a 05 em assets/screenshots-reference

Regras:
- uma rota com etapas internas;
- obrigatórios: nome da empresa e telefone ou WhatsApp;
- termos padrão editáveis;
- logo opcional;
- salvar CompanyProfile ao concluir;
- redirecionar para Home;
- não criar OS;
- não implementar PDF ainda.

Rode npm run typecheck.
```

### Critérios de aceitação

- onboarding conclui;
- dados persistem;
- app não volta ao onboarding após reiniciar.

---

## T21 — Home

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Implementar Home operacional.

### Referências

- `docs/04_SCREEN_SPECS.md`, seção 8
- imagem `06_home.png`

### Arquivos permitidos

- `app/(tabs)/index.tsx`
- `src/components/home/**`
- hooks necessários já existentes

### Prompt

```md
Implemente somente a Home do OrdemPro.

Referência:
- docs/04_SCREEN_SPECS.md, seção 8
- assets/screenshots-reference/06_home.png

Regras:
- CTA principal Nova OS;
- cards de status;
- atalhos;
- OS recentes;
- alerta de backup antigo, se houver dado;
- estado vazio com Criar primeira OS;
- não implementar lista completa de OS aqui;
- não criar relatório financeiro avançado.

Rode npm run typecheck.
```

### Critérios de aceitação

- Home carrega dados locais;
- CTA Nova OS navega corretamente;
- empty state funciona.

---

## T22 — Lista de OS

**Modo sugerido:** execução direta  
**Raciocínio:** Low/Medium

### Objetivo

Implementar aba de ordens de serviço.

### Referências

- `docs/04_SCREEN_SPECS.md`, seção 9
- imagem `07_lista_os.png`

### Arquivos permitidos

- `app/(tabs)/orders.tsx`
- `src/components/orders/OrderCard.tsx`
- `src/components/orders/OrderFilters.tsx`

### Prompt

```md
Implemente somente a Lista de OS.

Regras:
- busca local;
- filtros por status;
- cards de OS;
- FAB/Nova OS;
- estado vazio;
- tocar em card abre detalhes;
- não editar OS diretamente na lista.

Rode npm run typecheck.
```

### Critérios de aceitação

- lista filtra sem alterar dados;
- navegação para detalhes;
- estado vazio correto.

---

## T23 — Clientes e novo cliente

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Implementar lista de clientes e cadastro de novo cliente.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 12 e 13
- imagens `14_clientes.png` e `15_novo_cliente.png`

### Arquivos permitidos

- `app/(tabs)/customers.tsx`
- `app/customers/new.tsx`
- `app/customers/[id].tsx`, placeholder detalhe se necessário
- `src/components/customers/**`

### Prompt

```md
Implemente Clientes e Novo Cliente.

Regras:
- lista com busca local;
- estado vazio;
- cadastro com PF/PJ;
- obrigatórios: nome e telefone ou WhatsApp;
- validação simples;
- sugerir duplicidade se viável;
- salvar no repository;
- se houver returnToOrder, preparar retorno sem quebrar fluxo.

Não implemente histórico completo ainda, salvo placeholder seguro.
Rode npm run typecheck.
```

### Critérios de aceitação

- cliente salvo aparece na lista;
- busca funciona;
- app não exige dados excessivos.

---

## T24 — Equipamentos e novo equipamento

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Implementar lista de equipamentos e cadastro.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 14 e 15
- imagens `16_equipamentos.png` e `17_novo_equipamento.png`

### Arquivos permitidos

- `app/(tabs)/equipments.tsx`
- `app/equipments/new.tsx`
- `app/equipments/[id].tsx`, placeholder detalhe se necessário
- `src/components/equipments/**`

### Prompt

```md
Implemente Equipamentos e Novo Equipamento.

Regras:
- equipamento sempre vinculado a cliente;
- lista com busca e filtro por categoria;
- estado vazio;
- cadastro com cliente, categoria/tipo, marca, modelo e série;
- obrigatórios: cliente e categoria ou descrição simples;
- não misturar equipamentos de clientes diferentes no fluxo de OS.

Rode npm run typecheck.
```

### Critérios de aceitação

- equipamento salvo aparece na lista;
- vínculo com cliente preservado;
- busca funciona.

---

## T25 — Catálogo de serviços e peças

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Implementar telas de catálogos auxiliares.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 16 e 17
- imagens `18_catalogo_servicos.png` e `19_catalogo_pecas.png`

### Arquivos permitidos

- `app/catalog/services.tsx`
- `app/catalog/parts.tsx`
- `src/components/catalog/**`

### Prompt

```md
Implemente Catálogo de Serviços e Catálogo de Peças.

Regras:
- CRUD básico;
- busca local;
- ativo/inativo;
- não implementar estoque;
- alterações no catálogo não alteram OS antigas;
- usar modal ou formulário simples.

Rode npm run typecheck.
```

### Critérios de aceitação

- serviço/peça cadastrado aparece no catálogo;
- pode inativar;
- sem controle de estoque.

---

## T26 — Nova OS — fluxo guiado

**Modo sugerido:** `/plan` recomendado  
**Raciocínio:** Medium/High

### Objetivo

Implementar criação de OS em etapas: cliente, equipamento, problema, itens e resumo.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 10.1 a 10.5
- imagens 08 a 12
- `docs/05_DATA_MODEL.md`, OrderDraft e ServiceOrder

### Arquivos permitidos

- `app/orders/new.tsx`
- `src/components/orders/**`
- `src/hooks/useOrderDraft.ts`, se necessário
- `src/hooks/useServiceOrders.ts`, se ajuste for necessário
- `src/services/orders/**`, se ajuste for necessário

### Prompt

```md
/plan
Planeje a implementação do fluxo Nova OS em app/orders/new.tsx com etapas internas.

Depois implemente somente esse fluxo.

Regras:
- etapas: cliente, equipamento, problema, itens, resumo;
- cliente obrigatório;
- equipamento opcional apenas se Serviço sem equipamento estiver ativo;
- problema/descrição obrigatório;
- itens opcionais, com alerta antes do PDF;
- salvar rascunho local;
- número sequencial ao salvar OS;
- total calculado em centavos;
- ao salvar, OS aparece na Home e na Lista de OS.

Não implemente PDF ainda.
Rode npm run typecheck.
```

### Critérios de aceitação

- OS pode ser criada;
- OS sem equipamento funciona quando marcado;
- rascunho recuperável;
- cálculos corretos.

---

## T27 — Detalhes da OS e status

**Modo sugerido:** execução direta ou `/plan` se houver muitos arquivos  
**Raciocínio:** Medium

### Objetivo

Implementar tela de detalhes da OS.

### Referências

- `docs/04_SCREEN_SPECS.md`, seção 11
- imagem `13_detalhes_os.png`

### Arquivos permitidos

- `app/orders/[id].tsx`
- `src/components/orders/**`
- `src/services/orders/orderStatusService.ts`, se ajuste necessário

### Prompt

```md
Implemente a tela Detalhes da OS.

Regras:
- mostrar número, status, cliente, equipamento, problema, itens, valores e ações;
- alterar status registra histórico;
- cancelar OS pede motivo;
- OS entregue exige confirmação para editar;
- PDF ausente/desatualizado deve aparecer como estado, mas geração real fica para tarefa futura;
- não implementar exclusão definitiva.

Rode npm run typecheck.
```

### Critérios de aceitação

- abrir OS por id;
- status muda e reflete na lista/Home;
- cancelamento mantém histórico.

---

## T28 — Configurações: empresa, PDF, backup e segurança

**Modo sugerido:** dividir se ficar grande  
**Raciocínio:** Medium

### Objetivo

Implementar telas de configuração sem prometer premium real.

### Referências

- `docs/04_SCREEN_SPECS.md`, seções 18 a 21
- imagens 20 a 23

### Arquivos permitidos

- `app/(tabs)/settings.tsx`
- `app/settings/company.tsx`
- `app/settings/pdf.tsx`
- `app/settings/backup.tsx`
- `app/settings/security.tsx`
- `src/components/settings/**`

### Prompt

```md
Implemente as telas de Configurações.

Regras:
- aba Settings lista: Empresa, PDF, Termos, Catálogos, Backup, Segurança, Sobre;
- Empresa edita CompanyProfile;
- PDF edita PdfSettings;
- Backup pode ficar com UI conectada a service se já existir ou placeholder claro;
- Segurança não deve prometer biometria ativa se não estiver implementada;
- não implementar premium real.

Rode npm run typecheck.
```

### Critérios de aceitação

- configurações salvam localmente;
- navegação funciona;
- sem promessas falsas.

---

## T29 — Backup export/import local

**Modo sugerido:** `/plan` recomendado  
**Raciocínio:** Medium/High

### Objetivo

Implementar exportação e importação manual de backup.

### Referências

- `docs/05_DATA_MODEL.md`, backup
- `docs/04_SCREEN_SPECS.md`, Configurações Backup

### Arquivos permitidos

- `src/repositories/backupRepository.ts`
- `src/services/backup/backupExportService.ts`
- `src/services/backup/backupImportService.ts`
- `src/hooks/useBackup.ts`
- `app/settings/backup.tsx`

### Prompt

```md
/plan
Planeje o backup manual offline do OrdemPro.

Depois implemente:
- exportar dados essenciais em JSON;
- incluir metadados de versão;
- atualizar lastBackupAt;
- importar validando versão;
- antes de importar, exigir confirmação;
- se arquivos/fotos/PDFs ainda não puderem entrar no backup, documentar limitação no código/UI.

Não implementar nuvem.
Não instalar dependência sem autorização.
Rode npm run typecheck.
```

### Critérios de aceitação

- exporta JSON válido;
- importa com validação;
- não apaga dados sem confirmação.

---

## T30 — Fotos e assinaturas

**Modo sugerido:** `/plan` se bibliotecas ausentes  
**Raciocínio:** Medium/High

### Objetivo

Implementar captura/seleção de fotos e assinatura local, se dependências do Expo estiverem disponíveis.

### Referências

- `docs/04_SCREEN_SPECS.md`, fotos e assinaturas
- `docs/05_DATA_MODEL.md`, media

### Arquivos permitidos

- `src/components/ui/PhotoPickerGrid.tsx`
- `src/components/ui/SignaturePadField.tsx`
- `src/services/media/fileStorageService.ts`
- `src/repositories/mediaRepository.ts`
- telas de OS necessárias

### Prompt

```md
Verifique primeiro se o projeto já possui dependências para imagem/assinatura.

Se possuir, implemente fotos e assinatura local.
Se não possuir, pare e informe exatamente quais dependências seriam necessárias e onde seriam usadas.

Regras:
- fotos por localUri;
- compressão se viável;
- assinatura por localUri;
- não salvar base64 no banco;
- não bloquear salvar OS sem foto/assinatura.

Rode npm run typecheck se implementar algo.
```

### Critérios de aceitação

- foto/assinatura são opcionais;
- referências persistem;
- sem base64 no SQLite.

---

## T31 — Template e geração de PDF

**Modo sugerido:** `/plan` obrigatório  
**Raciocínio:** High  
**Custo esperado:** médio/alto, mas crítico

### Objetivo

Gerar PDF profissional local da OS.

### Referências

- `docs/04_SCREEN_SPECS.md`, seção 30
- imagem `37_pdf_os_exemplo.png`
- `docs/05_DATA_MODEL.md`, ServiceOrderPdf

### Arquivos permitidos

- `app/orders/[id]/pdf.tsx`
- `src/services/pdf/pdfTemplate.ts`
- `src/services/pdf/pdfGeneratorService.ts`
- `src/repositories/pdfRepository.ts`
- `src/components/pdf/**`

### Prompt

```md
/plan
Planeje a geração de PDF local do OrdemPro.

Verifique dependências existentes para gerar PDF no Expo/React Native.
Se faltar dependência, pare e informe a recomendada antes de alterar package.json.

Depois implemente somente se já houver base viável.

Regras:
- PDF A4 profissional;
- cabeçalho com empresa/logo;
- dados do cliente;
- dados do equipamento;
- defeito/diagnóstico;
- tabela de serviços/peças;
- resumo financeiro;
- termos;
- fotos/assinaturas conforme PdfSettings;
- salvar ServiceOrderPdf com localUri, versão, geradoEm e isOutdated false;
- se OS for alterada depois, PDF deve ser marcado como desatualizado.

Rode npm run typecheck.
```

### Critérios de aceitação

- PDF gerado localmente;
- preview/ações disponíveis;
- respeita configurações;
- funciona offline após gerado.

---

## T32 — Compartilhamento de PDF

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Permitir compartilhar PDF por share sheet do sistema.

### Referências

- `docs/03_USER_FLOW.md`, fluxo de PDF
- `docs/04_SCREEN_SPECS.md`, PDF e erro offline

### Arquivos permitidos

- `app/orders/[id]/pdf.tsx`
- `src/services/pdf/pdfShareService.ts`
- `src/components/pdf/**`
- `src/components/ui/ErrorState.tsx`, se ajuste necessário

### Prompt

```md
Implemente compartilhamento de PDF pelo share sheet do sistema.

Regras:
- compartilhar apenas PDF existente;
- se não houver app compatível, mostrar mensagem clara;
- ausência de internet não bloqueia o app, apenas ações externas quando aplicável;
- se compartilhar falhar, manter PDF salvo localmente;
- não integrar WhatsApp Business API.

Rode npm run typecheck.
```

### Critérios de aceitação

- PDF pode ser compartilhado;
- falha não perde arquivo;
- sem integração fora do escopo.

---

## T33 — Busca global local

**Modo sugerido:** execução direta  
**Raciocínio:** Medium

### Objetivo

Implementar busca local por OS, cliente e equipamento.

### Referências

- `docs/03_USER_FLOW.md`, Busca global
- `docs/04_SCREEN_SPECS.md`, busca rápida

### Arquivos permitidos

- `src/services/search/localSearchService.ts`
- `src/hooks/useGlobalSearch.ts`
- `app/(tabs)/index.tsx`, se integrar busca rápida
- componentes necessários de busca

### Prompt

```md
Implemente busca global local offline.

Buscar por:
- número da OS;
- código curto;
- nome do cliente;
- telefone;
- CPF/CNPJ;
- marca/modelo/série;
- serviço/peça;
- status.

Regras:
- não usar internet;
- agrupar resultados por tipo;
- não alterar dados;
- Home usa busca rápida.

Rode npm run typecheck.
```

### Critérios de aceitação

- busca retorna resultados úteis;
- sem resultado mostra empty state;
- abre detalhes corretos.

---

## T34 — Auditoria de responsividade e tema

**Modo sugerido:** `/plan`  
**Raciocínio:** Medium/High

### Objetivo

Verificar se as telas implementadas funcionam em celular pequeno, tablet, tema claro e escuro.

### Referências

- `docs/04_SCREEN_SPECS.md`, regras de responsividade
- imagens de referência

### Arquivos permitidos

- apenas arquivos com problemas reais encontrados

### Prompt

```md
/plan
Audite responsividade e tema do app.

Verifique:
- celular pequeno;
- tablet;
- safe area;
- ScrollView em formulários longos;
- CTA não cortado;
- tema claro/escuro;
- cards e botões consistentes;
- informação duplicada.

Depois corrija apenas problemas reais.
Não mude design sem necessidade.
Rode npm run typecheck.
```

### Critérios de aceitação

- problemas listados;
- correções pequenas;
- sem refatoração ampla.

---

## T35 — Auditoria final antes de build

**Modo sugerido:** `/plan`  
**Raciocínio:** High  
**Custo esperado:** médio/alto, usar só no final

### Objetivo

Auditar o app completo antes do build.

### Referências

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`

### Arquivos permitidos

- somente arquivos com bugs reais encontrados

### Prompt

```md
/plan
Faça auditoria final do OrdemPro antes da build.

Verifique:
1. rotas quebradas;
2. imports quebrados;
3. componentes duplicados;
4. telas acessando SQLite diretamente;
5. lógica espalhada;
6. inconsistências com blueprint;
7. fluxo offline-first;
8. PDF;
9. backup;
10. tema claro/escuro;
11. responsividade;
12. typecheck.

Depois corrija apenas bugs reais.
Não implemente recursos novos.
Não refatore design sem necessidade.
Rode npm run typecheck e, se existir, npm run lint.
```

### Critérios de aceitação

- relatório final;
- typecheck passa ou erros externos claramente documentados;
- app pronto para tentativa de build.

---

## 7. Ordem recomendada de execução econômica

Para reduzir créditos e retrabalho, executar nesta ordem:

```txt
T00 Auditoria inicial
T01 AGENTS + typecheck
T02 Estrutura de pastas
T03 Tipos comuns
T04 Empresa/PDF/Termos
T05 Cliente/Equipamento
T06 OS/Catálogo/Pagamento/Mídia/Backup
T07 Utilitários
T08 Cálculos
T09 SQLite schema
T10 Repositories empresa/settings
T11 Repositories clientes/equipamentos
T12 Repositories catálogo
T13 Repositories OS/pagamentos/status
T14 Repositories mídia/PDF metadata
T15 Hooks
T16 Tokens/tema
T17 UI base I
T18 UI base II
T19 Navegação/gate onboarding
T20 Onboarding
T21 Home
T22 Lista OS
T23 Clientes
T24 Equipamentos
T25 Catálogos
T26 Nova OS
T27 Detalhes OS
T28 Configurações
T29 Backup
T30 Fotos/assinaturas
T31 PDF
T32 Compartilhamento
T33 Busca global
T34 Responsividade/tema
T35 Auditoria final
```

---

## 8. Tarefas que devem ser evitadas

Não enviar ao Codex:

```txt
Implemente todo o app OrdemPro.
Faça todas as telas baseado nas imagens.
Leia todos os documentos e corrija tudo.
Refatore o projeto inteiro.
Adicione premium, ads, PDF, banco e telas de uma vez.
```

Esses prompts tendem a:

- consumir mais créditos;
- gerar mudanças grandes;
- aumentar erros de importação;
- quebrar navegação;
- criar componentes duplicados;
- dificultar revisão.

---

## 9. Regras de parada obrigatória

O Codex deve parar e pedir autorização quando:

- precisar instalar dependência;
- precisar alterar `package.json` fora de script simples;
- encontrar conflito entre documentos;
- precisar alterar mais de 8 arquivos em uma tarefa que não é auditoria;
- o typecheck revelar erro antigo fora do escopo;
- a tarefa depender de chave, API, serviço externo ou conta;
- a implementação exigida fugir da V1;
- a tarefa precisar de internet para funcionar no fluxo principal.

---

## 10. Checklist antes de iniciar cada tarefa

```txt
[ ] A tarefa tem objetivo em 1 frase?
[ ] Os arquivos permitidos estão definidos?
[ ] Os arquivos proibidos estão definidos?
[ ] A referência documental é mínima?
[ ] O critério de aceitação está claro?
[ ] O nível de raciocínio está adequado?
[ ] A tarefa cabe em poucas alterações?
[ ] Há comando de verificação?
[ ] Existe regra de parada?
```

Se algum item estiver ausente, corrigir a tarefa antes de enviar ao Codex.

---

## 11. Checklist de aceite do documento 06

Este documento está completo quando:

- contém protocolo de baixo consumo de créditos;
- divide o app em tarefas pequenas;
- cada tarefa tem escopo claro;
- cada tarefa indica referências mínimas;
- cada tarefa limita arquivos permitidos;
- cada tarefa define critérios de aceitação;
- inclui `AGENTS.md` reutilizável;
- evita implementação em massa;
- respeita Blueprint, User Flow, Screen Specs e Data Model;
- prepara Codex para executar uma etapa por vez.

---

## 12. Próxima etapa recomendada

Criar:

```txt
docs/07_RELEASE_CHECKLIST.md
```

Mas antes de iniciar publicação, a implementação deve seguir o `06_CODEX_TASKS.md` em ciclos curtos, começando por:

```txt
T00 → T01 → T02
```
