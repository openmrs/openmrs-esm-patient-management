# syntax=docker/dockerfile:1.3
FROM --platform=$BUILDPLATFORM node:22-alpine as dev

ARG APP_SHELL_VERSION=next

RUN mkdir -p /app
WORKDIR /app

COPY . .

RUN npm_config_legacy_peer_deps=true npm install -g openmrs@${APP_SHELL_VERSION:-next}
ARG CACHE_BUST
RUN npm_config_legacy_peer_deps=true openmrs assemble --manifest --mode config --config spa-assemble-config.json --target ./spa

FROM --platform=$BUILDPLATFORM openmrs/openmrs-reference-application-3-frontend:nightly as frontend
FROM nginx:1.23-alpine

RUN apk update && \
  apk upgrade && \
  # add more utils for sponge to support our startup script
  apk add --no-cache moreutils

# clear any default files installed by nginx
RUN rm -rf /usr/share/nginx/html/*

COPY --from=frontend /etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend /usr/share/nginx/html/ /usr/share/nginx/html/
COPY --from=frontend /usr/local/bin/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# remove the nightly image's precompressed importmap and routes registry;
# nginx serves .br/.gz variants first, and these would shadow the freshly
# assembled plain files copied in below
RUN rm -f /usr/share/nginx/html/importmap.json.br /usr/share/nginx/html/importmap.json.gz \
  /usr/share/nginx/html/routes.registry.json.br /usr/share/nginx/html/routes.registry.json.gz

COPY --from=dev /app/spa/ /usr/share/nginx/html/

CMD ["/usr/local/bin/startup.sh"]
