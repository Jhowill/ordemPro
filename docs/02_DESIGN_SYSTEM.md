# Design System — OrdemPro

## 1. Identificação

**Arquivo:** `docs/02_DESIGN_SYSTEM.md`  
**App:** OrdemPro  
**Categoria:** Gestão de ordens de serviço, assistência técnica e serviços profissionais  
**Stack prevista:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Base do produto:** App offline-first para cadastro de clientes, equipamentos, peças, serviços, ordens de serviço e geração de PDF profissional.

Este documento define a identidade visual, os tokens, os componentes, os padrões de tela, as regras de responsividade e o estilo visual dos PDFs do OrdemPro.

---

# 2. Objetivo do Design System

O design system existe para garantir que o app seja:

- profissional;
- limpo;
- rápido de usar;
- visualmente confiável;
- coerente entre todas as telas;
- adequado para técnicos e pequenas empresas;
- simples de implementar em React Native;
- compatível com Android, iOS, celular pequeno e tablet;
- consistente com os PDFs gerados pelo app.

O OrdemPro não deve parecer um app informal, infantil ou excessivamente decorativo. Ele deve transmitir organização, controle e confiança.

---

# 3. Personalidade visual

## 3.1 Direção principal

A identidade visual deve seguir esta combinação:

```txt
Profissional + técnico + moderno + limpo + confiável
```

## 3.2 Sensação esperada

O usuário deve sentir que está usando um sistema de empresa, mas com simplicidade de app mobile.

O visual deve passar:

- controle;
- clareza;
- segurança;
- organização;
- produtividade;
- agilidade;
- confiança no documento gerado.

## 3.3 O que evitar

Evitar:

- cores muito vibrantes sem propósito;
- excesso de sombras fortes;
- gradientes exagerados;
- ícones infantis;
- telas muito coloridas;
- excesso de cards;
- excesso de métricas;
- botões competindo entre si;
- textos longos em áreas principais;
- aparência de planilha crua;
- aparência de ERP antigo.

---

# 4. Princípios de UI

## 4.1 Clareza operacional

Cada tela deve responder rapidamente:

```txt
O que o usuário faz aqui?
```

Exemplos:

- Home: criar OS e acompanhar status.
- Lista de OS: encontrar e filtrar ordens.
- Detalhes da OS: controlar uma ordem específica.
- Cliente: ver dados e histórico.
- Equipamento: ver identificação e histórico técnico.

## 4.2 Uma ação principal por tela

Cada tela deve ter:

- 1 CTA principal;
- até 2 ações secundárias visíveis;
- ações extras dentro de menu, bottom sheet ou área de detalhes.

Exemplo correto:

```txt
Tela Detalhes da OS
CTA principal: Gerar PDF
Ações secundárias: Alterar status, Adicionar item
Ações extras: Compartilhar, duplicar, cancelar, excluir
```

## 4.3 Informação sem duplicação

Uma informação deve ter um local principal.

Exemplo:

- Status da OS aparece no badge principal da OS.
- Valor total aparece no resumo financeiro.
- Cliente aparece no cabeçalho da OS.
- Número da OS aparece no topo e no PDF.

Não repetir o mesmo dado em vários cards sem necessidade.

## 4.4 Mobile-first

Todas as telas devem funcionar primeiro em celular pequeno.

Prioridade:

```txt
celular pequeno → celular grande → tablet
```

## 4.5 Uso rápido em campo

O usuário pode estar em atendimento, balcão, oficina ou visita técnica. Por isso:

- campos importantes devem ser fáceis de tocar;
- botões devem ser grandes o suficiente;
- listas devem ter busca clara;
- telas de cadastro devem ser divididas por seções;
- dados opcionais não devem travar o fluxo;
- ações críticas devem pedir confirmação.

---

# 5. Paleta de cores

## 5.1 Paleta principal — Light Mode

| Token | Cor | Uso |
|---|---:|---|
| `background` | `#F4F6F8` | Fundo geral do app |
| `surface` | `#FFFFFF` | Cards, modais e inputs |
| `surfaceAlt` | `#F8FAFC` | Blocos secundários |
| `primary` | `#1E4FD7` | CTA principal, links, foco |
| `primaryDark` | `#173EA8` | Pressed state do primário |
| `primarySoft` | `#E8EEFF` | Fundo de destaque leve |
| `secondary` | `#0F172A` | Títulos fortes e elementos institucionais |
| `accent` | `#0EA5E9` | Destaques informativos |
| `success` | `#16A34A` | Concluído, entregue, pago |
| `successSoft` | `#DCFCE7` | Fundo de badge sucesso |
| `warning` | `#F59E0B` | Aguardando, atenção, prazo |
| `warningSoft` | `#FEF3C7` | Fundo de badge alerta |
| `danger` | `#DC2626` | Cancelar, excluir, vencido, erro |
| `dangerSoft` | `#FEE2E2` | Fundo de badge erro |
| `info` | `#2563EB` | Informações e detalhes técnicos |
| `infoSoft` | `#DBEAFE` | Fundo de badge informativo |
| `text` | `#111827` | Texto principal |
| `textSecondary` | `#4B5563` | Texto secundário |
| `muted` | `#6B7280` | Legendas e descrições |
| `disabled` | `#9CA3AF` | Elementos desabilitados |
| `border` | `#E5E7EB` | Bordas gerais |
| `divider` | `#EEF2F7` | Divisores suaves |
| `overlay` | `rgba(15, 23, 42, 0.45)` | Fundo de modal |

