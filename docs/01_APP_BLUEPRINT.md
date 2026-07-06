# App Blueprint — OrdemPro

## 1. Identificação do projeto

**Nome provisório:** OrdemPro  
**Categoria:** Produtividade, negócios, gestão de serviços e assistência técnica  
**Plataforma:** Android e iOS  
**Modo de funcionamento:** Offline-first  
**Stack planejada:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Arquivo:** `docs/01_APP_BLUEPRINT.md`

## 2. Frase do produto

O **OrdemPro** ajuda técnicos, assistências e prestadores de serviço a cadastrar clientes, equipamentos, peças e serviços, criar ordens de serviço completas e gerar PDFs profissionais mesmo sem internet.

## 3. Objetivo do app

Criar um sistema mobile completo, profissional e offline para gerenciamento de ordens de serviço. O app deve substituir papel, planilhas e anotações soltas, permitindo que o prestador registre todo o ciclo do atendimento: cliente, equipamento, defeito relatado, diagnóstico, peças, serviços, valores, fotos, assinaturas, status, histórico e PDF final.

O app deve ser simples para uso diário, mas robusto o suficiente para parecer um sistema profissional de empresa.

## 4. Público-alvo

### Público principal

- Técnicos autônomos;
- Assistências técnicas pequenas e médias;
- Prestadores de serviço em campo;
- Oficinas e lojas de manutenção;
- Empresas que ainda usam papel, WhatsApp ou planilhas para controlar OS.

### Segmentos atendidos

- Assistência técnica de celulares;
- Manutenção de notebooks e computadores;
- Eletrônicos em geral;
- Ar-condicionado e refrigeração;
- Elétrica residencial e comercial;
- Hidráulica;
- Oficinas mecânicas;
- Manutenção industrial simples;
- Instalação de equipamentos;
- Prestadores de reparos gerais.

## 5. Problema principal

Muitos prestadores de serviço ainda registram atendimentos de maneira informal. Isso gera perda de dados, confusão sobre orçamento, dificuldade para comprovar o que foi combinado, PDFs amadores, falta de histórico do cliente, ausência de controle de equipamentos e pouca organização financeira básica.

Além disso, muitos técnicos trabalham em locais sem internet estável. Portanto, o app precisa funcionar offline, com dados salvos localmente no aparelho.

## 6. Promessa principal

Permitir que qualquer técnico ou empresa pequena crie uma OS profissional em poucos minutos, com dados completos, fotos, peças, serviços, valores, assinatura e PDF organizado para entregar ao cliente.

## 7. Diferencial do app

O diferencial do OrdemPro é unir três pontos em um fluxo simples:

1. **Uso offline real:** cadastro, edição, histórico e geração de PDF sem internet.
2. **PDF profissional:** documento visualmente organizado, com logo, dados da empresa, cliente, equipamento, itens, valores, termos e assinaturas.
3. **Cadastro completo:** clientes, equipamentos, peças, serviços e histórico vinculados, evitando informações soltas.

## 8. Escopo da V1

A V1 deve ser completa para o fluxo essencial de uma ordem de serviço, sem tentar virar um ERP completo.

### Entra na V1

- Configuração da empresa;
- Cadastro de clientes;
- Cadastro de equipamentos;
- Cadastro de serviços prestados;
- Cadastro de peças utilizadas;
- Criação e edição de OS;
- Status da OS;
- Fotos do equipamento e do serviço;
- Assinatura do cliente;
- Assinatura do técnico ou responsável;
- Geração de PDF profissional;
- Compartilhamento do PDF;
- Histórico por cliente e por equipamento;
- Busca e filtros básicos;
- Backup manual local;
- Configurações de termos e garantia.

### Não entra na V1

- Login obrigatório;
- Sincronização em nuvem;
- Multiusuário;
- Controle avançado de estoque;
- Emissão de nota fiscal;
- Integração com WhatsApp Business API;
- Painel web;
- Relatórios avançados;
- Agenda complexa de técnicos;
- Portal do cliente;
- IA para diagnóstico;
- CRM completo;
- Múltiplas empresas no mesmo aparelho.

## 9. Estrutura geral do produto

O app será organizado em cinco áreas principais:

1. **Home:** visão geral das OS e atalhos principais.
2. **Ordens de Serviço:** lista, filtros, criação, edição e detalhes.
3. **Clientes:** cadastro, edição e histórico.
4. **Equipamentos:** cadastro, edição e vínculo com clientes.
5. **Configurações:** empresa, PDF, termos, backup e preferências.

