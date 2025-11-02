FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY next.config.ts components.json eslint.config.mjs postcss.config.mjs tsconfig.json ./

RUN bun install --immutable

COPY . .

COPY .example.env .env
ARG NEXT_PUBLIC_API_URL=https://wayclip.com
RUN sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}|" .env

RUN bun run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003
ENV HOST=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env ./

EXPOSE 3003

CMD ["node", "server.js"]
