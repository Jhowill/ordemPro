# AGENTS.md - OrdemPro

OrdemPro e um app Expo + React Native + TypeScript + Expo Router, offline-first, para ordens de servico.

Regras principais:

- Fluxo central: Empresa -> Cliente -> Equipamento -> OS -> Itens -> Valores -> Assinatura -> PDF -> Backup.
- Nao implementar login, nuvem, multiusuario, nota fiscal, estoque completo, CRM, IA ou WhatsApp Business API na V1.
- Telas nao acessam storage diretamente quando houver service/hook disponivel.
- Dinheiro fica em centavos.
- Datas ficam em ISO string.
- Fotos, assinaturas e PDFs ficam como `localUri`.
- Cada tela deve ter uma acao principal.
- Mobile-first, com safe area e formularios em scroll.

Comandos:

```bash
npm run typecheck
npm run lint
npm run start
```

