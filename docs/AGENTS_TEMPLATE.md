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