## 5.2 Paleta principal — Dark Mode

| Token | Cor | Uso |
|---|---:|---|
| `background` | `#0B1120` | Fundo geral escuro |
| `surface` | `#111827` | Cards, modais e inputs |
| `surfaceAlt` | `#1F2937` | Blocos secundários |
| `primary` | `#5B7CFA` | CTA principal em dark mode |
| `primaryDark` | `#405DD8` | Pressed state |
| `primarySoft` | `rgba(91, 124, 250, 0.18)` | Fundo primário suave |
| `secondary` | `#F9FAFB` | Títulos fortes |
| `accent` | `#38BDF8` | Destaques informativos |
| `success` | `#22C55E` | Concluído, entregue, pago |
| `successSoft` | `rgba(34, 197, 94, 0.16)` | Badge sucesso |
| `warning` | `#FBBF24` | Aguardando, atenção |
| `warningSoft` | `rgba(251, 191, 36, 0.18)` | Badge alerta |
| `danger` | `#F87171` | Cancelar, erro |
| `dangerSoft` | `rgba(248, 113, 113, 0.16)` | Badge erro |
| `info` | `#60A5FA` | Informação |
| `infoSoft` | `rgba(96, 165, 250, 0.16)` | Badge informativo |
| `text` | `#F9FAFB` | Texto principal |
| `textSecondary` | `#CBD5E1` | Texto secundário |
| `muted` | `#94A3B8` | Legendas |
| `disabled` | `#64748B` | Desabilitado |
| `border` | `#334155` | Bordas |
| `divider` | `#1F2937` | Divisores |
| `overlay` | `rgba(0, 0, 0, 0.62)` | Fundo de modal |

## 5.3 Regra de uso da cor primária

A cor primária deve ser usada para:

- botão principal;
- links importantes;
- item ativo da bottom tab;
- foco de input;
- indicadores principais;
- destaque do número da OS;
- elementos centrais do PDF.

Não usar a cor primária em todos os cards. Isso reduz hierarquia.

---

# 6. Cores por status da OS

## 6.1 Status operacionais

| Status | Texto | Fundo Light | Texto Light | Fundo Dark | Texto Dark |
|---|---|---:|---:|---:|---:|
| `open` | Aberta | `#DBEAFE` | `#1D4ED8` | `rgba(96,165,250,0.16)` | `#93C5FD` |
| `diagnosis` | Em diagnóstico | `#E0F2FE` | `#0369A1` | `rgba(14,165,233,0.16)` | `#7DD3FC` |
| `waiting_approval` | Aguardando aprovação | `#FEF3C7` | `#B45309` | `rgba(251,191,36,0.18)` | `#FDE68A` |
| `approved` | Aprovada | `#DCFCE7` | `#15803D` | `rgba(34,197,94,0.16)` | `#86EFAC` |
| `in_progress` | Em execução | `#EDE9FE` | `#6D28D9` | `rgba(139,92,246,0.18)` | `#C4B5FD` |
| `waiting_parts` | Aguardando peça | `#FFEDD5` | `#C2410C` | `rgba(251,146,60,0.18)` | `#FDBA74` |
| `completed` | Concluída | `#DCFCE7` | `#166534` | `rgba(34,197,94,0.16)` | `#BBF7D0` |
| `delivered` | Entregue | `#D1FAE5` | `#047857` | `rgba(16,185,129,0.16)` | `#A7F3D0` |
| `cancelled` | Cancelada | `#FEE2E2` | `#B91C1C` | `rgba(248,113,113,0.16)` | `#FCA5A5` |

## 6.2 Regra de badge

Todo status deve usar o componente `StatusBadge`.

Características:

- altura mínima: 28px;
- padding horizontal: 10px;
- border radius: 999px;
- texto: 12px ou 13px;
- peso: 600;
- não usar caixa alta obrigatória;
- sempre ter contraste suficiente.

---

# 7. Cores por prioridade

| Prioridade | Uso visual |
|---|---|
| Baixa | badge cinza/azul suave |
| Normal | badge neutro |
| Alta | badge amarelo/laranja |
| Urgente | badge vermelho |

Regra:

- prioridade não deve competir com status;
- status é mais importante que prioridade;
- em listas, status aparece primeiro e prioridade aparece menor.

---

# 8. Tipografia

## 8.1 Família tipográfica

Usar fonte do sistema por padrão para performance e estabilidade.

```txt
fontFamily: system default
Android: Roboto
IOS: San Francisco
```

Não adicionar fonte externa na V1, salvo necessidade forte de marca.

## 8.2 Escala tipográfica

