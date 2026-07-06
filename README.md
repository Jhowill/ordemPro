# OrdemPro

Aplicativo Expo/React Native para gestao de ordens de servico, clientes, equipamentos, catalogo de servicos/pecas, configuracoes da empresa e visualizacao de PDF.

## Fonte do aplicativo

O codigo completo gerado nesta entrega esta no arquivo `ordempro-source.tar.gz` na raiz do repositorio.

Para abrir localmente:

```bash
tar -xzf ordempro-source.tar.gz
npm install
npm run typecheck
npm run lint
npm run start -- --localhost
```

URLs usadas na validacao local:

- Expo/Metro: `exp://127.0.0.1:8081`
- Web: `http://localhost:8081`

## Status da entrega

- App Expo criado com Expo Router e TypeScript.
- Telas principais implementadas: dashboard, ordens, clientes, equipamentos e configuracoes.
- Fluxos de cadastro/detalhe implementados para ordens, clientes e equipamentos.
- Catalogo de servicos e pecas incluso.
- Preview de ordem em formato PDF/relatorio incluso.
- Persistencia local via AsyncStorage.
- Tema claro/escuro e configuracoes basicas.
- `npm run typecheck` aprovado.
- `npm run lint` aprovado.

## Observacao

O ambiente desta execucao nao tinha `git.exe` local disponivel; por isso o envio foi feito pela API do GitHub. O source foi publicado como arquivo compactado para preservar o projeto completo dentro das limitacoes do conector.
