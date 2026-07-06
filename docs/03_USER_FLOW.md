# User Flow — OrdemPro

## 1. Identificação

**Arquivo:** `docs/03_USER_FLOW.md`  
**App:** OrdemPro  
**Categoria:** Gestão de ordens de serviço, assistência técnica e serviços profissionais  
**Stack prevista:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Modo de funcionamento:** Offline-first  
**Documentos base:**

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`

Este documento define os fluxos de navegação, jornadas do usuário, estados de tela, regras de decisão e comportamento esperado do OrdemPro antes da criação das imagens e das Screen Specs.

---

# 2. Objetivo do User Flow

O User Flow existe para garantir que o app seja construído em torno de jornadas reais de trabalho, evitando telas soltas, excesso de etapas, duplicação de informação e funções fora da V1.

O fluxo principal do OrdemPro deve permitir que o usuário consiga:

```txt
Cadastrar empresa → Cadastrar cliente → Cadastrar equipamento → Criar OS → Adicionar peças/serviços → Calcular valores → Coletar assinatura → Gerar PDF → Compartilhar → Acompanhar status → Fazer backup
```

O app deve ser rápido para criar uma OS simples, mas completo para registrar uma OS profissional.

---

# 3. Princípios de fluxo

## 3.1 Offline-first

O app deve funcionar sem internet para:

- abrir o app;
- cadastrar empresa;
- cadastrar cliente;
- cadastrar equipamento;
- cadastrar serviço;
- cadastrar peça;
- criar OS;
- editar OS;
- alterar status;
- adicionar fotos;
- coletar assinatura;
- gerar PDF;
- visualizar histórico;
- buscar registros;
- exportar backup local.

Internet só deve ser necessária para ações externas, como:

- compartilhar PDF por apps de terceiros;
- enviar por WhatsApp, e-mail ou outro app;
- validar premium, quando existir;
- anúncios, se forem ativados no futuro;
- backup em nuvem, se entrar em versão futura.

## 3.2 Fluxo rápido antes de fluxo completo

O app deve permitir dois tipos de uso:

### Uso rápido

Para técnicos que precisam abrir uma OS em poucos minutos.

```txt
Nova OS → Cliente → Descrição do problema → Salvar
```

### Uso completo

Para empresas que precisam de documentação detalhada.

```txt
Nova OS → Cliente → Equipamento → Problema → Diagnóstico → Peças → Serviços → Valores → Fotos → Assinaturas → PDF
```

## 3.3 Poucos campos obrigatórios

O app pode ter muitos campos disponíveis, mas poucos obrigatórios.

Campos obrigatórios mínimos:

- cliente: nome e telefone ou WhatsApp;
- equipamento: categoria ou descrição simples, quando houver equipamento;
- OS: cliente, descrição do problema ou serviço solicitado, status e data de abertura;
- PDF: empresa configurada, número da OS, cliente e descrição da solicitação.

## 3.4 Uma ação principal por tela

Cada tela deve ter uma ação principal evidente.

Exemplos:

- Home: `Nova OS`;
- Clientes: `Novo cliente`;
- Equipamentos: `Novo equipamento`;
- Lista de OS: `Nova OS`;
- Detalhes da OS: `Gerar PDF` ou `Continuar OS`, dependendo do status;
- Configurações: `Salvar alterações`.

## 3.5 Dados reutilizáveis

O usuário não deve digitar a mesma informação várias vezes.

O app deve reutilizar:

- dados da empresa no PDF;
- dados do cliente na OS;
- dados do equipamento na OS;
- serviços cadastrados dentro da OS;
- peças cadastradas dentro da OS;
- termos padrão no PDF;
- garantia padrão no serviço ou na empresa.

---

# 4. Mapa geral de navegação

## 4.1 Entrada do app

```txt
Abrir app
↓
Verificar se empresa está configurada
↓
Se não configurada → Onboarding da empresa
↓
Se configurada → Home
```

## 4.2 Abas principais

```txt
Home
OS
Clientes
Equipamentos
Configurações
```

## 4.3 Rotas sugeridas

```txt
/onboarding/company
/home
/orders
/orders/new
/orders/[id]
/orders/[id]/items
/orders/[id]/photos
/orders/[id]/signatures
/orders/[id]/pdf
/customers
/customers/new
/customers/[id]
/equipments
/equipments/new
/equipments/[id]
/catalog/services
/catalog/parts
/settings
/settings/company
/settings/pdf
/settings/terms
/settings/backup
/settings/security
```

## 4.4 Hierarquia de navegação

```txt
Root Layout
├── Onboarding
│   └── Dados da empresa
├── Tabs
│   ├── Home
│   ├── OS
│   ├── Clientes
│   ├── Equipamentos
│   └── Configurações
├── Stack interno de OS
│   ├── Nova OS
│   ├── Detalhes da OS
│   ├── Itens
│   ├── Fotos
│   ├── Assinaturas
│   └── PDF
├── Stack interno de Clientes
│   ├── Novo cliente
│   └── Detalhes do cliente
├── Stack interno de Equipamentos
│   ├── Novo equipamento
│   └── Detalhes do equipamento
└── Stack interno de Configurações
    ├── Empresa
    ├── PDF
    ├── Termos
    ├── Backup
    └── Segurança