| Token | Tamanho | Line height | Peso | Uso |
|---|---:|---:|---:|---|
| `display` | 32 | 40 | 700 | Tela premium, destaque raro |
| `h1` | 28 | 36 | 700 | Título principal de tela |
| `h2` | 24 | 32 | 700 | Seções fortes |
| `h3` | 20 | 28 | 700 | Título de card importante |
| `title` | 18 | 26 | 700 | Título de card/lista |
| `subtitle` | 16 | 24 | 600 | Subtítulo e labels fortes |
| `body` | 15 | 22 | 400 | Texto padrão |
| `bodyMedium` | 15 | 22 | 500 | Texto com leve destaque |
| `small` | 13 | 18 | 400 | Legendas e metadados |
| `caption` | 12 | 16 | 400 | Badges e auxiliares |
| `button` | 15 | 20 | 700 | Botões principais |
| `money` | 22 | 30 | 700 | Valores financeiros |
| `number` | 20 | 28 | 700 | Números de OS e métricas |

## 8.3 Regras de texto

- Títulos devem ser curtos.
- Labels de formulário devem ser claros.
- Evitar parágrafos longos na Home.
- Usar descrições curtas em Empty State.
- Não usar textos genéricos como “Lorem ipsum”.
- O app deve usar português brasileiro.

## 8.4 Exemplos de microcopy

### Botões

- Nova OS
- Gerar PDF
- Compartilhar PDF
- Salvar cliente
- Adicionar equipamento
- Adicionar serviço
- Adicionar peça
- Coletar assinatura
- Registrar pagamento
- Fazer backup

### Empty states

- Nenhuma OS cadastrada ainda.
- Cadastre o primeiro cliente para criar uma ordem de serviço.
- Este equipamento ainda não possui histórico.
- Nenhum serviço frequente cadastrado.
- Nenhuma peça cadastrada.

### Alertas

- Esta OS já foi entregue. Alterações podem afetar o histórico.
- Esta ação não pode ser desfeita.
- Faça backup regularmente para evitar perda de dados.
- O PDF será atualizado com os dados atuais da OS.

---

# 9. Espaçamento

## 9.1 Tokens de espaçamento

| Token | Valor | Uso |
|---|---:|---|
| `xxs` | 4 | Espaço interno mínimo |
| `xs` | 8 | Itens próximos |
| `sm` | 12 | Padding pequeno |
| `md` | 16 | Padding padrão |
| `lg` | 20 | Separação de seções |
| `xl` | 24 | Margem de tela e cards grandes |
| `2xl` | 32 | Separações principais |
| `3xl` | 40 | Blocos grandes |

## 9.2 Margens de tela

| Contexto | Valor |
|---|---:|
| Celular pequeno | 16px |
| Celular grande | 20px |
| Tablet | 24px a 32px |

## 9.3 Distância entre cards

- Lista densa: 10px a 12px;
- Lista confortável: 14px a 16px;
- Dashboard: 16px a 20px;
- Formulários: 14px entre campos, 24px entre seções.

---

# 10. Bordas, radius e sombras

## 10.1 Radius

| Token | Valor | Uso |
|---|---:|---|
| `xs` | 6 | Badges pequenos |
| `sm` | 8 | Inputs compactos |
| `md` | 12 | Inputs e botões |
| `lg` | 16 | Cards padrão |
| `xl` | 20 | Cards destacados |
| `2xl` | 24 | Modais e painéis |
| `pill` | 999 | Badges e chips |

## 10.2 Bordas

- Cor padrão: `border`;
- Largura padrão: 1px;
- Inputs focados: borda `primary`;
- Erro: borda `danger`;
- Cards importantes podem usar borda sutil no lugar de sombra.

## 10.3 Sombras

Usar sombras discretas.

### Card padrão

```txt
shadowColor: #0F172A
shadowOpacity: 0.06
shadowRadius: 10
shadowOffset: 0px 4px
elevation: 2
```

### Card destacado

```txt
shadowColor: #0F172A
shadowOpacity: 0.10
shadowRadius: 16
shadowOffset: 0px 8px
elevation: 4
```

Regra:

- não usar sombras fortes em todos os cards;
- em dark mode, preferir borda e contraste de superfície.

---

# 11. Ícones

## 11.1 Estilo

Usar ícones lineares, simples e consistentes.

Recomendado:

```txt
Lucide Icons ou Expo Vector Icons
```

## 11.2 Espessura

- stroke: 2px;
- tamanho padrão: 20px ou 22px;
- ícones em tab: 22px a 24px;
- ícones em cards: 20px;
- ícones em botões: 18px a 20px.

## 11.3 Ícones por área

| Área | Ícone sugerido |
|---|---|
| Home | house ou layout-dashboard |
| OS | clipboard-list ou file-text |
| Cliente | users ou user-round |
| Equipamento | monitor-cog, wrench ou cpu |
| Serviços | wrench |
| Peças | package ou boxes |
| PDF | file-text |
| Assinatura | pen-line |
| Fotos | camera |
| Backup | database-backup |
| Configurações | settings |
| Pagamento | credit-card ou wallet |

Regra:

- ícone deve apoiar leitura, não substituir texto em ações importantes.

---

# 12. Layout global

## 12.1 ScreenContainer

Componente base de todas as telas.

Características:

- respeita Safe Area;
- aplica background;
- define padding horizontal padrão;
- suporta scroll ou layout fixo;
- trata teclado em formulários;
- mantém área inferior livre para bottom tab e botões fixos.

Props sugeridas:

