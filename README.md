# IMMA Web

Front-end do IMMA Atacadista — React 19 + TypeScript + Vite + Tailwind. Consome a `imma-api`.

## Rodando
```bash
npm install
cp .env.example .env.development   # VITE_API_URL=http://localhost:3000/api
npm run dev                         # http://localhost:5173
```
Suba a API antes (veja o README da `imma-api`) e adicione `http://localhost:5173` ao `CORS_ORIGIN` dela.

## Organização da integração
- `src/services/api.ts` — cliente HTTP (URL base, token JWT, erros, logout automático em 401)
- `src/services/mappers.ts` — converte snake_case da API ⇄ camelCase dos componentes (e `NUMERIC` → number)
- `src/services/{auth,produtos,pedidos,cep}.ts` — uma função por endpoint
- `src/types/api.ts` — formatos exatos devolvidos pela API

Sessão: o token fica em `localStorage` (`imma_token`) e é revalidado em `GET /auth/me` ao abrir o site. O menu de gerente depende do `role` vindo do servidor; a API também bloqueia (403) quem não for gerente.

## Build / Deploy na AWS
```bash
VITE_API_URL=https://api.seudominio.com.br/api npm run build    # gera dist/
```
- **S3 + CloudFront:** envie `dist/` ao bucket (privado, acesso via OAC). Em *Error pages*, mapeie 403 e 404 → `/index.html` (200).
- **Amplify Hosting:** conecte o repositório; defina `VITE_API_URL` nas variáveis de ambiente do app.
- Lembre de colocar o domínio final em `CORS_ORIGIN` da API.

## Pendente (não implementado)
- **Pagamento real:** o checkout registra o pedido, mas não cobra. Integre um gateway (Mercado Pago, Pagar.me, Stripe…) com tokenização — os dados do cartão nunca devem passar pela API.
- Recuperação de senha por e-mail, rotas por URL (react-router) e upload de imagens (S3) são melhorias futuras.
