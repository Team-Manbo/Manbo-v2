FROM rust:latest

WORKDIR /app

COPY . .

RUN cargo build --release --features expose-metrics

ENV BOT_TOKEN YOUR_BOT_TOKEN
ENV PORT 6972

EXPOSE 6972

CMD ["./target/release/twilight-http-proxy"]