## 10. Jornada principal do usuário

1. Usuário abre o app pela primeira vez.
2. Configura os dados da empresa.
3. Adiciona logo e informações comerciais.
4. Acessa a Home.
5. Toca em **Nova OS**.
6. Seleciona ou cadastra um cliente.
7. Seleciona ou cadastra um equipamento.
8. Registra o defeito relatado.
9. Adiciona diagnóstico, serviços, peças e valores.
10. Define prazo, garantia e status.
11. Adiciona fotos, se necessário.
12. Coleta assinatura do cliente.
13. Gera PDF profissional.
14. Compartilha o PDF com o cliente.
15. Atualiza o status até conclusão e entrega.
16. Consulta o histórico quando necessário.

## 11. Cadastro da empresa

O cadastro da empresa alimenta o cabeçalho e o rodapé do PDF.

### Campos fundamentais

- Nome da empresa;
- Nome fantasia;
- CPF ou CNPJ;
- Inscrição estadual ou municipal, opcional;
- Nome do responsável;
- Telefone;
- WhatsApp;
- E-mail;
- Site;
- Instagram;
- Endereço completo;
- Bairro;
- Cidade;
- Estado;
- CEP;
- Logo da empresa;
- Assinatura padrão do responsável, opcional.

### Campos de configuração do PDF

- Texto padrão de garantia;
- Texto padrão de autorização de serviço;
- Texto padrão de retirada do equipamento;
- Texto padrão sobre responsabilidade de dados;
- Texto padrão sobre equipamentos não retirados;
- Rodapé personalizado;
- Cor principal do PDF;
- Exibir ou ocultar fotos no PDF;
- Exibir ou ocultar assinatura no PDF;
- Exibir ou ocultar valores no PDF;
- Modelo padrão do documento.

## 12. Cadastro de clientes

O cadastro de cliente deve ser completo, pois será usado no histórico e no PDF.

### Campos fundamentais

- Tipo de cliente: pessoa física ou pessoa jurídica;
- Nome completo ou razão social;
- Nome fantasia, quando empresa;
- CPF ou CNPJ;
- RG ou inscrição estadual, opcional;
- Telefone principal;
- WhatsApp;
- E-mail;
- Endereço completo;
- Número;
- Complemento;
- Bairro;
- Cidade;
- Estado;
- CEP;
- Observações gerais;
- Data de cadastro;
- Data da última atualização.

### Campos complementares

- Contato secundário;
- Telefone secundário;
- Origem do cliente: indicação, Google, Instagram, loja, recorrente, outro;
- Tipo de cliente: particular, empresa, VIP, recorrente, inadimplente;
- Documento anexado, opcional;
- Preferência de contato;
- Observações internas;
- Status do cliente: ativo, inativo, bloqueado.

### Histórico vinculado ao cliente

Cada cliente deve permitir visualizar:

- Todas as OS abertas;
- Todas as OS concluídas;
- Equipamentos cadastrados;
- Total gasto;
- Último atendimento;
- Serviços recorrentes;
- PDFs gerados;
- Observações internas.

## 13. Cadastro de equipamentos

O equipamento deve ser vinculado ao cliente. Isso evita perda de histórico e melhora a organização técnica.

### Campos fundamentais

- Cliente proprietário;
- Categoria do equipamento;
- Tipo do equipamento;
- Marca;
- Modelo;
- Número de série;
- Código patrimonial;
- Cor;
- Voltagem;
- Ano, quando aplicável;
- Estado físico na entrada;
- Acessórios recebidos;
- Fotos do equipamento;
- Observações técnicas;
- Data de cadastro.

### Categorias sugeridas

- Celular;
- Notebook;
- Computador;
- Impressora;
- Monitor;
- Tablet;
- Televisão;
- Ar-condicionado;
- Geladeira;
- Máquina de lavar;
- Micro-ondas;
- Ferramenta elétrica;
- Veículo;
- Equipamento industrial;
- Outro.

### Acessórios recebidos

O app deve permitir marcar ou digitar acessórios:

- Carregador;
- Cabo USB;
- Fonte;
- Controle remoto;
- Capa;
- Película;
- Bateria;
- Cartão de memória;
- Chip;
- Bolsa;
- Caixa;
- Manual;
- Nota fiscal;
- Outros.

