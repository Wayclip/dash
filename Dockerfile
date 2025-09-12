FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY package.json bun.lockb ./
COPY next.config.ts components.json eslint.config.mjs postcss.config.mjs tsconfig.json ./

RUN bun install --immutable

COPY . .

RUN bun run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=0330
ENV HOST=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3003

CMD ["node", "server.js"]
