# BRUNIUH AI MUSIC V5 — FINAL LOW COST

Projeto full-stack preparado para lançar uma beta paga de geração de música por IA.

## O que está incluído

- Next.js
- Registo/login com Supabase
- 10 créditos grátis por utilizador novo
- 10 créditos = duas músicas até 3 minutos
- ACE-Step via fal.ai
- duas gerações por clique
- Cloudflare R2 privado
- Library permanente
- downloads por links temporários
- Stripe Checkout
- webhook para adicionar créditos após pagamento
- proteção contra duplicação de compra
- reembolso de créditos se a geração falhar
- páginas iniciais de Termos e Privacidade
- scripts para Windows
- configuração Cloudflare Workers / OpenNext
- guias passo a passo

## Preços definidos

- 50 créditos = 2,99 €
- 100 créditos = 4,99 €
- 300 créditos = 12,99 €
- 1.000 créditos = 34,99 €

## Consumo

- até 3 min: 10 créditos por 2 músicas
- até 4 min: 15 créditos por 2 músicas
- até 6 min: 20 créditos por 2 músicas
- até 8 min: 30 créditos por 2 músicas

## Primeiro ficheiro a abrir

`START_HERE.txt`

## Windows

Depois de instalar Node.js:

1. `INSTALL_WINDOWS.bat`
2. configura `.env.local`
3. `CHECK_CONFIG.ps1`
4. `RUN_SITE.bat`

## Produção

A pasta inclui configuração OpenNext/Wrangler para Cloudflare Workers.

Depois de tudo testado:

```bash
npm run preview
npm run deploy
```

Antes do lançamento comercial, revê Termos, Privacidade, IVA/impostos,
regras do fornecedor de IA e direitos de utilização dos conteúdos.


## V6 Branded Premium

Esta versão já inclui:

- logo oficial BRUNIUHMUSIC integrado
- design premium mais forte
- visual mais próximo de grandes plataformas
- homepage/landing mais rica
- sections de trending, toolkit e pricing melhoradas
- branding consistente entre login e app