```ts
type ScreenContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardAware?: boolean;
  footer?: React.ReactNode;
};
```

## 12.2 AppHeader

Uso:

- título da tela;
- subtítulo opcional;
- botão voltar quando necessário;
- ação secundária no canto direito.

Regras:

- não repetir título dentro do primeiro card;
- usar título curto;
- em detalhes da OS, mostrar número da OS e status.

## 12.3 Bottom Tab

Abas principais:

```txt
Home
OS
Clientes
Equipamentos
Configurações
```

Características:

- altura entre 64px e 76px;
- ícone + texto;
- item ativo em `primary`;
- item inativo em `muted`;
- fundo `surface`;
- borda superior `border`;
- respeitar safe area inferior.

Não colocar mais de 5 abas.

---

# 13. Componentes globais

## 13.1 AppCard

Uso:

- blocos de informação;
- resumo de OS;
- dados do cliente;
- equipamento;
- seções de formulário;
- resumo financeiro;
- alertas.

Características:

```txt
background: surface
borderRadius: 16
padding: 16
borderWidth: 1
borderColor: border
shadow: leve no light mode
```

Variações:

- `default`;
- `elevated`;
- `outlined`;
- `highlight`;
- `danger`;
- `success`.

Regras:

- card deve ter uma função clara;
- evitar card dentro de card;
- se o card tiver ação, área clicável deve ser evidente;
- card de lista deve ter altura variável, mas não excessiva.

---

## 13.2 AppButton

### Botão primário

Uso:

- ação principal da tela;
- salvar;
- gerar PDF;
- criar nova OS.

Características:

```txt
height: 52
borderRadius: 14
background: primary
textColor: white
fontWeight: 700
```

Estados:

- default;
- pressed;
- loading;
- disabled.

### Botão secundário

Uso:

- ações de apoio;
- voltar;
- editar;
- adicionar item secundário.

Características:

```txt
height: 48
borderRadius: 14
background: primarySoft ou surface
border: primarySoft/border
textColor: primary
```

### Botão terciário

Uso:

- ações menos importantes;
- links;
- editar pequenos blocos.

Características:

```txt
background: transparent
textColor: primary
height: 40
```

### Botão destrutivo

Uso:

- excluir;
- cancelar OS;
- apagar foto;
- remover item.

Características:

```txt
background: danger ou dangerSoft
textColor: white ou danger
```

Regra:

- ação destrutiva sempre pede confirmação.

---

## 13.3 InputField

Uso:

- formulários de empresa, cliente, equipamento, OS e itens.

Características:

```txt
height mínimo: 48
borderRadius: 12
background: surface
border: 1px border
paddingHorizontal: 14
label acima do campo
texto: body
```

Estados:

- default;
- focused;
- filled;
- error;
- disabled;
- readOnly.

Regras:

- labels sempre visíveis;
- placeholder não substitui label;
- campos obrigatórios devem ter indicador discreto;
- mensagens de erro devem aparecer abaixo do campo;
- teclado deve ser adequado ao tipo do campo.

## 13.4 TextArea

Uso:

- defeito relatado;
- diagnóstico;
- serviço executado;
- termos;
- observações.

Características:

```txt
minHeight: 96
borderRadius: 12
padding: 14
textAlignVertical: top
```

---

## 13.5 SearchInput

Uso:

- busca de OS;
- clientes;
- equipamentos;
- serviços;
- peças.

Características:

```txt
height: 48
borderRadius: 14
ícone de lupa à esquerda
botão limpar quando houver texto
```

Regra:

- busca deve ficar próxima da lista;
- filtros devem ficar abaixo ou em chips horizontais.

---

## 13.6 StatusBadge

Uso:

- status da OS;
- status de cliente;
- status de peça/serviço;
- garantia ativa/vencida.

Características:

```txt
borderRadius: pill
paddingVertical: 5
paddingHorizontal: 10
fontSize: 12
fontWeight: 600
```

---

## 13.7 EmptyState

Uso:

- tela sem OS;
- lista de clientes vazia;
- equipamento sem histórico;
- catálogo sem itens.

Estrutura:

- ícone;
- título curto;
- descrição;
- CTA opcional.

Exemplo:

```txt
Título: Nenhuma OS cadastrada
Descrição: Crie sua primeira ordem de serviço para começar a organizar seus atendimentos.
CTA: Nova OS
```

---

## 13.8 SectionTitle

Uso:

- separar blocos em formulários e detalhes.

Estrutura:

- título;
- descrição opcional;
- ação opcional à direita.

Exemplos:

- Dados do cliente;
- Dados do equipamento;
- Problema relatado;
- Peças e serviços;
- Resumo financeiro;
- Termos e assinatura.

---

## 13.9 MoneySummaryCard

Uso:

- resumo financeiro dentro da OS.

Deve mostrar:

- subtotal de serviços;
- subtotal de peças;
- desconto;
- total;
- pago;
- pendente.

Regra:

- total deve ter maior peso visual;
- pendente deve usar alerta se maior que zero;
- valores devem ser formatados como moeda brasileira.

---

## 13.10 PhotoPicker

Uso:

- fotos do equipamento;
- fotos do defeito;
- fotos do antes/depois;
- logo da empresa.

