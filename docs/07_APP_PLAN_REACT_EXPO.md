# 07_APP_PLAN_REACT_EXPO - OrdemPro

## 1. Resumo do app

O OrdemPro sera um app mobile offline-first para tecnicos, assistencias e prestadores de servico criarem, acompanharem e finalizarem ordens de servico profissionais.

Stack principal:

- React Native com Expo
- TypeScript
- Expo Router
- SQLite local
- Geracao local de PDF
- Armazenamento local de fotos, assinaturas, PDFs e backups

Fluxo central:

```txt
Empresa -> Cliente -> Equipamento -> OS -> Itens -> Valores -> Fotos/Assinaturas -> PDF -> Compartilhamento -> Historico -> Backup
```

## 2. Direcao visual

As imagens `00_board_completo_ordempro.png` e `37_pdf_os_exemplo.png` definem uma interface profissional, limpa e objetiva.

Principios visuais:

- fundo claro e neutro;
- azul como cor primaria;
- cards brancos com borda suave;
- formularios compactos e legiveis;
- uma acao principal por tela;
- bottom tab com 5 areas;
- PDF A4 empresarial, claro e imprimivel;
- telas mobile-first, mas sem quebrar em tablet.

A tela nao deve parecer landing page. A primeira experiencia util do app deve ser operacional: configurar empresa, criar OS, buscar registros e gerar PDF.

## 3. Escopo da V1

Entra na V1:

- onboarding de empresa;
- home operacional;
- clientes;
- equipamentos;
- catalogo simples de servicos;
- catalogo simples de pecas;
- criacao e edicao de OS;
- status da OS;
- calculo de valores;
- fotos;
- assinatura;
- PDF profissional;
- compartilhamento;
- busca e filtros basicos;
- backup e restauracao manual;
- tema claro/escuro preparado.

Fica fora da V1:

- login obrigatorio;
- sincronizacao em nuvem;
- multiusuario;
- estoque completo;
- nota fiscal;
- agenda complexa;
- painel web;
- CRM;
- WhatsApp Business API;
- IA;
- premium real antes do fluxo principal estar estavel.

## 4. Arquitetura recomendada

Estrutura base:

```txt
app/
  _layout.tsx
  onboarding/company.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    orders.tsx
    customers.tsx
    equipments.tsx
    settings.tsx
  orders/
    new.tsx
    [id].tsx
    [id]/pdf.tsx
  customers/
    new.tsx
    [id].tsx
  equipments/
    new.tsx
    [id].tsx
  catalog/
    services.tsx
    parts.tsx
  settings/
    company.tsx
    pdf.tsx
    backup.tsx
    security.tsx

src/
  components/
    ui/
    onboarding/
    home/
    orders/
    customers/
    equipments/
    catalog/
    settings/
    pdf/
  constants/
  database/
  hooks/
  repositories/
  services/
  types/
  utils/
```

Regra de camadas:

```txt
Tela -> Hook -> Repository/Service -> SQLite/FileSystem
```

Telas nao devem acessar SQLite diretamente. Regras de calculo, status, PDF, backup e arquivos devem ficar em services.

## 5. Dependencias Expo provaveis

Base:

- `expo`
- `expo-router`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler`

Dados e arquivos:

- `expo-sqlite`
- `expo-file-system`
- `expo-document-picker`
- `expo-sharing`

Midia:

- `expo-image-picker`
- `expo-image-manipulator`

PDF:

- `expo-print`
- `expo-sharing`

Assinatura:

- avaliar biblioteca compativel com Expo para signature pad, ou implementar via canvas/webview se necessario.

Icones:

- `lucide-react-native` ou `@expo/vector-icons`

Instalar novas dependencias somente quando a tarefa especifica exigir.

## 6. Entidades principais

Entidades da V1:

- `CompanyProfile`
- `PdfSettings`
- `DefaultTerms`
- `Customer`
- `Equipment`
- `ServiceCatalogItem`
- `PartCatalogItem`
- `ServiceOrder`
- `ServiceOrderItem`
- `Payment`
- `PhotoAttachment`
- `SignatureRecord`
- `ServiceOrderPdf`
- `ServiceOrderStatusHistory`
- `OrderDraft`
- `BackupMetadata`
- `AppSettings`

Regras globais:

- IDs como UUID local em string;
- datas como ISO string;
- dinheiro em centavos;
- booleanos como 0/1 no SQLite;
- fotos, assinaturas e PDFs por `localUri`;
- soft delete para dados com historico;
- OS cancelada nao apaga historico;
- PDF guarda snapshot e fica desatualizado quando a OS muda.

## 7. Navegacao principal

Primeiro acesso:

```txt
Abrir app -> verificar CompanyProfile -> onboarding se ausente -> Home se existente
```

Tabs:

- Home
- OS
- Clientes
- Equipamentos
- Configuracoes

Fluxo Nova OS:

```txt
Cliente -> Equipamento -> Problema -> Pecas/Servicos -> Valores -> Fotos/Assinatura -> Revisao/PDF
```

O app deve permitir OS rapida:

```txt
Nova OS -> Cliente -> Descricao do problema -> Salvar
```

## 8. Telas da V1

Onboarding:

- boas-vindas;
- dados da empresa;
- endereco e logo;
- termos padrao;
- conclusao.

Home:

- saudacao;
- CTA `Nova OS`;
- busca rapida;
- atalhos;
- resumo por status;
- OS recentes;
- alerta de backup antigo.

Ordens de servico:

- lista com busca e filtros;
- fluxo guiado de criacao;
- detalhe da OS;
- status e historico;
- itens, valores, fotos, assinaturas e PDF.

Clientes:

- lista;
- novo cliente;
- detalhe com historico;
- criar OS para cliente.

Equipamentos:

- lista;
- novo equipamento;
- detalhe com historico tecnico;
- criar OS para equipamento.

Catalogos:

- servicos frequentes;
- pecas frequentes;
- sem estoque completo na V1.

Configuracoes:

- empresa;
- PDF;
- termos;
- backup;
- tema;
- seguranca preparada;
- sobre.

## 9. PDF da OS

O PDF deve seguir `37_pdf_os_exemplo.png`.

Estrutura:

1. Cabecalho com logo, empresa e numero da OS.
2. Dados do cliente.
3. Dados do equipamento.
4. Fotos do servico, se habilitadas.
5. Defeito relatado.
6. Diagnostico.
7. Servicos.
8. Pecas.
9. Valores.
10. Termos e condicoes.
11. Assinaturas.
12. Rodape.

Regras:

- PDF claro, A4 vertical e imprimivel;
- valores alinhados e formatados em BRL;
- observacoes internas nao entram por padrao;
- respeitar configuracoes de exibir fotos, valores e assinaturas;
- salvar versao e snapshot;
- permitir compartilhar pelo share sheet.

## 10. Plano de implementacao

### Fase 0 - Scaffold e auditoria

Objetivo: criar ou validar o projeto Expo.

Entregas:

- projeto Expo com TypeScript;
- Expo Router configurado;
- scripts `typecheck` e `lint`, se aplicavel;
- `AGENTS.md` na raiz;
- estrutura `app/` e `src/`.

### Fase 1 - Base visual

Objetivo: implementar tokens e componentes globais antes das telas.

Entregas:

- cores, spacing, typography, radius, shadows;
- tema claro/escuro;
- `ScreenContainer`;
- `AppCard`;
- `AppButton`;
- `AppHeader`;
- `InputField`;
- `SearchInput`;
- `StatusBadge`;
- `EmptyState`;
- `SectionTitle`;
- `BottomActionBar`.

### Fase 2 - Modelo local

Objetivo: criar tipos, SQLite, migrations e repositorios.

Entregas:

- tipos TypeScript;
- schema SQLite V1;
- migrations;
- seeds de settings, termos e app meta;
- repositories;
- hooks principais.

### Fase 3 - Onboarding e navegacao

Objetivo: garantir entrada correta do app.

Entregas:

- gate de onboarding;
- fluxo de empresa;
- salvar `CompanyProfile`;
- redirecionar para Home;
- tabs principais.

### Fase 4 - Cadastros

Objetivo: permitir dados reutilizaveis.

Entregas:

- clientes;
- equipamentos;
- catalogo de servicos;
- catalogo de pecas;
- busca local em listas;
- validacoes minimas.

### Fase 5 - Ordem de servico

Objetivo: implementar o coracao do app.

Entregas:

- fluxo `Nova OS`;
- rascunho;
- numero sequencial;
- itens de servico/peca;
- calculo de valores;
- detalhe da OS;
- status e historico;
- cancelamento com motivo.

### Fase 6 - Midia, assinatura e PDF

Objetivo: transformar OS em documento profissional.

Entregas:

- fotos com `localUri`;
- compressao de imagem;
- assinatura local;
- template HTML do PDF;
- geracao local;
- preview/estado do PDF;
- compartilhar PDF.

### Fase 7 - Backup

Objetivo: proteger dados offline.

Entregas:

- exportar backup JSON;
- importar backup validado;
- registrar ultimo backup;
- alerta de backup antigo;
- preparar ZIP com arquivos se viavel.

### Fase 8 - Polimento e build

Objetivo: preparar V1 para teste real.

Entregas:

- revisao de responsividade;
- tema claro/escuro;
- empty/loading/error states;
- typecheck;
- lint, se existir;
- build Android;
- preparacao iOS.

## 11. MVP testavel

O primeiro marco testavel deve permitir:

1. configurar empresa;
2. cadastrar cliente;
3. cadastrar equipamento;
4. criar OS com problema relatado;
5. adicionar servico ou peca;
6. calcular total;
7. alterar status;
8. gerar PDF;
9. compartilhar PDF;
10. encontrar a OS na lista.

Backup e assinatura podem entrar logo depois se o objetivo for validar o fluxo principal mais rapido.

## 12. Riscos tecnicos

PDF:

- pode exigir ajustes de HTML/CSS para renderizar bem no `expo-print`.
- deve ser testado cedo, pois e parte central do produto.

Assinatura:

- pode depender de biblioteca com compatibilidade real no Expo.
- se ficar instavel, implementar como V1.1 sem bloquear OS e PDF.

Fotos:

- precisam ser comprimidas.
- backup deve considerar tamanho e arquivos ausentes.

SQLite:

- migrations devem ser simples e versionadas desde o inicio.
- transacao e essencial para numero sequencial da OS.

Escopo:

- evitar estoque completo, financeiro avancado e premium antes do fluxo principal estar solido.

## 13. Definition of Done da V1

A V1 esta pronta quando:

- app abre sem crash;
- onboarding funciona;
- dados persistem offline;
- clientes e equipamentos funcionam;
- OS pode ser criada, editada e acompanhada;
- valores sao calculados corretamente;
- PDF profissional e gerado localmente;
- PDF pode ser compartilhado;
- busca e filtros basicos funcionam;
- backup manual funciona;
- app funciona em celular pequeno;
- app funciona em tablet;
- tema claro/escuro nao quebra;
- typecheck passa;
- build Android passa;
- iOS esta preparado para build.

## 14. Proxima acao recomendada

Como a raiz ainda parece conter somente documentacao, a proxima acao e iniciar o projeto Expo com TypeScript e Expo Router.

Depois seguir:

```txt
Scaffold Expo -> AGENTS.md -> estrutura src -> tokens/UI base -> tipos -> SQLite -> onboarding -> clientes/equipamentos -> OS -> PDF
```

