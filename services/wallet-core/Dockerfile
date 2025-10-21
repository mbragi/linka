FROM rust:1.70-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache musl-dev

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Expose port
EXPOSE 3001

# Start the application
CMD ["./target/release/wallet-core"]