Características:

- miniaturas em grade;
- botão adicionar;
- botão remover;
- preview em tela cheia;
- limite visual por seção;
- compressão antes de salvar.

Regra:

- não carregar imagens em tamanho original em listas;
- usar thumbnail quando possível.

---

## 13.11 SignaturePad

Uso:

- assinatura do cliente;
- assinatura do técnico;
- retirada do equipamento.

Características:

- área branca ou surface;
- borda clara;
- botão limpar;
- botão confirmar;
- texto auxiliar.

Regra:

- assinatura confirmada deve aparecer como imagem em preview;
- alteração de assinatura deve pedir confirmação.

---

## 13.12 PdfPreviewCard

Uso:

- visualizar estado do PDF da OS.

Deve conter:

- ícone de PDF;
- número da OS;
- data da última geração;
- status: gerado/não gerado/desatualizado;
- ações: gerar, visualizar, compartilhar.

---

# 14. Componentes por domínio

## 14.1 Home

Componentes sugeridos:

- `HomeStatusGrid`;
- `QuickActionCard`;
- `RecentOrderCard`;
- `BackupReminderCard`;
- `TodaySummaryCard`.

## 14.2 OS

Componentes sugeridos:

- `ServiceOrderCard`;
- `ServiceOrderStatusStepper`;
- `ServiceOrderTimeline`;
- `ServiceOrderItemRow`;
- `ServiceOrderFinancialSummary`;
- `ServiceOrderPdfActions`;
- `ServiceOrderSignatureBlock`.

## 14.3 Clientes

Componentes sugeridos:

- `CustomerCard`;
- `CustomerContactBlock`;
- `CustomerHistoryList`;
- `CustomerEquipmentList`.

## 14.4 Equipamentos

Componentes sugeridos:

- `EquipmentCard`;
- `EquipmentIdentityBlock`;
- `EquipmentConditionBlock`;
- `EquipmentAccessoriesChips`;
- `EquipmentHistoryList`.

## 14.5 Catálogos

Componentes sugeridos:

- `CatalogServiceCard`;
- `CatalogPartCard`;
- `CatalogItemPicker`;
- `ItemPriceEditor`.

## 14.6 Configurações

Componentes sugeridos:

- `SettingsGroup`;
- `SettingsRow`;
- `CompanyLogoPicker`;
- `PdfTemplatePreview`;
- `BackupStatusCard`.

---

# 15. Padrões de tela

## 15.1 Home

Objetivo:

```txt
Mostrar o estado operacional e permitir criar uma nova OS rapidamente.
```

Hierarquia:

1. Saudação e nome da empresa;
2. CTA Nova OS;
3. Resumo por status;
4. OS recentes;
5. Alerta de backup, se necessário.

Regras:

- não mostrar métricas demais;
- não transformar Home em relatório;
- destacar Nova OS;
- exibir no máximo 3 a 5 OS recentes;
- link para ver todas as OS.

---

## 15.2 Lista de OS

Objetivo:

```txt
Encontrar, filtrar e abrir ordens de serviço.
```

Elementos:

- título;
- busca;
- filtros em chips;
- lista de OS;
- botão flutuante ou CTA Nova OS.

Card de OS deve mostrar:

- número da OS;
- cliente;
- equipamento ou descrição;
- status;
- prioridade, se relevante;
- data;
- valor total;
- pendência de pagamento, se houver.

Regra:

- lista deve ser escaneável;
- não colocar todos os detalhes dentro do card;
- detalhes completos ficam na tela da OS.

---

## 15.3 Nova OS

Objetivo:

```txt
Criar uma OS sem sobrecarregar o usuário.
```

Formato recomendado:

- fluxo em etapas;
- progresso no topo;
- botões avançar/voltar;
- salvar rascunho;
- poucos campos obrigatórios.

Etapas:

1. Cliente;
2. Equipamento;
3. Problema;
4. Peças e serviços;
5. Valores;
6. Assinatura e termos;
7. Revisão.

Regra:

- usuário deve conseguir criar OS básica mesmo sem preencher todos os campos.

---

## 15.4 Detalhes da OS

Objetivo:

```txt
Controlar uma OS específica do início ao fim.
```

Topo:

- número da OS;
- status;
- cliente;
- equipamento;
- data de abertura.

Blocos:

- Status e prioridade;
- Cliente;
- Equipamento;
- Problema relatado;
- Diagnóstico;
- Peças e serviços;
- Valores;
- Fotos;
- Assinaturas;
- PDF;
- Histórico de alterações.

CTA principal:

- antes de gerar PDF: `Gerar PDF`;
- depois de gerar PDF: `Compartilhar PDF`.

---

## 15.5 Clientes

Objetivo:

```txt
Cadastrar, buscar e acessar histórico de clientes.
```

Card de cliente:

- nome;
- telefone/WhatsApp;
- documento, se houver;
- quantidade de OS;
- último atendimento;
- status.

Regra:

- botão de criar OS para cliente deve ser acessível no detalhe do cliente.

---

## 15.6 Equipamentos

Objetivo:

```txt
Identificar equipamentos e manter histórico técnico.
```

Card de equipamento:

