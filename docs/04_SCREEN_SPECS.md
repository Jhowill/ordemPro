# 04_SCREEN_SPECS — OrdemPro

**Arquivo:** `docs/04_SCREEN_SPECS.md`  
**App:** OrdemPro  
**Stack prevista:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Modo:** Offline-first  
**Objetivo:** transformar as imagens de referência em especificações técnicas para implementação controlada no Codex.

---

## 1. Premissas de implementação

Este documento deve ser usado junto com:

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`, quando existir no projeto
- `docs/03_USER_FLOW.md`
- imagens em `assets/screenshots-reference/`

As imagens definem direção visual, hierarquia, densidade e composição. A especificação abaixo define comportamento, estados, regras de dados, ações e critérios de aceitação.

### 1.1. Regra de prioridade

Se houver conflito entre imagem e especificação:

1. `PROJECT_GUIDE.md`
2. `docs/04_SCREEN_SPECS.md`
3. `docs/03_USER_FLOW.md`
4. `docs/01_APP_BLUEPRINT.md`
5. imagem de referência

### 1.2. Regra para Codex

O Codex deve implementar uma tela ou um componente sistêmico por tarefa. Não deve implementar todo o app em uma única missão.

---

## 2. Direção visual consolidada

A direção visual das imagens aprovadas é:

- visual empresarial, técnico e profissional;
- base clara com azul como cor principal;
- cards brancos com borda suave e sombra discreta;
- botões primários azuis, com bordas arredondadas;
- tipografia limpa, legível e sem excesso decorativo;
- formulários com campos compactos, mas confortáveis;
- bottom tab simples com cinco áreas principais;
- prioridade para uso em celular pequeno;
- tablet deve funcionar sem esticar excessivamente os formulários.

### 2.1. Tokens visuais sugeridos

> Ajustar os valores finais conforme `docs/02_DESIGN_SYSTEM.md` quando ele estiver no projeto.

```ts
export const colors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3FA',
  primary: '#0B63F6',
  primaryDark: '#063A8C',
  secondary: '#183B66',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#D8E0EA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#2563EB',
};
```

### 2.2. Componentes globais obrigatórios

Criar ou reutilizar em `src/components/ui/`:

- `ScreenContainer`
- `AppHeader`
- `AppCard`
- `AppButton`
- `AppInput`
- `AppTextArea`
- `SearchInput`
- `StatusBadge`
- `StepIndicator`
- `SectionTitle`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `ConfirmDialog`
- `BottomActionBar`
- `MoneyInput`
- `SelectField`
- `ToggleRow`
- `PhotoPickerGrid`
- `SignaturePadField`

Criar componentes por domínio quando o padrão aparecer em telas específicas:

```txt
src/components/onboarding/
src/components/home/
src/components/orders/
src/components/customers/
src/components/equipments/
src/components/catalog/
src/components/settings/
src/components/pdf/
```

---

## 3. Mapa de rotas sugerido

```txt
app/_layout.tsx
app/onboarding/company.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx
app/(tabs)/orders.tsx
app/(tabs)/customers.tsx
app/(tabs)/equipments.tsx
app/(tabs)/settings.tsx
app/orders/new.tsx
app/orders/[id].tsx
app/orders/[id]/pdf.tsx
app/customers/new.tsx
app/customers/[id].tsx
app/equipments/new.tsx
app/equipments/[id].tsx
app/catalog/services.tsx
app/catalog/parts.tsx
app/settings/company.tsx
app/settings/pdf.tsx
app/settings/backup.tsx
app/settings/security.tsx
```

### 3.1. Observação sobre fluxos guiados

As telas de onboarding e nova OS podem ser implementadas em uma única rota com estado interno de etapa. Isso reduz navegação desnecessária e facilita salvar rascunho local.

- Onboarding: `app/onboarding/company.tsx`
- Nova OS: `app/orders/new.tsx`

---

## 4. Entidades de dados previstas

As telas devem se preparar para usar modelos definidos posteriormente no `docs/05_DATA_MODEL.md`.

```txt
CompanyProfile
PdfSettings
DefaultTerms
Customer
Equipment
ServiceOrder
ServiceOrderItem
ServiceCatalogItem
PartCatalogItem
Payment
PhotoAttachment
SignatureRecord
ServiceOrderPdf
BackupMetadata
AppSettings
```

### 4.1. Regra de acesso a dados

Telas não devem acessar SQLite diretamente. Usar hooks e services:

```txt
hooks → services/storage → SQLite
```

Exemplos:

- `useCompanyProfile()`
- `useCustomers()`
- `useEquipments()`
- `useServiceOrders()`
- `useOrderDraft()`
- `usePdfGenerator()`
- `useBackup()`

---

## 5. Estados globais

Todas as telas de dados devem prever:

- `loading`: leitura local, geração de PDF, exportação de backup;
- `empty`: ausência de registros;
- `error`: falha de leitura/escrita local;
- `offline`: somente para ações externas que dependem de internet;
- `saving`: salvar formulário ou rascunho;
- `success`: confirmação de operação concluída;
- `dirty`: há alterações não salvas.

---

## 6. Matriz de cobertura visual

| Nº | Imagem | Tela/estado | Rota/componente |
|---:|---|---|---|
| 01 | `01_onboarding_boas_vindas.png` | Onboarding — Boas-vindas | `app/onboarding/company.tsx` |
| 02 | `02_onboarding_empresa_dados.png` | Onboarding — Dados da empresa | `app/onboarding/company.tsx` |
| 03 | `03_onboarding_empresa_endereco_logo.png` | Onboarding — Endereço e logo | `app/onboarding/company.tsx` |
| 04 | `04_onboarding_empresa_termos.png` | Onboarding — Termos padrão | `app/onboarding/company.tsx` |
| 05 | `05_onboarding_conclusao.png` | Onboarding — Conclusão | `app/onboarding/company.tsx` |
| 06 | `06_home.png` | Home | `app/(tabs)/index.tsx` |
| 07 | `07_lista_os.png` | Lista de OS | `app/(tabs)/orders.tsx` |
| 08 | `08_nova_os_cliente.png` | Nova OS — Cliente | `app/orders/new.tsx` |
| 09 | `09_nova_os_equipamento.png` | Nova OS — Equipamento | `app/orders/new.tsx` |
| 10 | `10_nova_os_problema.png` | Nova OS — Problema | `app/orders/new.tsx` |
| 11 | `11_nova_os_detalhes_itens.png` | Nova OS — Detalhes/itens | `app/orders/new.tsx` |
| 12 | `12_nova_os_resumo.png` | Nova OS — Resumo | `app/orders/new.tsx` |
| 13 | `13_detalhes_os.png` | Detalhes da OS | `app/orders/[id].tsx` |
| 14 | `14_clientes.png` | Clientes | `app/(tabs)/customers.tsx` |
| 15 | `15_novo_cliente.png` | Novo cliente | `app/customers/new.tsx` |
| 16 | `16_equipamentos.png` | Equipamentos | `app/(tabs)/equipments.tsx` |
| 17 | `17_novo_equipamento.png` | Novo equipamento | `app/equipments/new.tsx` |
| 18 | `18_catalogo_servicos.png` | Catálogo de serviços | `app/catalog/services.tsx` |
| 19 | `19_catalogo_pecas.png` | Catálogo de peças | `app/catalog/parts.tsx` |
| 20 | `20_configuracoes_empresa.png` | Configurações — Empresa | `app/settings/company.tsx` |
| 21 | `21_configuracoes_pdf.png` | Configurações — PDF | `app/settings/pdf.tsx` |
| 22 | `22_configuracoes_backup.png` | Configurações — Backup | `app/settings/backup.tsx` |
| 23 | `23_configuracoes_seguranca.png` | Configurações — Segurança | `app/settings/security.tsx` |
| 24 | `24_loading_inicial.png` | Loading inicial | `src/components/ui/LoadingState.tsx` |
| 25 | `25_loading_entre_telas.png` | Loading entre telas | `src/components/ui/LoadingState.tsx` |
| 26 | `26_erro_offline.png` | Erro offline | `src/components/ui/ErrorState.tsx` |
| 27 | `27_erro_generico.png` | Erro genérico | `src/components/ui/ErrorState.tsx` |
| 28 | `28_empty_state_os.png` | Empty OS | `src/components/ui/EmptyState.tsx` |
| 29 | `29_empty_state_clientes.png` | Empty clientes | `src/components/ui/EmptyState.tsx` |
| 30 | `30_empty_state_equipamentos.png` | Empty equipamentos | `src/components/ui/EmptyState.tsx` |
| 31 | `31_confirmacao_acao.png` | Confirmação | `src/components/ui/ConfirmDialog.tsx` |
| 37 | `37_pdf_os_exemplo.png` | PDF da OS | `app/orders/[id]/pdf.tsx` + template HTML |

---

## 7.1. Screen Spec — Onboarding — Boas-vindas

### Imagem de referência

`assets/screenshots-reference/01_onboarding_boas_vindas.png`

### Rota

`app/onboarding/company.tsx — etapa `welcome``

### Objetivo

Apresentar o OrdemPro, explicar rapidamente o valor do app e iniciar a configuração da empresa.

### Componentes necessários

- ScreenContainer
- AppLogo/BrandMark
- AppButton
- FeatureBullet
- StepDots

### Dados necessários

- nenhum dado obrigatório
- estado local `currentStep`

### Ações do usuário

- tocar em `Começar` → avançar para etapa `companyData`
- tocar em dots, se habilitado → navegar entre etapas já visitadas

### Estados

- inicial: primeira abertura sem CompanyProfile
- loading: verificação inicial do banco
- erro: falha ao carregar status de onboarding

### Regras visuais

- logo centralizado
- título forte
- três benefícios curtos
- CTA principal no rodapé seguro
- não usar textos longos

### Regras funcionais

- se CompanyProfile existir, redirecionar para Home
- não solicitar login
- não depender de internet
- não salvar dados nesta etapa

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- redireciona corretamente para Home quando onboarding já foi concluído

---


## 7.2. Screen Spec — Onboarding — Dados da empresa

### Imagem de referência

`assets/screenshots-reference/02_onboarding_empresa_dados.png`

### Rota

`app/onboarding/company.tsx — etapa `companyData``

### Objetivo

Coletar os dados principais da empresa que serão usados no cabeçalho do PDF e na identificação do app.

### Componentes necessários

- AppHeader
- StepIndicator
- AppInput
- DocumentInput
- PhoneInput
- AppButton
- BottomActionBar

### Dados necessários

- CompanyProfile.name
- CompanyProfile.tradeName
- CompanyProfile.document
- CompanyProfile.responsibleName
- CompanyProfile.phone
- CompanyProfile.whatsapp
- CompanyProfile.email

### Ações do usuário

- tocar em `Voltar` → retornar para boas-vindas
- tocar em `Próximo` → validar obrigatórios e avançar para endereço/logo
- editar campo → marcar formulário como `dirty`

### Estados

- empty/inicial: campos vazios
- invalid: nome da empresa ausente
- invalid: telefone e WhatsApp ausentes
- saving draft: salvar parcialmente em memória/local
- erro: falha ao persistir rascunho

### Regras visuais

- formulário claro com labels acima dos campos
- usar teclado correto para telefone, documento e e-mail
- evitar poluir com todos os campos administrativos
- CTA azul evidente

### Regras funcionais

- obrigatórios: nome da empresa e telefone ou WhatsApp
- validar e-mail somente se preenchido
- permitir CPF ou CNPJ no mesmo campo
- não exigir CNPJ para técnicos autônomos

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- mostra mensagem objetiva quando dados obrigatórios não forem preenchidos

---


## 7.3. Screen Spec — Onboarding — Endereço e logo

### Imagem de referência

`assets/screenshots-reference/03_onboarding_empresa_endereco_logo.png`

### Rota

`app/onboarding/company.tsx — etapa `addressLogo``

### Objetivo

Adicionar logo e endereço da empresa para deixar o PDF profissional, sem tornar a etapa obrigatória.

### Componentes necessários

- AppHeader
- StepIndicator
- LogoPicker
- AppInput
- CepInput
- StateSelect
- AppButton
- BottomActionBar

### Dados necessários

- CompanyProfile.logoUri
- CompanyProfile.address
- CompanyProfile.number
- CompanyProfile.neighborhood
- CompanyProfile.city
- CompanyProfile.state
- CompanyProfile.zipCode

### Ações do usuário

- tocar em card da logo → abrir seletor de imagem
- tocar em remover logo → limpar `logoUri`
- tocar em `Voltar` → etapa dados
- tocar em `Próximo` → avançar para termos

### Estados

- sem logo: mostrar placeholder
- permissão negada: orientar usuário
- imagem inválida: mostrar erro
- saving: compactar/copiar imagem local
- erro: falha ao salvar logo

### Regras visuais

- logo dentro de card branco
- campos de endereço agrupados
- cidade/estado/CEP em layout responsivo
- não forçar imagem grande

### Regras funcionais

- nenhum campo obrigatório
- copiar logo para diretório controlado pelo app
- comprimir imagem se necessário
- não depender de API de CEP na V1 offline

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- onboarding pode seguir sem endereço e sem logo

---


## 7.4. Screen Spec — Onboarding — Termos padrão

### Imagem de referência

`assets/screenshots-reference/04_onboarding_empresa_termos.png`

### Rota

`app/onboarding/company.tsx — etapa `defaultTerms``

### Objetivo

Configurar textos padrão que serão reutilizados nas OS e no PDF, permitindo pular e editar depois.

### Componentes necessários

- AppHeader
- StepIndicator
- ToggleRow
- ExpandableTextArea
- AppButton
- BottomActionBar

### Dados necessários

- DefaultTerms.warranty
- DefaultTerms.serviceAuthorization
- DefaultTerms.withdrawal
- DefaultTerms.dataResponsibility
- DefaultTerms.unclaimedEquipment

### Ações do usuário

- ativar/desativar termo → alternar exibição no PDF
- tocar em termo → expandir editor
- tocar em `Voltar` → endereço/logo
- tocar em `Próximo` → salvar e avançar conclusão

### Estados

- padrão: termos pré-preenchidos
- editando: text area expandido
- erro: falha ao salvar termos
- sucesso: termos salvos

### Regras visuais

- usar cards compactos
- toggles alinhados à direita
- textos longos recolhidos
- não colocar termos completos abertos na primeira visualização

### Regras funcionais

- criar textos padrão editáveis
- permitir termos vazios
- não bloquear onboarding por termo não preenchido
- usar estes termos como padrão em novas OS

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- usuário consegue concluir onboarding mesmo sem revisar todos os termos

---


## 7.5. Screen Spec — Onboarding — Conclusão

### Imagem de referência

`assets/screenshots-reference/05_onboarding_conclusao.png`

### Rota

`app/onboarding/company.tsx — etapa `done``

### Objetivo

Confirmar que a empresa foi configurada e levar o usuário para a Home.

### Componentes necessários

- SuccessIcon
- AppCard
- CompanySummaryCard
- AppButton
- SecondaryAction

### Dados necessários

- CompanyProfile.name
- CompanyProfile.document
- CompanyProfile.phone
- CompanyProfile.whatsapp

### Ações do usuário

- tocar em `Ir para a Home` → salvar CompanyProfile final e navegar para `/(tabs)`
- tocar em `Editar dados` → voltar para etapa dados da empresa

### Estados

- saving: persistindo CompanyProfile
- success: empresa configurada
- erro: falha ao salvar CompanyProfile

### Regras visuais

- ícone de sucesso central
- card de resumo com poucos dados
- CTA no rodapé
- visual limpo e sem formulários

### Regras funcionais

- marcar onboarding como concluído apenas após salvar dados obrigatórios
- enviar para Home após sucesso
- não gerar OS nem PDF automaticamente

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- após reiniciar o app, usuário não volta para onboarding se CompanyProfile existir

---


## 8. Screen Spec — Home

### Imagem de referência

`assets/screenshots-reference/06_home.png`

### Rota

`app/(tabs)/index.tsx`

### Objetivo

Mostrar visão operacional resumida e permitir iniciar uma nova OS rapidamente.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- PrimaryActionCard
- ShortcutGrid
- StatusSummaryGrid
- RecentOrderCard
- BackupAlert
- BottomTabBar

### Dados necessários

- CompanyProfile
- ServiceOrder[] recentes
- contadores por status
- BackupMetadata.lastBackupAt

### Ações do usuário

- tocar em `Nova OS` → navegar para `/orders/new`
- tocar em busca → pesquisar OS/cliente/equipamento
- tocar em card de status → abrir `/orders` filtrado
- tocar em OS recente → abrir `/orders/[id]`
- tocar em atalho Clientes/Equipamentos/Serviços/Peças → navegar para rota correspondente
- tocar em alerta de backup → abrir `/settings/backup`

### Estados

- loading: carregando dados locais
- empty: nenhuma OS criada
- com dados: mostrar indicadores e recentes
- erro: falha de leitura local
- backup antigo: mostrar alerta discreto

### Regras visuais

- topo escuro/azul forte
- CTA `Nova OS` como ação mais evidente
- cards de atalhos em grid
- cards de status com números grandes
- lista de recentes curta

### Regras funcionais

- limitar OS recentes a 3–5 itens
- não mostrar dashboard financeiro avançado na V1
- busca deve aceitar número da OS, cliente, telefone e equipamento
- dados devem vir do SQLite local

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- Home não fica vazia visualmente no primeiro uso; mostra CTA para primeira OS

---


## 9. Screen Spec — Lista de OS

### Imagem de referência

`assets/screenshots-reference/07_lista_os.png`

### Rota

`app/(tabs)/orders.tsx`

### Objetivo

Listar, filtrar, buscar e abrir ordens de serviço.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- FilterChips
- OrderCard
- StatusBadge
- FloatingActionButton
- EmptyState
- BottomTabBar

### Dados necessários

- ServiceOrder[]
- Customer resumo
- Equipment resumo
- filtro atual
- query de busca

### Ações do usuário

- tocar em `+` ou `Nova OS` → `/orders/new`
- tocar em filtro → atualizar lista
- digitar busca → filtrar localmente
- tocar em card de OS → `/orders/[id]`
- puxar para atualizar → reler SQLite local

### Estados

- loading
- empty sem OS
- empty busca sem resultado
- erro de leitura
- lista com filtros

### Regras visuais

- cards com faixa/status colorido
- número da OS destacado
- cliente e equipamento abaixo
- valor e data discretos
- FAB azul no canto inferior

### Regras funcionais

- filtros mínimos: Todas, Abertas, Em andamento, Aguardando aprovação, Concluídas
- não editar OS diretamente na lista
- ordenar por atualização/abertura mais recente
- canceladas devem aparecer apenas no filtro apropriado ou busca

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- filtro por status não altera dados, apenas visualização

---


## 10.1. Screen Spec — Nova OS — Cliente

### Imagem de referência

`assets/screenshots-reference/08_nova_os_cliente.png`

### Rota

`app/orders/new.tsx — etapa `customer``

### Objetivo

Selecionar cliente existente ou criar cliente rápido sem sair do fluxo de OS.

### Componentes necessários

- AppHeader
- StepIndicator
- SearchInput
- SelectedCustomerCard
- AppButton
- InlineCreateCustomerForm
- BottomActionBar

### Dados necessários

- OrderDraft.customerId
- Customer[]
- campos rápidos: nome, telefone/WhatsApp, documento opcional

### Ações do usuário

- buscar cliente → filtrar lista
- tocar em cliente → selecionar
- tocar em `Novo cliente` → abrir formulário rápido ou `/customers/new?returnToOrder=true`
- tocar em `Avançar` → validar cliente e ir para equipamento

### Estados

- sem clientes: mostrar botão Novo cliente
- busca sem resultado: oferecer criar novo
- cliente selecionado
- erro ao salvar cliente rápido
- draft recuperado

### Regras visuais

- stepper no topo
- campo de busca primeiro
- cliente selecionado em card com destaque
- CTA `Avançar` fixo

### Regras funcionais

- obrigatório ter Customer antes de avançar
- cliente rápido exige nome e telefone ou WhatsApp
- salvar rascunho ao selecionar cliente
- detectar possível duplicidade por telefone/documento

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- não obriga preencher cadastro completo dentro da OS

---


## 10.2. Screen Spec — Nova OS — Equipamento

### Imagem de referência

`assets/screenshots-reference/09_nova_os_equipamento.png`

### Rota

`app/orders/new.tsx — etapa `equipment``

### Objetivo

Selecionar equipamento do cliente, criar equipamento rápido ou marcar serviço sem equipamento.

### Componentes necessários

- AppHeader
- StepIndicator
- SearchInput
- EquipmentCard
- SelectedEquipmentCard
- InlineCreateEquipmentForm
- Checkbox/Toggle
- BottomActionBar

### Dados necessários

- OrderDraft.customerId
- OrderDraft.equipmentId
- OrderDraft.isServiceWithoutEquipment
- Equipment[] do cliente

### Ações do usuário

- buscar equipamento → filtrar
- tocar em equipamento → selecionar
- tocar em `Novo equipamento` → criar rápido
- ativar `Serviço sem equipamento` → limpar equipmentId
- tocar em `Avançar` → ir para problema

### Estados

- cliente sem equipamento
- sem equipamento selecionado
- serviço sem equipamento
- equipamento selecionado
- erro ao salvar equipamento rápido

### Regras visuais

- mostrar nome do cliente como contexto
- cards compactos com marca/modelo/série
- opção sem equipamento visível, mas secundária
- CTA no rodapé

### Regras funcionais

- equipamento deve pertencer ao cliente selecionado
- permitir avançar sem equipamento apenas se `Serviço sem equipamento` ativo
- equipamento rápido exige categoria ou descrição simples
- não misturar equipamentos de outros clientes

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- OS sem equipamento funciona para visita técnica, instalação ou serviço geral

---


## 10.3. Screen Spec — Nova OS — Problema

### Imagem de referência

`assets/screenshots-reference/10_nova_os_problema.png`

### Rota

`app/orders/new.tsx — etapa `problem``

### Objetivo

Registrar defeito relatado ou descrição do serviço solicitado.

### Componentes necessários

- AppHeader
- StepIndicator
- AppTextArea
- SelectField
- DatePickerField
- ToggleRow
- BottomActionBar

### Dados necessários

- OrderDraft.reportedIssue
- OrderDraft.initialNotes
- OrderDraft.priority
- OrderDraft.expectedCompletionAt
- flags: queda, líquido, intermitente, tentativaReparo

### Ações do usuário

- preencher defeito/descrição
- selecionar prioridade
- informar previsão
- tocar em `Avançar` → validar e ir para itens
- tocar em `Voltar` → retornar equipamento

### Estados

- campo obrigatório vazio
- rascunho salvo
- erro ao salvar rascunho
- sucesso ao avançar

### Regras visuais

- textarea principal maior
- campos complementares abaixo
- não exibir excesso de perguntas se tela ficar pesada
- stepper sempre visível

### Regras funcionais

- obrigatório defeito relatado ou descrição do serviço
- salvar rascunho local após preencher dado mínimo
- prioridade padrão: Normal
- status inicial padrão: Aberta

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- ao fechar e reabrir, rascunho pode ser recuperado

---


## 10.4. Screen Spec — Nova OS — Detalhes/itens

### Imagem de referência

`assets/screenshots-reference/11_nova_os_detalhes_itens.png`

### Rota

`app/orders/new.tsx — etapa `items``

### Objetivo

Adicionar diagnóstico, serviços, peças, quantidades, valores e descontos.

### Componentes necessários

- AppHeader
- StepIndicator
- AppTextArea
- OrderItemCard
- AddItemButton
- MoneyInput
- QuantityInput
- BottomActionBar

### Dados necessários

- OrderDraft.diagnosis
- OrderDraft.serviceDescription
- ServiceOrderItem[]
- ServiceCatalogItem[]
- PartCatalogItem[]

### Ações do usuário

- tocar em `Adicionar serviço` → abrir seletor/manual
- tocar em `Adicionar peça` → abrir seletor/manual
- editar item → recalcular total
- remover item → confirmar
- tocar em `Avançar` → ir para resumo/valores

### Estados

- sem itens: permitir continuar, mas alertar
- item inválido: quantidade/valor negativo
- catálogo vazio
- erro ao salvar item
- lista com itens

### Regras visuais

- usar cards, não tabela larga
- mostrar descrição, quantidade, valor unitário e total
- total parcial destacado
- botão de adicionar item discreto, mas claro

### Regras funcionais

- total do item = quantidade × valor unitário - desconto
- permitir item com valor zero
- copiar dados do catálogo para a OS; alterações futuras no catálogo não mudam OS antiga
- não implementar estoque completo na V1

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- cálculos não geram valor negativo

---


## 10.5. Screen Spec — Nova OS — Resumo/Revisão

### Imagem de referência

`assets/screenshots-reference/12_nova_os_resumo.png`

### Rota

`app/orders/new.tsx — etapa `review``

### Objetivo

Revisar dados principais, valores, garantia, status e salvar/gerar PDF.

### Componentes necessários

- AppHeader
- StepIndicator
- SummarySection
- FinancialSummaryCard
- StatusBadge
- AppButton
- SecondaryAction
- BottomActionBar

### Dados necessários

- OrderDraft completo
- Customer resumo
- Equipment resumo opcional
- ServiceOrderItem[]
- CompanyProfile
- PdfSettings

### Ações do usuário

- tocar em seção → voltar para etapa correspondente
- tocar em `Salvar OS` → criar ServiceOrder
- tocar em `Gerar PDF` → salvar OS e abrir preview
- tocar em `Finalizar depois` → salvar rascunho/OS

### Estados

- faltam dados mínimos
- sem itens
- salvando
- erro ao salvar
- PDF indisponível por empresa não configurada
- sucesso

### Regras visuais

- resumo em blocos curtos
- total destacado
- status em badge
- CTA principal claro
- ações secundárias sem competir com CTA

### Regras funcionais

- validar empresa, cliente e descrição mínima antes do PDF
- salvar ServiceOrder antes de gerar PDF
- se não houver itens, permitir salvar mas pedir confirmação antes do PDF final
- gerar número sequencial único

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- ao salvar, a OS aparece imediatamente na lista e na Home

---


## 11. Screen Spec — Detalhes da OS

### Imagem de referência

`assets/screenshots-reference/13_detalhes_os.png`

### Rota

`app/orders/[id].tsx`

### Objetivo

Controlar uma OS específica: status, dados técnicos, itens, fotos, assinaturas, pagamento, PDF e histórico.

### Componentes necessários

- ScreenContainer
- AppHeader
- StatusBadge
- SegmentedTabs
- InfoSection
- CustomerMiniCard
- EquipmentMiniCard
- OrderItemList
- FinancialSummaryCard
- PhotoGrid
- SignatureSummary
- PdfActionCard
- BottomActionBar

### Dados necessários

- ServiceOrder
- Customer
- Equipment opcional
- ServiceOrderItem[]
- Payment[]
- PhotoAttachment[]
- SignatureRecord[]
- ServiceOrderPdf[]

### Ações do usuário

- tocar em status → abrir seletor de status
- tocar em editar → abrir modo/rota de edição
- tocar em adicionar item/foto/assinatura/pagamento → abrir modal/rota
- tocar em `Gerar PDF` → `/orders/[id]/pdf`
- tocar em compartilhar → share sheet
- tocar em cancelar OS → confirmar motivo

### Estados

- loading
- erro OS não encontrada
- PDF ausente
- PDF gerado
- PDF desatualizado
- OS cancelada
- OS entregue com edição bloqueada/confirmada

### Regras visuais

- cabeçalho compacto com número da OS
- status e prioridade no topo
- usar abas ou seções recolhíveis
- CTA principal muda conforme status
- evitar tela interminável com todos os campos abertos

### Regras funcionais

- alteração de status registra data/hora
- OS entregue exige confirmação para editar
- OS cancelada mantém histórico
- se editar OS após PDF, marcar PDF como desatualizado
- não excluir OS por padrão; preferir cancelar

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- status atualizado reflete na Home e na Lista de OS

---


## 12. Screen Spec — Clientes

### Imagem de referência

`assets/screenshots-reference/14_clientes.png`

### Rota

`app/(tabs)/customers.tsx`

### Objetivo

Listar, buscar e iniciar ações relacionadas a clientes.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- CustomerCard
- FloatingActionButton
- EmptyState
- BottomTabBar

### Dados necessários

- Customer[]
- contadores de OS por cliente
- último atendimento opcional
- query de busca

### Ações do usuário

- tocar em `+` → `/customers/new`
- buscar → filtrar por nome, telefone, documento ou e-mail
- tocar em cliente → `/customers/[id]`
- tocar em criar OS no card, se existir → `/orders/new?customerId=...`

### Estados

- sem clientes
- busca sem resultado
- loading
- erro de leitura
- lista com clientes

### Regras visuais

- cards simples com nome e telefone
- usar ícone/avatar discreto
- FAB azul
- bottom tab visível

### Regras funcionais

- não apagar cliente com OS vinculada sem confirmação forte
- inativação preferível à exclusão
- busca local offline
- ordenar por nome ou atualização recente

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- estado vazio oferece CTA `Cadastrar cliente`

---


## 13. Screen Spec — Novo cliente

### Imagem de referência

`assets/screenshots-reference/15_novo_cliente.png`

### Rota

`app/customers/new.tsx`

### Objetivo

Cadastrar cliente completo, com campos principais e complementares.

### Componentes necessários

- ScreenContainer
- AppHeader
- SegmentedControl PF/PJ
- AppInput
- PhoneInput
- DocumentInput
- AddressSection
- NotesField
- BottomActionBar

### Dados necessários

- Customer.type
- Customer.name/legalName
- Customer.document
- Customer.phone
- Customer.whatsapp
- Customer.email
- Customer.address fields
- Customer.notes
- Customer.status

### Ações do usuário

- selecionar PF/PJ
- preencher dados
- tocar em `Salvar cliente` → validar e persistir
- voltar com alterações → confirmar saída

### Estados

- novo vazio
- invalid: nome ausente
- invalid: telefone/WhatsApp ausente
- duplicidade provável
- saving
- erro ao salvar
- sucesso

### Regras visuais

- seções em cards
- campos essenciais primeiro
- endereço em seção inferior
- CTA fixo

### Regras funcionais

- obrigatórios: nome e telefone ou WhatsApp
- validar documento somente se preenchido
- sugerir duplicidade por telefone/documento
- se veio de Nova OS, retornar ao fluxo com cliente selecionado

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- cliente salvo aparece em Clientes e pode ser usado em Nova OS

---


## 14. Screen Spec — Equipamentos

### Imagem de referência

`assets/screenshots-reference/16_equipamentos.png`

### Rota

`app/(tabs)/equipments.tsx`

### Objetivo

Listar, buscar e gerenciar equipamentos vinculados a clientes.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- CategoryFilterChips
- EquipmentCard
- FloatingActionButton
- EmptyState
- BottomTabBar

### Dados necessários

- Equipment[]
- Customer resumo
- query
- categoria selecionada

### Ações do usuário

- tocar em `+` → `/equipments/new`
- buscar → filtrar por marca, modelo, série, cliente
- tocar em equipamento → `/equipments/[id]`
- filtrar categoria → atualizar lista

### Estados

- sem equipamentos
- busca sem resultado
- loading
- erro de leitura
- lista com equipamentos

### Regras visuais

- card com tipo/marca/modelo e cliente
- categoria como badge
- FAB azul
- lista limpa

### Regras funcionais

- equipamento sempre tem cliente proprietário
- não mostrar equipamentos de clientes inativos como removidos; apenas sinalizar
- inativar é preferível a excluir
- busca local offline

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- estado vazio oferece CTA `Cadastrar equipamento`

---


## 15. Screen Spec — Novo equipamento

### Imagem de referência

`assets/screenshots-reference/17_novo_equipamento.png`

### Rota

`app/equipments/new.tsx`

### Objetivo

Cadastrar equipamento vinculado a um cliente.

### Componentes necessários

- ScreenContainer
- AppHeader
- CustomerSelector
- SelectField
- AppInput
- AccessoriesSelector
- PhysicalStateSelector
- PhotoPickerGrid
- BottomActionBar

### Dados necessários

- Equipment.customerId
- Equipment.category
- Equipment.type
- Equipment.brand
- Equipment.model
- Equipment.serialNumber
- Equipment.patrimonyCode
- Equipment.accessories
- Equipment.physicalState
- Equipment.photos
- Equipment.notes

### Ações do usuário

- selecionar cliente
- preencher categoria/tipo
- adicionar acessórios
- adicionar fotos
- tocar em `Salvar equipamento` → validar e persistir

### Estados

- sem cliente selecionado
- invalid: categoria/descrição ausente
- duplicidade provável por série
- saving
- erro ao salvar
- sucesso

### Regras visuais

- cliente no topo
- campos técnicos em cards
- fotos opcionais no final
- CTA fixo

### Regras funcionais

- obrigatórios: cliente e categoria ou descrição simples
- sugerir duplicidade se número de série já existir para o cliente
- se veio de Nova OS, retornar ao fluxo com equipamento selecionado
- fotos devem ser comprimidas

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- equipamento salvo aparece no histórico do cliente

---


## 16. Screen Spec — Catálogo — Serviços

### Imagem de referência

`assets/screenshots-reference/18_catalogo_servicos.png`

### Rota

`app/catalog/services.tsx`

### Objetivo

Cadastrar e gerenciar serviços frequentes para agilizar o preenchimento da OS.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- ServiceCatalogCard
- FloatingActionButton
- ModalForm
- StatusBadge
- EmptyState

### Dados necessários

- ServiceCatalogItem[]
- query
- filtro ativo/inativo

### Ações do usuário

- tocar em `+` → novo serviço
- tocar em serviço → editar
- ativar/inativar serviço
- buscar por nome/categoria
- salvar serviço

### Estados

- catálogo vazio
- busca sem resultado
- formulário inválido
- saving
- erro
- sucesso

### Regras visuais

- lista compacta
- valor padrão à direita
- categoria discreta
- FAB azul
- modal ou tela curta para cadastro

### Regras funcionais

- alterar catálogo não altera OS antigas
- serviço manual pode ser usado sem estar no catálogo
- campos: nome, categoria, descrição, valor, tempo estimado, garantia, status
- não criar agenda nem controle avançado

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- serviço cadastrado aparece no seletor de itens da OS

---


## 17. Screen Spec — Catálogo — Peças

### Imagem de referência

`assets/screenshots-reference/19_catalogo_pecas.png`

### Rota

`app/catalog/parts.tsx`

### Objetivo

Cadastrar e gerenciar peças frequentes sem implementar controle completo de estoque na V1.

### Componentes necessários

- ScreenContainer
- AppHeader
- SearchInput
- PartCatalogCard
- FloatingActionButton
- ModalForm
- StatusBadge
- EmptyState

### Dados necessários

- PartCatalogItem[]
- query
- filtro ativo/inativo

### Ações do usuário

- tocar em `+` → nova peça
- tocar em peça → editar
- ativar/inativar peça
- buscar por nome/código/modelo
- salvar peça

### Estados

- catálogo vazio
- busca sem resultado
- formulário inválido
- saving
- erro
- sucesso

### Regras visuais

- card com nome, código e preço
- valor padrão destacado
- sem indicadores de estoque
- FAB azul

### Regras funcionais

- não controlar quantidade em estoque na V1
- alterar catálogo não altera OS antigas
- peça manual pode ser usada sem estar no catálogo
- peça fornecida pelo cliente pode ter valor zero

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- peça cadastrada aparece no seletor de itens da OS

---


## 18. Screen Spec — Configurações — Empresa

### Imagem de referência

`assets/screenshots-reference/20_configuracoes_empresa.png`

### Rota

`app/settings/company.tsx`

### Objetivo

Editar dados da empresa usados no app e nos PDFs futuros.

### Componentes necessários

- ScreenContainer
- AppHeader
- LogoPicker
- AppInput
- DocumentInput
- PhoneInput
- AddressSection
- BottomActionBar

### Dados necessários

- CompanyProfile completo

### Ações do usuário

- editar campos
- alterar logo
- tocar em `Salvar alterações` → persistir
- voltar com alterações → confirmar saída

### Estados

- loading
- invalid obrigatórios
- saving
- erro ao salvar
- sucesso

### Regras visuais

- logo no topo
- campos agrupados
- CTA fixo
- visual igual ao onboarding para consistência

### Regras funcionais

- dados editados afetam apenas PDFs futuros ou PDFs regenerados
- não alterar PDFs antigos automaticamente
- obrigatórios: nome e telefone ou WhatsApp
- logo deve ser armazenada localmente

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- após salvar, Home e PDF usam nome/logo atualizados

---


## 19. Screen Spec — Configurações — PDF

### Imagem de referência

`assets/screenshots-reference/21_configuracoes_pdf.png`

### Rota

`app/settings/pdf.tsx`

### Objetivo

Definir aparência e conteúdo padrão do PDF da OS.

### Componentes necessários

- ScreenContainer
- AppHeader
- ToggleRow
- ColorPicker
- SelectField
- PdfPreviewMini
- BottomActionBar

### Dados necessários

- PdfSettings.showPhotos
- PdfSettings.showSignature
- PdfSettings.showValues
- PdfSettings.primaryColor
- PdfSettings.documentModel
- PdfSettings.footerText
- PremiumState futuro

### Ações do usuário

- ativar/desativar fotos
- ativar/desativar assinatura
- ativar/desativar valores
- selecionar cor
- selecionar modelo
- salvar alterações

### Estados

- loading
- saving
- erro
- sucesso
- premium bloqueado futuro para modelos avançados

### Regras visuais

- toggles em lista limpa
- cores em bolinhas
- preview pequeno opcional
- CTA fixo

### Regras funcionais

- modelo básico deve estar disponível grátis
- não implementar modelos premium se premium ainda não existir
- settings afetam novos PDFs e PDFs regenerados
- não esconder valores em PDFs já gerados sem regenerar

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- alterar configuração e gerar novo PDF reflete a mudança

---


## 20. Screen Spec — Configurações — Backup

### Imagem de referência

`assets/screenshots-reference/22_configuracoes_backup.png`

### Rota

`app/settings/backup.tsx`

### Objetivo

Exportar e importar backup manual dos dados locais do app.

### Componentes necessários

- ScreenContainer
- AppHeader
- BackupStatusCard
- AppButton
- DangerButton
- ConfirmDialog
- LoadingState

### Dados necessários

- BackupMetadata.lastBackupAt
- Database export
- file picker/import result

### Ações do usuário

- tocar em `Fazer backup agora` → exportar arquivo
- tocar em `Restaurar backup` → selecionar arquivo e confirmar
- tocar em `Limpar todos os dados` → confirmação forte
- compartilhar backup → share sheet

### Estados

- sem backup
- backup recente
- backup antigo
- exportando
- importando
- erro ao exportar
- erro ao importar
- sucesso

### Regras visuais

- cards grandes para ações críticas
- botão destrutivo em vermelho com distância visual
- último backup destacado
- não poluir com detalhes técnicos

### Regras funcionais

- backup deve incluir dados essenciais e referências de arquivos locais
- importação deve validar versão
- antes de importar, sugerir backup atual
- limpar dados exige confirmação forte com texto claro

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- backup exportado pode ser compartilhado/salvo pelo sistema

---


## 21. Screen Spec — Configurações — Segurança

### Imagem de referência

`assets/screenshots-reference/23_configuracoes_seguranca.png`

### Rota

`app/settings/security.tsx`

### Objetivo

Configurar bloqueio local por PIN/biometria quando viável.

### Componentes necessários

- ScreenContainer
- AppHeader
- ToggleRow
- SelectField
- PinSetupModal
- BottomActionBar

### Dados necessários

- AppSettings.security.enabled
- AppSettings.security.type
- AppSettings.security.lockAfterMinutes
- biometric availability

### Ações do usuário

- ativar bloqueio → criar PIN ou verificar biometria
- alterar tipo de bloqueio
- alterar tempo para bloquear
- salvar alterações

### Estados

- indisponível no dispositivo
- PIN não configurado
- saving
- erro
- sucesso

### Regras visuais

- status `Ativado`/`Desativado` claro
- formulário curto
- CTA no rodapé
- não usar excesso de opções

### Regras funcionais

- se biometria não estiver disponível, oferecer PIN
- não armazenar PIN em texto puro
- se segurança atrasar V1, permitir deixar tela como preparada/desativada
- não bloquear funções principais por falha de biometria

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- se recurso não estiver implementado na V1, tela não deve prometer funcionalidade ativa

---


## 22. Screen Spec — Loading inicial

### Imagem de referência

`assets/screenshots-reference/24_loading_inicial.png`

### Rota

`src/components/ui/LoadingState.tsx — variante `initial``

### Objetivo

Exibir carregamento ao abrir o app enquanto verifica banco local, onboarding e dados essenciais.

### Componentes necessários

- FullScreenContainer
- AppLogo
- ProgressBar opcional
- CaptionText

### Dados necessários

- app initialization state
- database migration state
- CompanyProfile existence

### Ações do usuário

- nenhuma ação primária
- se timeout/erro → mostrar erro genérico com tentar novamente

### Estados

- carregando
- migração local
- erro inicial
- sucesso e redirecionamento

### Regras visuais

- fundo azul escuro
- logo central
- texto curto `Carregando...`
- barra discreta

### Regras funcionais

- não depender de internet
- não travar indefinidamente
- após carregar, rotear para onboarding ou Home

### Comportamento em celular pequeno

Tela cheia com conteúdo centralizado e respeitando safe area.

### Comportamento em tablet

Centralizar conteúdo com largura máxima curta; fundo ocupa toda a tela.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- não mostra tela branca durante inicialização

---


## 23. Screen Spec — Loading entre telas

### Imagem de referência

`assets/screenshots-reference/25_loading_entre_telas.png`

### Rota

`src/components/ui/LoadingState.tsx — variante `inline` ou `transition``

### Objetivo

Indicar transições curtas, salvamento, leitura local ou geração de dados entre telas.

### Componentes necessários

- LoadingDots
- CaptionText
- OptionalOverlay

### Dados necessários

- loading message
- operation type

### Ações do usuário

- nenhuma ação, exceto cancelar quando operação for longa e segura de cancelar

### Estados

- loading curto
- loading longo
- erro após falha

### Regras visuais

- três pontos azuis ou spinner discreto
- texto curto
- sem ocupar visual demais se inline

### Regras funcionais

- usar para transições e operações locais
- para PDF/backup usar mensagem específica
- evitar bloquear UI para operações muito rápidas

### Comportamento em celular pequeno

Pode ser tela cheia ou overlay dependendo da operação; não cobrir confirmação crítica sem necessidade.

### Comportamento em tablet

Overlay centralizado quando estiver dentro de telas amplas.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- aparece em geração de PDF e exportação de backup quando operação demora

---


## 24. Screen Spec — Erro — Offline

### Imagem de referência

`assets/screenshots-reference/26_erro_offline.png`

### Rota

`src/components/ui/ErrorState.tsx — variante `offline``

### Objetivo

Informar que o app está sem internet quando a ação externa depender de conexão.

### Componentes necessários

- ErrorState
- OfflineIcon
- AppButton

### Dados necessários

- network status opcional
- failed action context

### Ações do usuário

- tocar em `Entendi` → fechar estado/modal
- tocar em tentar novamente, se ação permitir → repetir ação externa

### Estados

- offline detectado
- ação externa falhou
- retorno ao fluxo local

### Regras visuais

- ícone de nuvem/offline
- mensagem clara
- CTA único
- não parecer erro fatal

### Regras funcionais

- não bloquear cadastro, OS, PDF local, busca ou backup local por falta de internet
- usar offline apenas para compartilhar/enviar/validar premium/anúncios futuros
- mensagem deve explicar que o app continua funcionando

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- usuário consegue voltar ao app e continuar trabalhando offline

---


## 25. Screen Spec — Erro — Genérico

### Imagem de referência

`assets/screenshots-reference/27_erro_generico.png`

### Rota

`src/components/ui/ErrorState.tsx — variante `generic``

### Objetivo

Exibir falhas locais de leitura, escrita, geração ou operação inesperada.

### Componentes necessários

- ErrorState
- WarningIcon
- AppButton
- SecondaryAction opcional

### Dados necessários

- error message
- error code opcional interno
- retry callback

### Ações do usuário

- tocar em `Tentar novamente` → repetir operação
- tocar em voltar, se existir → retornar para tela segura

### Estados

- erro de leitura SQLite
- erro ao salvar
- erro ao gerar PDF
- erro ao importar backup

### Regras visuais

- ícone vermelho/alerta
- mensagem curta
- CTA único
- evitar stack trace para usuário

### Regras funcionais

- logar erro internamente em dev
- mensagem deve ser específica quando possível
- não perder rascunho ao falhar salvamento
- oferecer caminho seguro

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- erro não deixa usuário preso sem ação

---


## 26. Screen Spec — Tela vazia — OS

### Imagem de referência

`assets/screenshots-reference/28_empty_state_os.png`

### Rota

`src/components/ui/EmptyState.tsx — variante `orders``

### Objetivo

Orientar o usuário quando ainda não há ordens de serviço cadastradas.

### Componentes necessários

- EmptyState
- ClipboardIcon
- AppButton

### Dados necessários

- count ServiceOrder = 0
- current filter/query

### Ações do usuário

- tocar em `Nova OS` → `/orders/new`
- limpar busca/filtro quando estado vazio for resultado de filtro

### Estados

- sem OS geral
- sem resultado por busca
- sem resultado por filtro

### Regras visuais

- ícone leve
- título objetivo
- texto curto
- CTA primário

### Regras funcionais

- se vazio geral, CTA deve criar OS
- se vazio por busca, oferecer limpar busca
- não mostrar dashboard zerado poluído

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- estado vazio não aparece se houver OS em outro filtro sem indicação clara

---


## 27. Screen Spec — Tela vazia — Clientes

### Imagem de referência

`assets/screenshots-reference/29_empty_state_clientes.png`

### Rota

`src/components/ui/EmptyState.tsx — variante `customers``

### Objetivo

Orientar o cadastro do primeiro cliente ou criação de cliente quando busca não encontra resultado.

### Componentes necessários

- EmptyState
- UsersIcon
- AppButton

### Dados necessários

- count Customer = 0
- query de busca

### Ações do usuário

- tocar em `Novo cliente` → `/customers/new`
- limpar busca → retornar lista

### Estados

- sem clientes
- busca sem resultado

### Regras visuais

- ícone de pessoas
- título claro
- CTA azul
- texto auxiliar curto

### Regras funcionais

- cliente também pode ser criado dentro do fluxo de OS
- não bloquear Nova OS por não haver cliente; redirecionar para criar/selecionar cliente

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- estado vazio da aba Clientes não cria OS por engano

---


## 28. Screen Spec — Tela vazia — Equipamentos

### Imagem de referência

`assets/screenshots-reference/30_empty_state_equipamentos.png`

### Rota

`src/components/ui/EmptyState.tsx — variante `equipments``

### Objetivo

Orientar cadastro do primeiro equipamento ou indicar que um cliente ainda não tem equipamentos.

### Componentes necessários

- EmptyState
- DeviceIcon
- AppButton

### Dados necessários

- count Equipment = 0
- customerId opcional
- query de busca

### Ações do usuário

- tocar em `Novo equipamento` → `/equipments/new`
- em contexto de OS: tocar em `Serviço sem equipamento` ou `Novo equipamento`

### Estados

- sem equipamentos geral
- cliente sem equipamentos
- busca sem resultado

### Regras visuais

- ícone técnico
- CTA claro
- mensagem muda conforme contexto

### Regras funcionais

- equipamento exige cliente
- em Nova OS, permitir serviço sem equipamento
- não criar equipamento sem proprietário

### Comportamento em celular pequeno

Usar `ScrollView`, campos em coluna única e CTA principal fixo ou ao final da tela com área segura.

### Comportamento em tablet

Manter largura máxima centralizada entre 480 e 720 px. Em listas, permitir cards em duas colunas apenas se não prejudicar leitura.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- mensagem diferencia app sem equipamentos de cliente específico sem equipamentos

---


## 29. Screen Spec — Confirmação de ação

### Imagem de referência

`assets/screenshots-reference/31_confirmacao_acao.png`

### Rota

`src/components/ui/ConfirmDialog.tsx`

### Objetivo

Confirmar ações relevantes, destrutivas ou que alteram estado importante.

### Componentes necessários

- Modal
- ConfirmIcon
- AppButton
- SecondaryButton
- DangerButton opcional

### Dados necessários

- title
- message
- confirmLabel
- cancelLabel
- variant
- onConfirm

### Ações do usuário

- tocar em confirmar → executar ação
- tocar em cancelar/fora → fechar sem alterar
- em ação destrutiva → exigir confirmação forte

### Estados

- sucesso
- erro ao confirmar
- loading durante ação
- cancelado pelo usuário

### Regras visuais

- modal central
- ícone de sucesso/alerta conforme variante
- máximo dois botões principais
- não ocupar tela inteira desnecessariamente

### Regras funcionais

- usar para cancelar OS, limpar dados, importar backup, editar OS entregue, remover item
- não usar confirmação para ações triviais
- ações destrutivas devem ser explícitas

### Comportamento em celular pequeno

Modal deve caber em tela pequena; textos longos devem quebrar linha sem cortar botões.

### Comportamento em tablet

Modal com largura máxima de 420 px centralizado.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- não permite confirmar duas vezes durante `loading`

---


## 30. Screen Spec — PDF — Ordem de Serviço

### Imagem de referência

`assets/screenshots-reference/37_pdf_os_exemplo.png`

### Rota

`app/orders/[id]/pdf.tsx + `src/services/pdf/pdfTemplate.ts``

### Objetivo

Gerar e visualizar um PDF profissional da OS com dados da empresa, cliente, equipamento, problema, diagnóstico, itens, valores, termos, fotos e assinaturas.

### Componentes necessários

- PdfPreviewScreen
- PdfActionBar
- PdfStatusCard
- LoadingState
- ErrorState
- ShareButton
- HTML/PDF template service

### Dados necessários

- CompanyProfile
- PdfSettings
- ServiceOrder
- Customer
- Equipment opcional
- ServiceOrderItem[]
- Payment summary
- PhotoAttachment[]
- SignatureRecord[]
- DefaultTerms
- ServiceOrderPdf

### Ações do usuário

- abrir preview → carregar PDF existente ou gerar se necessário
- tocar em `Gerar PDF` → validar dados e gerar arquivo
- tocar em `Compartilhar` → abrir share sheet
- tocar em `Regenerar` → confirmar e criar nova versão
- tocar em voltar → detalhes da OS

### Estados

- sem PDF
- PDF gerado
- PDF desatualizado
- gerando
- erro ao gerar
- falha ao compartilhar
- sem app de compartilhamento

### Regras visuais

- layout A4 limpo
- cabeçalho forte com logo e dados da empresa
- número da OS em destaque
- blocos bem separados
- tabelas com bordas suaves
- assinaturas em área própria
- rodapé discreto

### Regras funcionais

- validar empresa, número da OS, cliente e descrição antes de gerar
- PDF deve ser gerado localmente
- se OS for editada após gerar PDF, marcar como desatualizado
- observações internas não entram no PDF por padrão
- respeitar configurações: exibir valores/fotos/assinaturas
- salvar registro `ServiceOrderPdf` com data e versão

### Comportamento em celular pequeno

Preview pode abrir em tela vertical com zoom/scroll. Ações principais devem ficar no rodapé seguro.

### Comportamento em tablet

Preview pode ocupar área maior centralizada; ações ficam em coluna ou barra lateral se necessário.

### Critérios de aceitação

- abre sem crash em Android e iOS
- respeita área segura superior e inferior
- usa componentes globais quando houver padrão reaproveitável
- funciona em celular pequeno sem cortar CTA principal
- funciona em tablet sem esticar campos de forma exagerada
- não quebra tema claro/escuro
- não duplica informação principal em mais de um card
- não cria funções fora do escopo da V1
- typecheck passa ao final da tarefa
- PDF pode ser compartilhado por apps do sistema
- PDF continua disponível offline após gerado
- regeneração atualiza marcação de PDF desatualizado

### Observações para Codex

- não implementar nota fiscal
- não usar tabela larga dentro do app mobile; tabela é permitida apenas no PDF
- usar HTML/CSS simples e compatível com biblioteca de PDF do Expo/React Native escolhida

---
## 31. Regras comuns de formulários

### 31.1. Validação

- Mostrar erro abaixo do campo, não apenas em alerta geral.
- Não validar enquanto o usuário ainda está digitando, salvo máscaras simples.
- Validar obrigatórios ao tocar em avançar/salvar.
- Documento, e-mail e CEP são opcionais na maioria dos fluxos; validar formato apenas se preenchidos.

### 31.2. Rascunho

- Nova OS deve salvar rascunho local após ter cliente + descrição mínima ou quando o usuário sair com alterações.
- Se o app fechar durante Nova OS, oferecer recuperar rascunho.
- Ao concluir OS, limpar rascunho usado.

### 31.3. Saída com alterações não salvas

Usar `ConfirmDialog` com:

```txt
Você tem alterações não salvas. Deseja sair mesmo assim?
```

Ações:

- `Continuar editando`
- `Descartar`
- `Salvar rascunho`, quando aplicável

---

## 32. Regras comuns de listas

- Sempre ter busca no topo quando a lista puder crescer.
- Estado vazio precisa ter CTA coerente.
- Estado de busca sem resultado deve permitir limpar busca.
- Cards devem conter somente dados úteis para decisão rápida.
- A lista não deve editar registros diretamente; abrir detalhe ou formulário.

---

## 33. Regras comuns de status de OS

Status da V1:

```txt
Aberta
Em diagnóstico
Aguardando aprovação
Aprovada
Em execução
Aguardando peça
Concluída
Entregue
Cancelada
```

Regras:

- Toda alteração de status deve registrar data e hora.
- Cancelamento deve pedir motivo.
- Entrega deve sugerir assinatura de retirada.
- OS entregue não deve ser editada sem confirmação.
- OS cancelada deve manter histórico.

---

## 34. Regras comuns de cálculo

```txt
totalServicos = soma dos itens tipo serviço
totalPecas = soma dos itens tipo peça
subtotal = totalServicos + totalPecas + outrosCustos
total = max(0, subtotal - descontoGeral)
valorPendente = max(0, total - valorPago)
```

Regras:

- Desconto não pode gerar total negativo.
- Valor pago maior que total exige confirmação.
- Item pode ter valor zero.
- Quantidade deve ser maior que zero.
- Valores devem ser formatados em BRL.

---

## 35. Regras comuns de offline-first

- Cadastro, edição, busca, histórico, assinatura, fotos, geração de PDF e backup local devem funcionar sem internet.
- Internet só pode ser exigida para compartilhar por apps externos, validar premium futuro, anúncios futuros ou backup em nuvem futuro.
- Ausência de internet não deve bloquear o fluxo principal.

---

## 36. O que o Codex não deve implementar nesta fase

Não implementar:

- login obrigatório;
- sincronização em nuvem;
- multiusuário;
- emissão de nota fiscal;
- estoque completo;
- agenda complexa;
- CRM;
- portal do cliente;
- IA para diagnóstico;
- integração com WhatsApp Business API;
- relatórios avançados;
- múltiplas empresas;
- premium real antes do app básico funcionar.

---

## 37. Checklist de aceite do documento 04

O documento está completo quando:

- todas as imagens geradas têm Screen Spec correspondente;
- cada tela tem rota ou componente indicado;
- cada tela tem objetivo claro;
- cada tela tem dados necessários;
- cada tela tem ações do usuário;
- cada tela tem estados de loading, erro, vazio ou sucesso quando aplicável;
- cada tela tem regras visuais e funcionais;
- PDF tem estrutura própria;
- telas de erro, loading e empty states estão especificadas;
- Codex consegue implementar uma tela por vez sem depender da conversa solta.

---

## 38. Próxima etapa recomendada

Criar o arquivo:

```txt
docs/05_DATA_MODEL.md
```

Esse arquivo deve transformar as entidades previstas neste documento em tipos TypeScript, tabelas SQLite, relacionamentos, índices, regras de migração e serviços locais.
