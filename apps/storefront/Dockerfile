FROM node:20-bookworm-slim AS dependencies
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
COPY . .
RUN pnpm --filter storefront build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
USER node
COPY --from=build --chown=node:node /workspace/apps/storefront/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build --chown=node:node /workspace/apps/storefront/public ./apps/storefront/public
EXPOSE 8000
CMD ["node", "apps/storefront/server.js"]