- tipo/categoria;
- marca/modelo;
- cliente;
- número de série, se houver;
- último atendimento;
- status de histórico.

Regra:

- equipamento deve ter vínculo claro com cliente;
- não duplicar dados longos do cliente no card.

---

## 15.7 Catálogo de peças e serviços

Objetivo:

```txt
Acelerar o preenchimento da OS.
```

Lista deve mostrar:

- nome;
- categoria;
- valor padrão;
- status ativo/inativo.

Regra:

- catálogo não é estoque na V1;
- não exibir quantidade disponível se o sistema ainda não controla estoque.

---

## 15.8 Configurações

Objetivo:

```txt
Controlar empresa, PDF, backup e preferências.
```

Grupos:

- Empresa;
- PDF e termos;
- Backup;
- Aparência;
- Segurança;
- Sobre.

Regra:

- itens críticos como backup devem ter destaque;
- textos legais devem ficar organizados.

---

# 16. Formulários

## 16.1 Padrão geral

Formulários devem ser divididos em seções claras.

Exemplo para cliente:

1. Identificação;
2. Contato;
3. Endereço;
4. Observações.

Exemplo para equipamento:

1. Cliente proprietário;
2. Identificação do equipamento;
3. Estado físico;
4. Acessórios;
5. Fotos e observações.

Exemplo para OS:

1. Cliente e equipamento;
2. Problema;
3. Diagnóstico;
4. Itens;
5. Valores;
6. Termos e assinatura.

## 16.2 Campos obrigatórios

Campos obrigatórios devem ser poucos e visíveis.

Obrigatórios mínimos:

- cliente: nome e telefone/WhatsApp;
- equipamento: cliente e tipo/categoria;
- OS: cliente e descrição do problema/serviço;
- empresa: nome e telefone.

## 16.3 Validação

Mensagens devem ser diretas:

- Informe o nome do cliente.
- Informe um telefone ou WhatsApp.
- Selecione um cliente para continuar.
- Informe a descrição do problema ou serviço.
- O valor não pode ser negativo.

## 16.4 Máscaras

Usar máscaras para:

- CPF;
- CNPJ;
- telefone;
- CEP;
- moeda;
- datas.

Não bloquear o usuário caso o documento não esteja preenchido.

---

# 17. Listas

## 17.1 Estrutura padrão

Toda lista deve ter:

- título da tela;
- busca;
- filtro quando necessário;
- estado vazio;
- estado carregando;
- estado erro;
- item clicável;
- ação de adicionar.

## 17.2 Densidade

Lista profissional deve ser compacta, mas legível.

Regras:

- card com padding 14 a 16;
- distância entre cards 10 a 12;
- máximo 3 linhas principais antes de metadados;
- detalhes completos ficam na tela de detalhe.

---

# 18. Modais e bottom sheets

## 18.1 Quando usar modal

Usar modal para:

- confirmar exclusão;
- confirmar cancelamento de OS;
- aviso de alteração em OS entregue;
- selecionar status;
- selecionar forma de pagamento;
- filtros avançados.

## 18.2 Quando usar bottom sheet

Usar bottom sheet para:

- ações rápidas;
- selecionar cliente/equipamento dentro da OS;
- adicionar item rápido;
- escolher origem do atendimento;
- selecionar acessórios.

## 18.3 Regras

- modal deve ter título claro;
- texto curto;
- botão primário e secundário;
- ação destrutiva com cor de perigo;
- não usar modal para formulário longo.

---

# 19. Estados de interface

## 19.1 Loading

Usar skeleton leve em listas e cards.

Evitar spinner central para tudo.

## 19.2 Empty

Sempre explicar o próximo passo.

Exemplo:

```txt
Nenhum cliente cadastrado.
Cadastre o primeiro cliente para criar uma OS.
[Adicionar cliente]
```

## 19.3 Error

Erro deve indicar ação:

```txt
Não foi possível carregar os dados.
Tente novamente ou verifique o armazenamento local.
```

## 19.4 Success

Confirmações rápidas:

- Cliente salvo;
- OS criada;
- PDF gerado;
- Backup exportado;
- Assinatura registrada.

## 19.5 Offline

Como o app é offline-first, não mostrar erro de internet para funções locais.

Mostrar indicação apenas quando o usuário tentar:

- compartilhar;
- comprar premium;
- fazer backup em nuvem futuro;
- abrir link externo.

---

# 20. Acessibilidade

## 20.1 Toque

Área mínima tocável:

```txt
44px x 44px
```

Botões principais:

```txt
48px a 56px de altura
```

## 20.2 Contraste

- Texto principal deve ter alto contraste.
- Texto secundário não deve ficar claro demais.
- Badges precisam ser legíveis em light e dark.

## 20.3 Texto escalável

O layout deve suportar aumento moderado de fonte.

Evitar:

- textos importantes dentro de largura fixa;
- botões com texto cortado;
- cards sem altura flexível.

## 20.4 Labels

Inputs devem ter label persistente, não apenas placeholder.

---

# 21. Responsividade

## 21.1 Celular pequeno

Regras:

- padding horizontal 16;
- cards em uma coluna;
- botões principais em largura total;
- evitar grids com mais de 2 colunas;
- bottom tab com texto curto;
- formulários em uma coluna.