### Estado físico

O app deve permitir registrar:

- Sem avarias aparentes;
- Arranhado;
- Amassado;
- Trincado;
- Tela quebrada;
- Peça faltando;
- Oxidação;
- Sinais de queda;
- Sinais de violação;
- Molhado ou oxidado;
- Não liga;
- Liga parcialmente;
- Outro.

### Histórico vinculado ao equipamento

Cada equipamento deve mostrar:

- OS anteriores;
- Defeitos recorrentes;
- Peças já trocadas;
- Serviços anteriores;
- Fotos antigas;
- Garantias anteriores;
- Última entrada;
- Última entrega.

## 14. Ordem de Serviço

A OS é o centro do app.

### Campos de identificação

- ID interno;
- Número sequencial da OS;
- Código curto da OS;
- Cliente vinculado;
- Equipamento vinculado, opcional em serviços sem equipamento;
- Técnico responsável;
- Data e hora de abertura;
- Data prevista de conclusão;
- Data de conclusão;
- Data de entrega;
- Status;
- Prioridade;
- Origem do atendimento: balcão, visita, WhatsApp, telefone, contrato, outro.

### Status da OS

Status recomendados para a V1:

- Aberta;
- Em diagnóstico;
- Aguardando aprovação;
- Aprovada;
- Em execução;
- Aguardando peça;
- Concluída;
- Entregue;
- Cancelada.

### Prioridade

- Baixa;
- Normal;
- Alta;
- Urgente.

### Dados do problema

- Defeito relatado pelo cliente;
- Condições informadas pelo cliente;
- Quando o problema começou;
- Se o problema é intermitente;
- Se houve queda, líquido, curto, mau uso ou tentativa de reparo anterior;
- Observações do atendimento inicial.

### Dados técnicos

- Diagnóstico técnico;
- Testes realizados;
- Causa provável;
- Serviço recomendado;
- Serviço executado;
- Peças substituídas;
- Peças não substituídas;
- Recomendações ao cliente;
- Observações internas;
- Observações exibidas ao cliente.

### Dados comerciais

- Valor de mão de obra;
- Valor de peças;
- Outros custos;
- Desconto;
- Valor total;
- Valor de sinal;
- Valor pago;
- Valor pendente;
- Forma de pagamento;
- Condição de pagamento;
- Garantia em dias;
- Validade do orçamento;
- Aprovado pelo cliente: sim ou não;
- Data de aprovação.

### Assinaturas

- Assinatura do cliente na abertura;
- Assinatura do cliente na retirada;
- Assinatura do técnico;
- Nome do responsável pela retirada;
- Documento do responsável pela retirada;
- Data e hora da assinatura.

### Fotos e anexos

- Fotos de entrada;
- Fotos do defeito;
- Fotos do diagnóstico;
- Fotos de peças substituídas;
- Fotos do serviço concluído;
- Fotos da entrega;
- Documentos anexos, se necessário.

## 15. Peças

O app deve permitir incluir peças dentro da OS e também manter um cadastro simples de peças para reutilização.

### Cadastro simples de peça

- Nome da peça;
- Código interno;
- Categoria;
- Marca;
- Modelo compatível;
- Custo;
- Preço de venda;
- Unidade: unidade, metro, kit, par, litro, outro;
- Observações;
- Status: ativa ou inativa.

### Peça dentro da OS

- Peça selecionada ou descrição manual;
- Quantidade;
- Valor unitário;
- Desconto individual;
- Valor total;
- Garantia específica;
- Observação;
- Marcador: peça nova, usada, recondicionada, fornecida pelo cliente.

### Estoque na V1

A V1 não terá controle completo de estoque. O cadastro de peças será usado para agilizar lançamento na OS. Controle de entrada, saída, quantidade mínima e inventário fica para V2.

## 16. Serviços

O app deve permitir incluir serviços dentro da OS e também manter um cadastro simples de serviços frequentes.

### Cadastro simples de serviço

- Nome do serviço;
- Categoria;
- Descrição padrão;
- Valor padrão;
- Tempo estimado;
- Garantia padrão;
- Observações;
- Status: ativo ou inativo.

### Serviço dentro da OS

- Serviço selecionado ou descrição manual;
- Quantidade;
- Valor unitário;
- Desconto individual;
- Valor total;
- Técnico responsável;
- Observação;
- Garantia específica.

