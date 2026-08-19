FROM node:20-bookworm-slim AS dependencies
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN pnpm --filter backend build

FROM node:20-bookworm-slim AS production-dependencies
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN pnpm install --frozen-lockfile --prod --filter @dtc/backend...

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build --chown=node:node /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=production-dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /workspace/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=production-dependencies --chown=node:node /workspace/apps/backend/package.json ./apps/backend/package.json
COPY --from=build --chown=node:node /workspace/apps/backend/.medusa ./apps/backend/.medusa
WORKDIR /workspace/apps/backend
USER node
EXPOSE 9000
CMD ["node_modules/.bin/medusa", "start"]