## 21.2 Celular grande

Regras:

- padding horizontal 20;
- grids de status podem ter 2 colunas;
- cards podem respirar mais;
- listas continuam em uma coluna.

## 21.3 Tablet

Regras:

- limitar largura de formulários a 720px ou 840px;
- centralizar conteúdo quando necessário;
- dashboards podem usar grid 2 colunas;
- tela de detalhes pode usar layout mestre/detalhe no futuro;
- não esticar campos demais.

## 21.4 Orientação horizontal

V1 não precisa ter layout específico para landscape, mas não deve quebrar.

---

# 22. Design do PDF

O PDF é parte central da experiência e deve seguir identidade profissional.

## 22.1 Objetivo visual do PDF

O PDF deve parecer uma ordem de serviço empresarial, organizada e confiável.

Deve evitar aparência de:

- recibo improvisado;
- print de tela;
- formulário amador;
- documento poluído.

## 22.2 Formato

Padrão:

```txt
A4 vertical
Margem: 24px a 32px
Cabeçalho: forte e institucional
Rodapé: discreto
```

## 22.3 Estrutura

Ordem recomendada:

1. Cabeçalho da empresa;
2. Identificação da OS;
3. Dados do cliente;
4. Dados do equipamento;
5. Problema relatado;
6. Diagnóstico técnico;
7. Peças e serviços;
8. Resumo financeiro;
9. Termos e garantia;
10. Fotos, quando habilitadas;
11. Assinaturas;
12. Rodapé.

## 22.4 Cabeçalho do PDF

Layout:

- logo à esquerda;
- dados da empresa ao centro/esquerda;
- bloco da OS à direita;
- linha divisória abaixo.

Conteúdo:

- nome da empresa;
- CPF/CNPJ;
- telefone/WhatsApp;
- e-mail;
- endereço;
- número da OS;
- data de abertura;
- status.

## 22.5 Seções do PDF

Cada seção deve ter:

- título em caixa normal ou semibold;
- fundo leve ou linha superior;
- conteúdo em tabela simples ou pares label/valor;
- espaçamento suficiente.

Exemplo visual:

```txt
DADOS DO CLIENTE
Nome: João Silva
Telefone: (41) 99999-9999
Documento: 000.000.000-00
Endereço: Rua X, 123 — Curitiba/PR
```

## 22.6 Tabela de itens

Colunas:

- Tipo;
- Descrição;
- Quantidade;
- Valor unitário;
- Desconto;
- Total.

Regras:

- cabeçalho com fundo suave;
- bordas finas;
- valores alinhados à direita;
- descrição alinhada à esquerda;
- total em negrito.

## 22.7 Resumo financeiro

Deve ficar em bloco destacado, preferencialmente à direita ou em largura controlada.

Campos:

- subtotal serviços;
- subtotal peças;
- outros custos;
- desconto;
- total;
- valor pago;
- valor pendente.

Regra:

- total deve ser o dado mais forte;
- pendente deve ter destaque se maior que zero.

## 22.8 Termos

Texto legal deve ser legível, mas não dominar o documento.

Características:

- fonte menor;
- espaçamento adequado;
- sem excesso de negrito;
- quebra de página controlada.

## 22.9 Fotos no PDF

Quando habilitadas:

- usar grade simples;
- legenda curta;
- limite por página;
- evitar fotos gigantes;
- comprimir imagens;
- não quebrar assinatura por causa das fotos.

## 22.10 Assinaturas

Estrutura:

- duas colunas quando possível;
- linha de assinatura;
- nome;
- documento;
- data e hora.

Assinaturas:

- cliente;
- técnico;
- responsável pela retirada, se diferente.

## 22.11 Rodapé

Deve conter:

- texto configurável;
- página, se viável;
- identificação do app discreta, quando versão grátis.

Exemplo:

```txt
Documento gerado pelo OrdemPro — OS nº 000123 — Página 1 de 2
```

## 22.12 Cores do PDF

Usar:

- `primary` para cabeçalho, linhas e destaques;
- `secondary` para títulos;
- `border` para tabelas;
- `text` para conteúdo;
- `muted` para rodapé e labels.

Não usar dark mode no PDF. PDF deve ser claro e imprimível.

---

# 23. Tema claro e escuro

## 23.1 Light mode

Deve ser o tema padrão.

Motivo:

- uso profissional;
- melhor leitura em campo;
- compatível com PDF;
- aparência mais limpa para cadastros.

## 23.2 Dark mode

Deve existir sem quebrar contraste.

Regras:

- não usar preto puro como fundo principal;
- usar superfícies com diferença clara;
- badges precisam ser adaptados;
- inputs devem continuar legíveis;
- PDF continua claro.

## 23.3 Alternância de tema

Opções:

- seguir sistema;
- claro;
- escuro.

---

# 24. Premium e anúncios no design

## 24.1 Premium

Se premium for ativado, o bloqueio deve ser limpo e profissional.

PremiumLock deve mostrar:

- título claro;
- benefício;
- recurso bloqueado;
- botão para desbloquear;
- alternativa grátis, se houver.

Exemplo:

```txt
PDF sem marca d’água
Gere documentos com a identidade completa da sua empresa.
[Desbloquear Premium]
```

