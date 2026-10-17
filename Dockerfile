FROM rust:1.97-bookworm AS builder

WORKDIR /app
COPY packages/api/Cargo.toml packages/api/Cargo.lock ./
COPY packages/api/src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates chromium \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home app

COPY --from=builder /app/target/release/code-frame-api /usr/local/bin/code-frame-api

ENV CHROME_BIN=/usr/bin/chromium \
    CHROME_NO_SANDBOX=1 \
    PORT=8080

USER app
EXPOSE 8080
CMD ["code-frame-api"]