```

---

# 5. Fluxo 1 — Primeiro acesso

## 5.1 Objetivo

Configurar a empresa antes do usuário criar a primeira OS, garantindo que o PDF já tenha cabeçalho profissional.

## 5.2 Entrada

```txt
Usuário abre o app pela primeira vez
↓
Sistema verifica ausência de CompanyProfile
↓
Exibe onboarding da empresa
```

## 5.3 Etapas do onboarding

### Etapa 1 — Boas-vindas

Objetivo: explicar rapidamente o valor do app.

Conteúdo:

- nome do app;
- frase curta: “Crie ordens de serviço profissionais mesmo sem internet.”;
- botão principal: `Começar`.

### Etapa 2 — Dados principais da empresa

Campos:

- nome da empresa;
- nome fantasia;
- CPF/CNPJ;
- responsável;
- telefone;
- WhatsApp;
- e-mail.

Obrigatórios:

- nome da empresa;
- telefone ou WhatsApp.

### Etapa 3 — Endereço e logo

Campos:

- logo;
- endereço;
- número;
- bairro;
- cidade;
- estado;
- CEP.

Obrigatórios:

- nenhum campo obrigatório nesta etapa, exceto se o usuário quiser PDF mais completo.

### Etapa 4 — Termos padrão

Campos:

- garantia padrão;
- autorização de serviço;
- termo de retirada;
- responsabilidade sobre dados;
- prazo para retirada.

Comportamento:

- app deve preencher textos padrão editáveis;
- usuário pode pular e ajustar depois.

### Etapa 5 — Conclusão

Mostra:

- resumo da empresa;
- botão principal: `Ir para o app`;
- ação secundária: `Editar dados`.

## 5.4 Saída

```txt
Onboarding concluído
↓
Salvar CompanyProfile localmente
↓
Enviar usuário para Home
```

## 5.5 Estados

### Estado inicial

Sem dados da empresa.

### Estado incompleto

Dados obrigatórios ausentes.

Mensagem:

```txt
Preencha ao menos o nome da empresa e um telefone ou WhatsApp.
```

### Estado de erro

Falha ao salvar localmente.

Mensagem:

```txt
Não foi possível salvar os dados da empresa. Tente novamente.
```

### Estado de sucesso

Empresa salva.

Mensagem:

```txt
Empresa configurada com sucesso.
```

---

# 6. Fluxo 2 — Uso diário pela Home

## 6.1 Objetivo

Permitir que o usuário entenda rapidamente a situação do negócio e acesse a criação de OS.

## 6.2 Entrada

```txt
Usuário abre o app após onboarding concluído
↓
Sistema carrega dados locais
↓
Exibe Home
```

## 6.3 Elementos da Home

- saudação ou nome da empresa;
- botão principal `Nova OS`;
- busca rápida;
- cards de status;
- lista de OS recentes;
- atalhos para clientes e equipamentos;
- alerta de backup, se necessário.

## 6.4 Fluxo principal da Home

```txt
Home
↓
Usuário toca em Nova OS
↓
Abrir fluxo de criação de OS
```

## 6.5 Fluxos secundários da Home

### Buscar uma OS

```txt
Home → Busca rápida → Digita número, cliente, telefone ou equipamento → Resultado → Detalhes da OS
```

### Abrir OS recente

```txt
Home → OS recente → Detalhes da OS
```

### Ver status

```txt
Home → Card de status → Lista de OS filtrada
```

### Criar cliente

```txt
Home → Atalho Cliente → Novo cliente
```

### Criar equipamento

```txt
Home → Atalho Equipamento → Novo equipamento
```

## 6.6 Estados da Home

### Sem dados

Quando não há OS cadastradas.

Mensagem:

```txt
Nenhuma ordem de serviço criada ainda.
```

CTA:

```txt
Criar primeira OS
```

### Com dados

Exibe OS recentes e indicadores.

### Sem backup recente

Quando último backup for antigo.

Mensagem discreta:

```txt
Seu último backup foi há mais de 7 dias.
```

Ação:

```txt
Fazer backup
```

### Erro de leitura local

Mensagem:

```txt
Não foi possível carregar os dados locais.
```

Ação:

```txt
Tentar novamente
```

---

# 7. Fluxo 3 — Criar nova OS

## 7.1 Objetivo

Criar uma ordem de serviço com cliente, equipamento, problema, itens, valores, fotos, assinatura e PDF.

## 7.2 Entrada

```txt
Home ou Lista de OS
↓
Usuário toca em Nova OS
↓
Abrir fluxo guiado
```

## 7.3 Estrutura do fluxo guiado

Etapas recomendadas:

```txt
1. Cliente
2. Equipamento
3. Problema
4. Peças e serviços
5. Valores e pagamento
6. Fotos e assinatura
7. Revisão e PDF
```

## 7.4 Etapa 1 — Cliente

### Objetivo

Selecionar cliente existente ou criar cliente novo sem sair do fluxo.

### Caminho A — Cliente existente

```txt
Nova OS → Cliente → Buscar cliente → Selecionar → Próxima etapa
```

### Caminho B — Cliente novo

```txt
Nova OS → Cliente → Novo cliente rápido → Salvar → Próxima etapa
```

### Campos do cliente rápido

Obrigatórios:

- nome;
- telefone ou WhatsApp.

Opcionais:

- CPF/CNPJ;
- e-mail;
- endereço;
- observações.

### Regra

O fluxo de OS não deve obrigar cadastro completo do cliente. Dados avançados podem ser preenchidos depois.

## 7.5 Etapa 2 — Equipamento

### Objetivo

Selecionar equipamento vinculado ao cliente ou criar novo equipamento.

### Caminho A — OS com equipamento

```txt
Selecionar cliente → Ver equipamentos do cliente → Selecionar equipamento → Próxima etapa
```

### Caminho B — Novo equipamento

```txt
Selecionar cliente → Novo equipamento rápido → Salvar → Próxima etapa
```

### Caminho C — Serviço sem equipamento

```txt
Selecionar cliente → Marcar “Serviço sem equipamento” → Próxima etapa
```

### Campos do equipamento rápido

Obrigatórios:

- categoria ou descrição simples.

Opcionais:

- marca;
- modelo;
- número de série;
- estado físico;
- acessórios;
- fotos.

### Regra

Uma OS pode existir sem equipamento quando for serviço geral, visita técnica, instalação ou atendimento sem item físico.

## 7.6 Etapa 3 — Problema

### Objetivo

Registrar o motivo da abertura da OS.

### Campos

Obrigatórios:

- defeito relatado ou descrição do serviço solicitado.

Opcionais:

- condições informadas pelo cliente;
- quando o problema começou;
- problema intermitente;
- houve queda;
- houve contato com líquido;
- houve tentativa de reparo;
- observações iniciais;
- prioridade;
- previsão de conclusão.

### Saída

```txt
Problema registrado
↓
Criar rascunho local da OS, se ainda não existir
↓
Prosseguir para peças e serviços
```

## 7.7 Etapa 4 — Peças e serviços

### Objetivo

Adicionar itens cobrados ou apenas descritivos à OS.

### Caminhos

```txt
Adicionar serviço cadastrado
Adicionar serviço manual
Adicionar peça cadastrada
Adicionar peça manual
Adicionar outro custo
Pular etapa
```

### Serviço dentro da OS

Campos:

- descrição;
- quantidade;
- valor unitário;
- desconto;
- garantia específica;
- técnico responsável;
- observação.

### Peça dentro da OS

Campos:

- descrição;
- quantidade;
- valor unitário;
- desconto;
- garantia específica;
- condição: nova, usada, recondicionada, fornecida pelo cliente;
- observação.

### Regras

- OS pode ser criada sem item, mas deve alertar antes do PDF final se não houver valor nem serviço descrito.
- Itens devem calcular total automaticamente.
- Usuário pode editar valor manualmente.
- Itens podem ter valor zero.

## 7.8 Etapa 5 — Valores e pagamento

### Objetivo

Revisar cálculo da OS e registrar pagamento básico.

### Campos

- subtotal de serviços;
- subtotal de peças;
- outros custos;
- desconto geral;
- total;
- valor pago;
- valor pendente;
- forma de pagamento;
- condição de pagamento;
- validade do orçamento;
- garantia em dias.

### Regras

- total = serviços + peças + outros custos - descontos;
- valor pendente = total - valor pago;
- desconto não pode deixar total negativo;
- valor pago não deve ser maior que total sem confirmação;
- forma de pagamento pode ficar vazia.

## 7.9 Etapa 6 — Fotos e assinatura

### Objetivo

Registrar evidências e autorização.

### Fotos possíveis

- entrada;
- defeito;
- diagnóstico;
- peça substituída;
- serviço concluído;
- entrega.

### Assinaturas possíveis

- assinatura do cliente na abertura;
- assinatura do cliente na aprovação;
- assinatura do cliente na retirada;
- assinatura do técnico.

### Regras

- assinatura não deve ser obrigatória para salvar OS;
- assinatura pode ser obrigatória para alguns modelos de PDF, se configurado;
- fotos devem ser comprimidas;
- app deve avisar que muitas fotos aumentam o tamanho do backup.

## 7.10 Etapa 7 — Revisão e PDF

### Objetivo

Permitir revisão antes de gerar o documento.

### Exibir resumo

- número da OS;
- cliente;
- equipamento;
- problema;
- status;
- itens;
- total;
- garantia;
- assinaturas;
- fotos selecionadas para PDF.

### Ações

- `Salvar OS`;
- `Gerar PDF`;
- `Compartilhar PDF`;
- `Editar etapa`;
- `Finalizar depois`.

### Saídas possíveis

```txt
Salvar OS → Detalhes da OS
Gerar PDF → Preview do PDF
Compartilhar PDF → Share Sheet do sistema
Finalizar depois → Detalhes da OS com status atual
```

---

# 8. Fluxo 4 — Detalhes da OS

## 8.1 Objetivo

Controlar uma OS específica após sua criação.

## 8.2 Entrada

```txt
Lista de OS → Selecionar OS
Home → OS recente
Cliente → Histórico → OS
Equipamento → Histórico → OS
Busca global → Resultado de OS
```

## 8.3 Seções da tela

- cabeçalho com número da OS;
- status e prioridade;
- dados do cliente;
- dados do equipamento;
- problema relatado;
- diagnóstico;
- peças e serviços;
- valores;
- fotos;
- assinaturas;
- PDF;
- histórico de alterações.

## 8.4 Ações principais por status

| Status | CTA principal | Ações secundárias |
|---|---|---|
| Aberta | Iniciar diagnóstico | Editar, adicionar foto, cancelar |
| Em diagnóstico | Enviar orçamento | Adicionar diagnóstico, adicionar itens |
| Aguardando aprovação | Marcar como aprovada | Compartilhar PDF/orçamento, cancelar |
| Aprovada | Iniciar execução | Editar itens, adicionar foto |
| Em execução | Concluir serviço | Adicionar serviço, registrar pagamento |
| Aguardando peça | Registrar peça recebida | Editar previsão, avisar cliente |
| Concluída | Registrar entrega | Gerar PDF final, coletar assinatura |
| Entregue | Ver PDF | Reabrir com confirmação, duplicar OS |
| Cancelada | Ver histórico | Reabrir com confirmação |

## 8.5 Alteração de status

```txt
Detalhes da OS → Tocar no status → Escolher novo status → Confirmar → Salvar histórico
```

### Regras

- Toda alteração de status deve registrar data e hora.
- Alterar para `Entregue` deve sugerir assinatura de retirada.
- Alterar para `Cancelada` deve pedir motivo.
- Reabrir OS entregue deve exigir confirmação.

## 8.6 Editar OS

```txt
Detalhes da OS → Editar → Alterar campos → Salvar → Atualizar OS → Regenerar PDF, se necessário
```

### Regra

Se já existir PDF gerado, após edição o app deve mostrar:

```txt
Esta OS foi alterada após a geração do PDF. Gere um novo PDF para atualizar o documento.
```

## 8.7 Excluir ou cancelar OS

Na V1, a preferência deve ser cancelar, não excluir.

```txt
Detalhes da OS → Cancelar OS → Informar motivo → Confirmar → Status Cancelada
```

Exclusão definitiva, se existir, deve ficar protegida por confirmação forte.

---

# 9. Fluxo 5 — PDF da OS

## 9.1 Objetivo

Gerar documento profissional com dados da empresa, cliente, equipamento, serviços, peças, valores, termos, fotos e assinaturas.

## 9.2 Entrada

```txt
Detalhes da OS → Gerar PDF
Nova OS → Revisão → Gerar PDF
OS concluída → Gerar PDF final
```

## 9.3 Verificações antes do PDF

O sistema deve validar:

- empresa configurada;
- número da OS;
- cliente vinculado;
- descrição da solicitação;
- dados essenciais para o modelo escolhido.

## 9.4 Dados opcionais no PDF

O usuário pode configurar se o PDF exibe:

- valores;
- fotos;
- assinatura;
- diagnóstico;
- observações internas, não recomendado por padrão;
- termos completos;
- rodapé personalizado;
- marca do app, na versão grátis.

## 9.5 Fluxo de geração

```txt
Tocar em Gerar PDF
↓
Validar dados
↓
Montar HTML/template interno
↓
Aplicar estilo do PDF
↓
Gerar arquivo local
↓
Salvar registro em ServiceOrderPdf
↓
Abrir preview
```

## 9.6 Preview do PDF

Ações:

- visualizar;
- compartilhar;
- salvar novamente;
- regenerar;
- voltar para OS.

## 9.7 Compartilhar PDF

```txt
Preview do PDF → Compartilhar → Abrir share sheet → Usuário escolhe WhatsApp, e-mail ou outro app
```

### Regra

Se não houver app compatível, mostrar mensagem:

```txt
Não encontramos um aplicativo disponível para compartilhar este PDF.
```

## 9.8 Regenerar PDF

```txt
Detalhes da OS → PDF existente → Regenerar → Confirmar → Gerar nova versão
```

### Regra

O app pode manter histórico simples de PDFs gerados ou substituir a versão anterior na V1. Se manter histórico, indicar data e hora.

## 9.9 Estados do PDF

### Sem PDF

CTA:

```txt
Gerar PDF
```

### PDF gerado

Ações:

```txt
Visualizar
Compartilhar
Regenerar
```

### PDF desatualizado

Mensagem:

```txt
A OS foi editada após a geração deste PDF.
```

CTA:

```txt
Gerar PDF atualizado
```

### Erro ao gerar

Mensagem:

```txt
Não foi possível gerar o PDF. Verifique os dados da OS e tente novamente.
```

---

# 10. Fluxo 6 — Clientes

## 10.1 Objetivo

Cadastrar, buscar e consultar clientes com histórico completo.

## 10.2 Entrada

```txt
Aba Clientes
Nova OS → Selecionar cliente
Busca global → Resultado de cliente
```

## 10.3 Lista de clientes

Elementos:

- busca;
- botão `Novo cliente`;
- lista em cards;
- filtros simples;
- estado vazio.

## 10.4 Criar cliente

```txt
Clientes → Novo cliente → Preencher dados → Salvar → Detalhes do cliente
```

## 10.5 Criar cliente dentro da OS

```txt
Nova OS → Cliente → Novo cliente rápido → Salvar → Voltar ao fluxo da OS
```

## 10.6 Detalhes do cliente

Seções:

- dados principais;
- contatos;
- endereço;
- observações;
- equipamentos;
- OS abertas;
- OS concluídas;
- total gasto;
- PDFs vinculados.

Ações:

- editar cliente;
- criar OS para cliente;
- adicionar equipamento;
- ver histórico;
- inativar cliente.

## 10.7 Regras

- Cliente pode ser inativado sem apagar histórico.
- Excluir cliente com OS vinculada deve ser bloqueado ou exigir confirmação forte.
- Cliente duplicado deve ser sugerido quando telefone, CPF/CNPJ ou nome forem semelhantes.

## 10.8 Estados

### Sem clientes

Mensagem:

```txt
Nenhum cliente cadastrado ainda.
```

CTA:

```txt
Cadastrar cliente
```

### Busca sem resultado

Mensagem:

```txt
Nenhum cliente encontrado.
```

CTA:

```txt
Criar novo cliente
```

---

# 11. Fluxo 7 — Equipamentos

## 11.1 Objetivo

Cadastrar equipamentos vinculados a clientes e preservar histórico técnico.

## 11.2 Entrada

```txt
Aba Equipamentos
Detalhes do cliente → Adicionar equipamento
Nova OS → Novo equipamento rápido
Busca global → Resultado de equipamento
```

## 11.3 Lista de equipamentos

Elementos:

- busca;
- botão `Novo equipamento`;
- filtro por categoria;
- cards com cliente, marca, modelo e histórico;
- estado vazio.

## 11.4 Criar equipamento

```txt
Equipamentos → Novo equipamento → Selecionar cliente → Preencher dados → Salvar → Detalhes do equipamento
```

## 11.5 Criar equipamento dentro da OS

```txt
Nova OS → Equipamento → Novo equipamento rápido → Salvar → Voltar ao fluxo da OS
```

## 11.6 Detalhes do equipamento

Seções:

- cliente proprietário;
- categoria;
- marca/modelo;
- número de série;
- acessórios;
- estado físico;
- fotos;
- observações técnicas;
- histórico de OS;
- garantias anteriores.

Ações:

- editar equipamento;
- criar OS para equipamento;
- adicionar foto;
- transferir para outro cliente, se permitido;
- inativar equipamento.

## 11.7 Regras

- Equipamento deve sempre ter cliente proprietário.
- OS antiga deve manter vínculo histórico mesmo se equipamento for editado.
- Excluir equipamento com OS vinculada deve ser bloqueado ou exigir confirmação forte.
- Equipamento pode ser inativado sem apagar histórico.

## 11.8 Estados

### Sem equipamentos

Mensagem:

```txt
Nenhum equipamento cadastrado ainda.
```

CTA:

```txt
Cadastrar equipamento
```

### Cliente sem equipamentos

Mensagem:

```txt
Este cliente ainda não possui equipamentos cadastrados.
```

CTA:

```txt
Adicionar equipamento
```

---

# 12. Fluxo 8 — Catálogo de serviços

## 12.1 Objetivo

Permitir que o usuário cadastre serviços frequentes para acelerar a criação da OS.

## 12.2 Entrada

```txt
Configurações → Catálogo de serviços
Nova OS → Peças e serviços → Adicionar serviço → Gerenciar serviços
```

## 12.3 Criar serviço cadastrado

```txt
Catálogo de serviços → Novo serviço → Preencher dados → Salvar
```

Campos:

- nome;
- categoria;
- descrição padrão;
- valor padrão;
- tempo estimado;
- garantia padrão;
- observações;
- status.

## 12.4 Usar serviço na OS

```txt
OS → Adicionar serviço → Selecionar serviço cadastrado → Ajustar quantidade/valor → Adicionar
```

## 12.5 Regras

- Alterar serviço no catálogo não deve alterar OS antigas.
- Serviço pode ser inativado sem apagar histórico.
- Serviço manual pode ser adicionado sem estar no catálogo.

---

# 13. Fluxo 9 — Catálogo de peças

## 13.1 Objetivo

Permitir cadastro simples de peças frequentes, sem virar estoque completo na V1.

## 13.2 Entrada

```txt
Configurações → Catálogo de peças
Nova OS → Peças e serviços → Adicionar peça → Gerenciar peças
```

## 13.3 Criar peça cadastrada

```txt
Catálogo de peças → Nova peça → Preencher dados → Salvar
```

Campos:

- nome;
- código interno;
- categoria;
- marca;
- modelo compatível;
- custo;
- preço de venda;
- unidade;
- observações;
- status.

## 13.4 Usar peça na OS

```txt
OS → Adicionar peça → Selecionar peça cadastrada → Ajustar quantidade/valor/condição → Adicionar
```

## 13.5 Regras

- V1 não controla quantidade em estoque.
- Alterar peça no catálogo não deve alterar OS antigas.
- Peça manual pode ser adicionada sem estar no catálogo.
- Peça fornecida pelo cliente pode ter valor zero.

---

# 14. Fluxo 10 — Busca global

## 14.1 Objetivo

Encontrar rapidamente OS, cliente ou equipamento.

## 14.2 Entrada

```txt
Home → Busca rápida
Lista de OS → Busca
Clientes → Busca
Equipamentos → Busca
```

## 14.3 Termos buscáveis

A busca deve localizar:

- número da OS;
- código curto da OS;
- nome do cliente;
- telefone;
- CPF/CNPJ;
- e-mail;
- marca;
- modelo;
- número de série;
- código patrimonial;
- serviço;
- peça;
- status.

## 14.4 Resultado da busca

Agrupar por tipo:

```txt
Ordens de Serviço
Clientes
Equipamentos
Peças/Serviços
```

## 14.5 Estados

### Antes da busca

Mensagem auxiliar:

```txt
Busque por cliente, telefone, OS, equipamento ou número de série.
```

### Sem resultado

Mensagem:

```txt
Nenhum resultado encontrado.
```

Ações possíveis:

- criar cliente;
- criar OS;
- limpar busca.

---

# 15. Fluxo 11 — Backup e restauração

## 15.1 Objetivo

Proteger dados locais do usuário em um app offline.

## 15.2 Entrada

```txt
Configurações → Backup
Home → Alerta de backup antigo
```

## 15.3 Exportar backup

```txt
Configurações → Backup → Exportar backup → Gerar arquivo → Compartilhar/salvar
```

## 15.4 Dados incluídos

- empresa;
- clientes;
- equipamentos;
- OS;
- itens;
- serviços cadastrados;
- peças cadastradas;
- pagamentos;
- termos;
- configurações;
- referências de fotos;
- assinaturas;
- PDFs, se viável no formato `.zip`.

## 15.5 Importar backup

```txt
Configurações → Backup → Importar backup → Selecionar arquivo → Validar → Confirmar → Restaurar dados
```

## 15.6 Regras de segurança

- Antes de importar, avisar que dados atuais podem ser substituídos ou mesclados.
- Preferir opção de criar backup atual antes de restaurar.
- Validar versão do backup.
- Exibir data do último backup.
- Alertar periodicamente sobre backup antigo.

## 15.7 Estados

### Sem backup feito

Mensagem:

```txt
Você ainda não fez nenhum backup.
```

CTA:

```txt
Fazer primeiro backup
```

### Backup recente

Mensagem:

```txt
Último backup realizado em [data].
```

### Backup antigo

Mensagem:

```txt
Seu último backup está antigo. Exporte uma cópia para evitar perda de dados.
```

### Erro ao importar

Mensagem:

```txt
Não foi possível importar este backup. Verifique se o arquivo é válido.
```

---

# 16. Fluxo 12 — Configurações

## 16.1 Objetivo

Permitir ajustes de empresa, PDF, termos, backup, tema e segurança.

## 16.2 Entrada

```txt
Aba Configurações
```

## 16.3 Seções

```txt
Empresa
PDF
Termos padrão
Catálogo de serviços
Catálogo de peças
Backup
Tema
Segurança
Sobre o app
Política de privacidade
```

## 16.4 Dados da empresa

```txt
Configurações → Empresa → Editar dados → Salvar
```

Após editar, PDFs futuros devem usar os novos dados.

## 16.5 Configurações de PDF

```txt
Configurações → PDF → Escolher opções → Salvar
```

Opções:

- cor principal;
- exibir fotos;
- exibir valores;
- exibir assinatura;
- exibir marca do app;
- modelo do PDF;
- rodapé.

## 16.6 Termos padrão

```txt
Configurações → Termos → Editar textos → Salvar
```

Termos:

- garantia;
- autorização de serviço;
- retirada;
- responsabilidade sobre dados;
- equipamentos não retirados;
- peças fornecidas pelo cliente;
- orçamento não aprovado.

## 16.7 Tema

```txt
Configurações → Tema → Sistema / Claro / Escuro → Salvar
```

## 16.8 Segurança

```txt
Configurações → Segurança → Ativar PIN/biometria, se disponível
```

Para V1, segurança pode ser simples ou ficar para V1.1 se atrasar a publicação.

---

# 17. Fluxo 13 — Premium futuro

## 17.1 Objetivo

Definir comportamento de premium sem implementar antes do app básico funcionar.

## 17.2 Entrada possível

```txt
Usuário atinge limite gratuito
Usuário tenta remover marca do PDF
Usuário tenta usar modelo avançado de PDF
Usuário tenta exportar relatório avançado
```

## 17.3 Fluxo premium

```txt
Recurso bloqueado
↓
Mostrar PremiumLock
↓
Explicar benefício
↓
Botão Ver planos
↓
Tela Premium
↓
Compra
↓
Desbloqueio
```

## 17.4 Regras

- Premium não deve bloquear criação básica de OS na fase inicial.
- Bloqueio deve explicar claramente o benefício.
- App deve continuar funcionando se RevenueCat falhar.
- Verificação deve ser centralizada em `usePremium`.

## 17.5 Recursos premium sugeridos

- OS ilimitadas;
- remover marca do app no PDF;
- modelos avançados de PDF;
- fotos ilimitadas por OS;
- assinatura avançada;
- exportação CSV;
- relatórios;
- backup avançado;
- biometria;
- campos personalizados.

---

# 18. Estados globais do app

## 18.1 Usuário novo

Condição:

```txt
CompanyProfile inexistente
```

Destino:

```txt
Onboarding da empresa
```

## 18.2 Usuário recorrente

Condição:

```txt
CompanyProfile existente
```

Destino:

```txt
Home
```

## 18.3 Sem dados operacionais

Condição:

```txt
Sem clientes, equipamentos ou OS
```

Comportamento:

- mostrar empty states;
- destacar `Criar primeira OS`;
- não mostrar dashboards vazios poluídos.

## 18.4 Dados carregando

Mesmo sendo local, o app pode ter estado de carregamento.

Uso:

- carregar SQLite;
- carregar imagens;
- gerar PDF;
- exportar backup.

## 18.5 Erro local

Possíveis causas:

- falha de leitura SQLite;
- falha de escrita;
- arquivo ausente;
- imagem removida;
- PDF não encontrado.

Comportamento:

- mensagem clara;
- botão tentar novamente;
- quando possível, ação alternativa.

## 18.6 Sem internet

Como o app é offline-first, ausência de internet não deve bloquear uso.

Mensagem só deve aparecer em ações externas:

```txt
Você está sem internet. O app continua funcionando, mas o compartilhamento pode depender de outros aplicativos.
```

## 18.7 Premium inativo

Mostrar bloqueios apenas em recursos premium.

## 18.8 Premium ativo

Desbloquear recursos premium, sem alterar o fluxo principal da OS.

---

# 19. Fluxos de erro e prevenção

## 19.1 Fechar app durante nova OS

Comportamento esperado:

```txt
Usuário preenche dados mínimos
↓
App salva rascunho local
↓
Se app fechar, rascunho pode ser recuperado
```

## 19.2 Tentar sair com alterações não salvas

Mensagem:

```txt
Você tem alterações não salvas. Deseja sair mesmo assim?
```

Ações:

- continuar editando;
- descartar;
- salvar rascunho.

## 19.3 Cliente duplicado

Quando nome, telefone ou CPF/CNPJ forem semelhantes:

```txt
Encontramos um cliente parecido. Deseja usar o cadastro existente?
```

Ações:

- usar existente;
- criar mesmo assim.

## 19.4 Equipamento duplicado

Quando número de série, marca/modelo e cliente forem semelhantes:

```txt
Este equipamento pode já estar cadastrado para este cliente.
```

## 19.5 PDF sem dados suficientes

Mensagem:

```txt
Faltam dados mínimos para gerar o PDF.
```

Mostrar checklist:

- empresa;
- cliente;
- descrição da solicitação;
- número da OS.

## 19.6 Falha ao compartilhar

Mensagem:

```txt
Não foi possível compartilhar o arquivo. O PDF foi salvo localmente.
```

## 19.7 Foto removida do aparelho

Mensagem:

```txt
Uma foto vinculada não foi encontrada no dispositivo.
```

Ações:

- remover referência;
- escolher nova foto.

---

# 20. Regras de navegação por tela

## 20.1 Home

Entrada padrão após onboarding.

Ações:

- nova OS;
- buscar;
- abrir OS recente;
- abrir lista filtrada;
- fazer backup.

Não deve:

- ter formulário longo;
- exibir todos os dados financeiros;
- duplicar lista completa de OS.

## 20.2 OS

Aba para gestão operacional.

Ações:

- listar;
- filtrar;
- buscar;
- criar;
- abrir detalhes.

Não deve:

- editar muitos campos diretamente na lista.

## 20.3 Clientes

Aba para cadastro e histórico.

Ações:

- criar;
- buscar;
- abrir detalhes;
- iniciar OS para cliente.

Não deve:

- misturar todos os equipamentos de todos os clientes sem contexto.

## 20.4 Equipamentos

Aba para histórico técnico.

Ações:

- criar;
- buscar;
- filtrar por categoria;
- abrir detalhes;
- iniciar OS para equipamento.

Não deve:

- substituir a lista de OS.

## 20.5 Configurações

Aba para preferências e dados administrativos.

Ações:

- editar empresa;
- editar PDF;
- editar termos;
- backup;
- tema;
- segurança.

Não deve:

- conter operações principais de OS, exceto catálogos auxiliares.

---

# 21. Fluxo de dados entre entidades

## 21.1 Relação principal

```txt
CompanyProfile
↓
ServiceOrderPdf

