# OrdemPro

App mobile offline-first para gestao de ordens de servico, clientes, equipamentos, pecas, servicos, PDF profissional e backup manual.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- SQLite local
- `expo-print` e `expo-sharing` para PDF

## Rodar localmente

```bash
npm install
npx expo install --check
npm run start -- --localhost
```

Verificacoes:

```bash
npm run typecheck
npm run lint
```

## Fluxos implementados

- Onboarding da empresa
- Home operacional
- Clientes
- Equipamentos
- Catalogo de servicos
- Catalogo de pecas
- Criacao de OS guiada
- Detalhe de OS
- Status da OS
- Calculo de valores
- PDF local profissional
- Compartilhamento de PDF
- Backup JSON manual
- Configuracoes de empresa, PDF, backup e seguranca
- Historico de status salvo em SQL

## Observacoes

Os documentos em `docs/` continuam sendo a fonte de produto e implementacao. Esta V1 usa persistencia local em SQLite, com valores monetarios em centavos, datas em ISO string e arquivos locais como `localUri`.
