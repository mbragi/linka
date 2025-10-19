FROM rust:1.75-slim as builder

WORKDIR /app
COPY linka-core/ .
COPY libs/ libs/

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/linka-core .

EXPOSE 8081

CMD ["./linka-core"]