Customer
↓
Equipment
↓
ServiceOrder
↓
ServiceOrderItem
↓
Payment / Signature / Photo / PDF
```

## 21.2 Cliente para OS

```txt
Cliente criado
↓
Pode receber vários equipamentos
↓
Pode ter várias OS
↓
Histórico mostra OS e equipamentos
```

## 21.3 Equipamento para OS

```txt
Equipamento criado
↓
Vinculado a um cliente
↓
Pode ter várias OS ao longo do tempo
↓
Histórico técnico preservado
```

## 21.4 Catálogo para OS

```txt
Serviço/peça cadastrado
↓
Usuário adiciona na OS
↓
Dados são copiados para item da OS
↓
Alterações futuras no catálogo não mudam OS antiga
```

## 21.5 OS para PDF

```txt
OS criada/editada
↓
PDF gerado com snapshot dos dados atuais
↓
Se OS for editada depois, PDF fica marcado como desatualizado
```

---

# 22. Comportamento em celular pequeno

## 22.1 Regras

- Fluxos longos devem ser divididos em etapas.
- Cards devem ter informação resumida.
- Formulários devem usar seções recolhíveis, quando necessário.
- Botão principal deve ficar visível ao final da tela ou fixo em rodapé seguro.
- Evitar tabelas largas no app; usar cards para itens.
- PDF pode ter tabela, mas app mobile deve usar cards.

## 22.2 Nova OS em celular pequeno

Usar fluxo por etapas:

```txt
Cliente → Equipamento → Problema → Itens → Valores → Revisão
```

Não colocar todos os campos em uma única tela.

## 22.3 Detalhes da OS em celular pequeno

Usar seções:

- resumo;
- cliente;
- equipamento;
- problema;
- itens;
- valores;
- fotos;
- assinaturas;
- PDF.

---

# 23. Comportamento em tablet

## 23.1 Regras

- Aproveitar largura maior com cards em duas colunas.
- Listas podem ter layout mestre-detalhe no futuro.
- Não esticar campos excessivamente.
- Manter largura máxima para formulários.
- PDF preview pode ocupar área maior.

## 23.2 Possível layout em tablet

```txt
Lista de OS à esquerda
Detalhe selecionado à direita
```

Esse comportamento é opcional para V1. O mínimo é o app funcionar bem em tablet sem quebrar.

---

# 24. Fluxos fora da V1

Não implementar na V1:

- login obrigatório;
- sincronização em nuvem;
- multiusuário;
- painel web;
- nota fiscal;
- estoque completo;
- agenda complexa;
- CRM;
- portal do cliente;
- IA para diagnóstico;
- WhatsApp Business API;
- relatórios avançados;
- múltiplas empresas.

Esses fluxos devem ser documentados como futuros, mas não devem aparecer como botões ativos na V1.

---

# 25. Critérios de aceitação do User Flow

O fluxo do app será considerado correto quando:

- primeiro acesso direciona para configuração da empresa;
- usuário recorrente entra direto na Home;
- Home permite iniciar uma OS rapidamente;
- cliente pode ser criado dentro e fora da OS;
- equipamento pode ser criado dentro e fora da OS;
- OS pode existir com ou sem equipamento;
- OS pode ser salva como rascunho;
- peças e serviços podem ser adicionados manualmente ou por catálogo;
- valores são calculados automaticamente;
- assinatura e fotos são opcionais;
- PDF pode ser gerado e compartilhado;
- PDF avisa quando está desatualizado;
- histórico por cliente funciona;
- histórico por equipamento funciona;
- busca encontra OS, cliente e equipamento;
- backup manual está acessível;
- app não bloqueia funções principais sem internet;
- fluxo funciona em celular pequeno;
- fluxo funciona em tablet;
- telas não duplicam ações desnecessárias;
- cada tela tem uma função clara.

---

# 26. Próxima etapa

Após aprovação deste User Flow, o próximo documento deve ser:

```txt
docs/05_DATA_MODEL.md
```

Antes de enviar telas ao Codex, ainda será necessário criar:

```txt
docs/04_SCREEN_SPECS.md
```

Porém, o Data Model deve vir antes das Screen Specs detalhadas para garantir que as telas usem dados reais e consistentes.