## 24.2 Anúncios

Se houver anúncios na versão grátis:

- não aparecer no meio da criação da OS;
- não cobrir botão principal;
- não aparecer durante assinatura;
- não aparecer sobre visualização de PDF;
- preferir locais secundários.

Locais aceitáveis:

- após PDF gerado;
- tela de configurações;
- tela de histórico;
- versão gratuita com frequência limitada.

---

# 25. Tokens sugeridos para código

## 25.1 Estrutura de arquivos

```txt
src/constants/colors.ts
src/constants/spacing.ts
src/constants/typography.ts
src/constants/radius.ts
src/constants/shadows.ts
src/constants/status.ts
```

## 25.2 Colors

```ts
export const lightColors = {
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  primary: '#1E4FD7',
  primaryDark: '#173EA8',
  primarySoft: '#E8EEFF',
  secondary: '#0F172A',
  accent: '#0EA5E9',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#DBEAFE',
  text: '#111827',
  textSecondary: '#4B5563',
  muted: '#6B7280',
  disabled: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#EEF2F7',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

export const darkColors = {
  background: '#0B1120',
  surface: '#111827',
  surfaceAlt: '#1F2937',
  primary: '#5B7CFA',
  primaryDark: '#405DD8',
  primarySoft: 'rgba(91, 124, 250, 0.18)',
  secondary: '#F9FAFB',
  accent: '#38BDF8',
  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.18)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  info: '#60A5FA',
  infoSoft: 'rgba(96, 165, 250, 0.16)',
  text: '#F9FAFB',
  textSecondary: '#CBD5E1',
  muted: '#94A3B8',
  disabled: '#64748B',
  border: '#334155',
  divider: '#1F2937',
  overlay: 'rgba(0, 0, 0, 0.62)',
};
```

## 25.3 Spacing

```ts
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};
```

## 25.4 Radius

```ts
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 999,
};
```

## 25.5 Typography

```ts
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  title: { fontSize: 18, lineHeight: 26, fontWeight: '700' },
  subtitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  money: { fontSize: 22, lineHeight: 30, fontWeight: '700' },
  number: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
} as const;
```

---

# 26. Regras para imagens de referência

As imagens das telas devem seguir este design system.

Prompt base para as imagens:

```md
Crie uma tela mobile 9:16 para o app OrdemPro.

Contexto:
App profissional offline para gestão de ordens de serviço, clientes, equipamentos, peças, serviços e PDF.

Design system:
Visual profissional, limpo e técnico. Fundo #F4F6F8, cards brancos, cor primária #1E4FD7, textos #111827, bordas suaves #E5E7EB, cards arredondados, hierarquia clara, CTA principal evidente.

Regras:
- app em português brasileiro;
- não usar texto genérico em inglês;
- não duplicar informações;
- não poluir a tela;
- layout viável em React Native;
- respeitar área segura;
- parecer app real pronto para loja.
```

---

# 27. Regras para Codex

Ao implementar a base visual, o Codex deve:

- criar tokens globais;
- criar componentes globais antes das telas;
- não implementar telas completas ainda;
- preservar rotas existentes;
- não criar lógica de dados dentro dos componentes visuais;
- manter suporte a tema claro e escuro;
- usar TypeScript sem `any` desnecessário;
- limpar imports;
- rodar typecheck.

Primeira tarefa visual segura:

```md
Implemente apenas a base visual global do OrdemPro.

Referências:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md

Faça:
- tokens de cores;
- spacing;
- typography;
- radius;
- shadows;
- status colors;
- ScreenContainer;
- AppCard;
- AppButton;
- AppHeader;
- InputField;
- SearchInput;
- StatusBadge;
- EmptyState;
- SectionTitle.

Não implemente telas completas.
Não implemente storage.
Não implemente PDF.
Não implemente premium.

Ao final:
- remover imports não usados;
- rodar npm run typecheck;
- corrigir erros encontrados.
```

---

# 28. Checklist de qualidade visual

Antes de aprovar qualquer tela, verificar:

```txt
[ ] A tela tem objetivo claro?
[ ] Existe apenas um CTA principal?
[ ] Há excesso de cards?
[ ] O usuário sabe o que fazer?
[ ] As informações não estão duplicadas?
[ ] Os campos obrigatórios são poucos?
[ ] A busca está visível em listas?
[ ] O status da OS está claro?
[ ] Valores financeiros estão bem formatados?
[ ] O layout funciona em celular pequeno?
[ ] O layout funciona em tablet?
[ ] O dark mode mantém contraste?
[ ] O visual está alinhado com app profissional?
[ ] O PDF mantém aparência empresarial?
```

---

# 29. Decisão final de design

O OrdemPro deve usar uma identidade visual corporativa, limpa e técnica.

A experiência principal deve priorizar:

```txt
rapidez no cadastro → clareza na OS → confiança no PDF → segurança no histórico
```

O app não deve tentar impressionar com excesso visual. Deve transmitir eficiência, organização e profissionalismo.

A regra final deste design system é:

```txt
Toda tela deve ajudar o usuário a criar, encontrar, controlar ou finalizar uma ordem de serviço com clareza.
```