### Categorias de serviço sugeridas

- Diagnóstico;
- Manutenção corretiva;
- Manutenção preventiva;
- Instalação;
- Limpeza;
- Troca de peça;
- Configuração;
- Formatação;
- Reparo eletrônico;
- Visita técnica;
- Orçamento;
- Outro.

## 17. Pagamentos

A V1 terá controle simples de pagamento dentro da OS.

### Campos

- Valor total da OS;
- Valor pago;
- Valor pendente;
- Forma de pagamento;
- Data do pagamento;
- Observação do pagamento.

### Formas de pagamento

- Dinheiro;
- Pix;
- Cartão de débito;
- Cartão de crédito;
- Transferência;
- Boleto;
- Link de pagamento;
- Outro.

### Fora da V1

- Controle de caixa;
- Conciliação bancária;
- Relatório financeiro avançado;
- Parcelamento detalhado;
- Integração com gateway de pagamento.

## 18. PDF da OS

O PDF precisa parecer um documento profissional de assistência técnica ou empresa de serviços.

### Objetivo do PDF

- Formalizar entrada do equipamento ou solicitação de serviço;
- Registrar defeito relatado;
- Apresentar diagnóstico e orçamento;
- Comprovar autorização do cliente;
- Registrar peças e serviços executados;
- Informar garantia;
- Servir como comprovante de retirada;
- Ser compartilhado por WhatsApp, e-mail ou impressão.

### Estrutura visual do PDF

1. Cabeçalho da empresa;
2. Bloco de identificação da OS;
3. Dados do cliente;
4. Dados do equipamento;
5. Relato do problema;
6. Diagnóstico técnico;
7. Serviços e peças;
8. Resumo financeiro;
9. Garantia e termos;
10. Fotos, quando habilitado;
11. Assinaturas;
12. Rodapé.

### Cabeçalho

Deve conter:

- Logo da empresa;
- Nome da empresa;
- CPF/CNPJ;
- Telefone e WhatsApp;
- E-mail;
- Endereço;
- Número da OS;
- Data de abertura;
- Status atual.

### Bloco do cliente

Deve conter:

- Nome ou razão social;
- CPF/CNPJ;
- Telefone;
- WhatsApp;
- E-mail;
- Endereço.

### Bloco do equipamento

Deve conter:

- Categoria;
- Tipo;
- Marca;
- Modelo;
- Número de série;
- Código patrimonial;
- Acessórios recebidos;
- Estado físico;
- Observações.

### Bloco técnico

Deve conter:

- Defeito relatado;
- Diagnóstico;
- Serviço recomendado;
- Serviço executado;
- Testes realizados;
- Observações técnicas.

### Tabela de peças e serviços

A tabela deve conter:

- Tipo: serviço, peça ou outro;
- Descrição;
- Quantidade;
- Valor unitário;
- Desconto;
- Total.

### Resumo financeiro

Deve conter:

- Subtotal de serviços;
- Subtotal de peças;
- Outros custos;
- Desconto;
- Total;
- Valor pago;
- Valor pendente;
- Forma de pagamento.

### Termos

Deve conter textos configuráveis para:

- Autorização de serviço;
- Garantia;
- Responsabilidade sobre dados;
- Prazo para retirada;
- Equipamentos não retirados;
- Orçamento não aprovado;
- Peças fornecidas pelo cliente;
- Condições de pagamento.

### Assinaturas

Deve conter:

- Nome do cliente;
- Assinatura do cliente;
- Documento do cliente ou responsável;
- Nome do técnico;
- Assinatura do técnico;
- Data e hora.

### Estilo do PDF

- Visual limpo;
- Cabeçalho forte;
- Cores alinhadas à marca da empresa;
- Tabelas com bordas suaves;
- Seções bem separadas;
- Hierarquia clara;
- Tipografia legível;
- Rodapé discreto;
- Sem excesso de elementos decorativos;
- Aparência de documento empresarial.

## 19. Telas essenciais

### 19.1 Onboarding — Dados da empresa

Objetivo: configurar empresa antes de gerar OS.

Campos:

- Logo;
- Nome da empresa;
- Documento;
- Telefone;
- WhatsApp;
- E-mail;
- Endereço;
- Texto padrão de garantia.

### 19.2 Home

Objetivo: exibir resumo operacional e atalho para criar OS.

Elementos:

- Saudação;
- Botão Nova OS;
- Cards de status;
- OS recentes;
- Busca rápida;
- Atalhos para cliente e equipamento.

### 19.3 Lista de OS

Objetivo: listar e filtrar ordens.

Filtros:

- Todas;
- Abertas;
- Em andamento;
- Aguardando aprovação;
- Concluídas;
- Entregues;
- Canceladas.

### 19.4 Nova OS

Objetivo: criar OS em fluxo guiado.

Etapas:

1. Cliente;
2. Equipamento;
3. Problema;
4. Peças e serviços;
5. Valores;
6. Termos e assinatura;
7. Revisão e PDF.

### 19.5 Detalhes da OS

Objetivo: controlar uma OS específica.

Ações:

- Editar;
- Alterar status;
- Adicionar item;
- Adicionar foto;
- Registrar pagamento;
- Coletar assinatura;
- Gerar PDF;
- Compartilhar PDF;
- Cancelar OS.

### 19.6 Clientes

Objetivo: listar, buscar e gerenciar clientes.

Ações:

- Novo cliente;
- Editar cliente;
- Ver OS do cliente;
- Ver equipamentos;
- Criar OS para cliente.

### 19.7 Equipamentos

Objetivo: listar, buscar e gerenciar equipamentos.

Ações:

- Novo equipamento;
- Editar equipamento;
- Ver histórico;
- Criar OS para equipamento.

### 19.8 Catálogo de serviços

Objetivo: cadastrar serviços frequentes para agilizar OS.

Ações:

- Novo serviço;
- Editar serviço;
- Ativar/inativar serviço.

### 19.9 Catálogo de peças

Objetivo: cadastrar peças frequentes para agilizar OS.

Ações:

- Nova peça;
- Editar peça;
- Ativar/inativar peça.

### 19.10 Configurações

Objetivo: controlar empresa, PDF, backup e preferências.

Itens:

- Dados da empresa;
- Modelo de PDF;
- Termos padrão;
- Backup;
- Tema;
- Segurança;
- Sobre o app;
- Política de privacidade.

## 20. Busca e filtros

### Busca global

A busca deve localizar:

- Número da OS;
- Nome do cliente;
- Telefone;
- CPF/CNPJ;
- Marca do equipamento;
- Modelo;
- Número de série;
- Serviço;
- Peça.

### Filtros de OS

- Status;
- Período;
- Cliente;
- Prioridade;
- Pagamento pendente;
- Garantia ativa;
- Entregue ou não entregue.

## 21. Backup e restauração

Como o app é offline, backup é essencial.

### V1 deve ter

- Exportar backup manual;
- Importar backup manual;
- Exibir data do último backup;
- Alertar quando o usuário está há muitos dias sem backup;
- Permitir compartilhar o arquivo de backup;
- Incluir dados do banco e referências de arquivos locais.

### Formatos possíveis

- `.json` para dados;
- `.zip` para dados, fotos, logos, assinaturas e PDFs.

## 22. Segurança e privacidade

### V1

- Dados salvos localmente;
- Sem conta obrigatória;
- Sem envio automático para servidor;
- Opção de bloquear app com senha/PIN, se viável;
- Aviso de responsabilidade sobre backup.

### Dados sensíveis

O app pode armazenar documentos, telefone, endereço e assinatura. Portanto, a política de privacidade deve explicar que os dados ficam no aparelho, salvo quando o próprio usuário exportar ou compartilhar.

## 23. Funções grátis e premium

### Estratégia recomendada

A primeira versão pode nascer sem premium até o fluxo principal estar estável. Depois, premium pode ser ativado com limites claros.

### Grátis

- Cadastro de empresa;
- Clientes limitados ou ilimitados;
- Equipamentos limitados ou ilimitados;
- Até determinado número de OS por mês;
- PDF com marca discreta do app;
- Backup manual;
- Catálogo básico de serviços e peças.

### Premium

- OS ilimitadas;
- Remover marca do app no PDF;
- Modelos avançados de PDF;
- Fotos ilimitadas por OS;
- Assinatura digital avançada;
- Campos personalizados;
- Exportação CSV;
- Relatórios;
- Backup avançado;
- Bloqueio por biometria;
- Mais modelos de termos;
- Mais opções de personalização visual.

## 24. Métricas de sucesso

O app será considerado funcional quando o usuário conseguir:

- Configurar a empresa;
- Cadastrar um cliente completo;
- Cadastrar um equipamento completo;
- Criar uma OS com problema relatado;
- Adicionar serviços;
- Adicionar peças;
- Calcular valores automaticamente;
- Coletar assinatura;
- Gerar PDF com logo;
- Compartilhar o PDF;
- Encontrar a OS no histórico;
- Alterar status;
- Fazer backup;
- Restaurar backup.

## 25. Riscos de escopo

### Risco 1: virar ERP completo

O app não deve tentar resolver estoque, financeiro, CRM, agenda, nota fiscal e multiusuário na V1.

### Risco 2: PDF complexo demais

O PDF deve ser bonito e organizado, mas precisa ser tecnicamente viável em React Native/Expo.

### Risco 3: excesso de campos obrigatórios

O app deve ter muitos campos disponíveis, mas poucos obrigatórios. Caso contrário, o usuário não consegue criar OS rapidamente.

### Risco 4: dados offline sem backup

Backup manual precisa entrar cedo. Um app offline sem backup pode gerar perda grave de dados.

### Risco 5: fotos pesadas

Fotos precisam ser comprimidas e organizadas para não ocupar espaço excessivo.

## 26. Campos obrigatórios mínimos

Para o fluxo ser rápido, nem todos os dados devem ser obrigatórios.

### Cliente

Obrigatórios:

- Nome;
- Telefone ou WhatsApp.

### Equipamento

Obrigatórios:

- Cliente;
- Tipo ou categoria;
- Descrição simples.

### OS

Obrigatórios:

- Cliente;
- Defeito relatado ou descrição do serviço;
- Status;
- Data de abertura.

### PDF

Obrigatórios:

- Empresa configurada;
- Número da OS;
- Cliente;
- Descrição da solicitação.

## 27. Regras de negócio iniciais

- Toda OS deve ter número único;
- O número da OS deve ser sequencial;
- Uma OS pode existir sem equipamento, para serviços gerais;
- Uma OS deve sempre ter cliente;
- Uma OS pode ter vários serviços;
- Uma OS pode ter várias peças;
- O total deve ser calculado automaticamente;
- O usuário pode editar valores manualmente;
- PDF deve poder ser regenerado após edição;
- OS entregue não deve ser alterada sem aviso;
- OS cancelada deve manter histórico;
- Cliente excluído não deve apagar OS antigas sem confirmação;
- Equipamento excluído não deve apagar OS antigas sem confirmação;
- Backup deve incluir dados essenciais.

## 28. Critérios de conclusão da V1

A V1 estará pronta quando:

- App abrir sem crash;
- Onboarding da empresa funcionar;
- Cliente puder ser criado, editado, buscado e visualizado;
- Equipamento puder ser criado, editado, buscado e vinculado ao cliente;
- OS puder ser criada e editada;
- Itens de peças e serviços puderem ser adicionados;
- Valores forem calculados corretamente;
- Status puder ser alterado;
- Assinatura puder ser coletada;
- Fotos puderem ser anexadas;
- PDF for gerado com layout profissional;
- PDF puder ser compartilhado;
- Dados persistirem offline;
- Backup manual funcionar;
- App funcionar em celular pequeno;
- App funcionar em tablet;
- Tema claro e escuro não quebrarem;
- Typecheck passar;
- Build Android passar;
- Build iOS estar preparado.

## 29. Ordem recomendada de implementação

1. Criar estrutura base do projeto;
2. Criar design system;
3. Criar componentes globais;
4. Criar onboarding da empresa;
5. Criar banco SQLite e modelos base;
6. Criar clientes;
7. Criar equipamentos;
8. Criar catálogo de serviços;
9. Criar catálogo de peças;
10. Criar OS;
11. Criar detalhes da OS;
12. Criar cálculo de valores;
13. Criar fotos e anexos;
14. Criar assinatura;
15. Criar geração de PDF;
16. Criar compartilhamento;
17. Criar busca e filtros;
18. Criar backup e restauração;
19. Criar configurações;
20. Fazer auditoria final;
21. Preparar build e publicação.

## 30. Decisão final da V1

A V1 do OrdemPro deve ser um app offline de OS profissional, focado em:

```txt
Cliente → Equipamento → OS → Peças/Serviços → Valores → Assinatura → PDF → Compartilhamento → Histórico → Backup
```

Tudo que não fortalecer esse fluxo deve ficar para versões futuras.
