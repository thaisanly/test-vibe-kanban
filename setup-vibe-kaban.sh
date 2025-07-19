#!/bin/bash

set -e

echo "🚀 Vibe Kanban Setup and Run Script"
echo "===================================="

# Set up data directory in user home
DATA_DIR="$HOME/.vibe-kanban-data"
echo "📁 Data directory: $DATA_DIR"

# Create data directory structure
mkdir -p "$DATA_DIR/.local/share/vibe-kanban"

# Set up local cargo directories to avoid permission issues
export CARGO_HOME="$HOME/.cargo"
export RUSTUP_HOME="$HOME/.rustup"
mkdir -p "$CARGO_HOME"

# Clone the repository
echo "📥 Cloning repository..."
if [ -d "vibe-kanban-app" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd vibe-kanban-app
    git pull
else
    git clone https://github.com/BloopAI/vibe-kanban.git vibe-kanban-app
    cd vibe-kanban-app
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Fix permissions if running in a system with shared Rust installation
if [ -d "/opt/rust" ]; then
    echo "🔧 Detected system Rust installation, using local cargo registry..."
    export CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse
fi

# Build the project
echo "🔨 Building project with GitHub Client ID..."
GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9 CARGO_HOME="$CARGO_HOME" pnpm run build

# Set XDG_DATA_HOME to use our custom data directory
export XDG_DATA_HOME="$DATA_DIR/.local/share"

# Run the application
echo "🎯 Starting Vibe Kanban..."
echo "Data will be stored in: $DATA_DIR"
echo "Server will start on: http://127.0.0.1:PORT"
echo "Press Ctrl+C to stop"
echo ""
echo "For Docker volume mounting, use: -v $DATA_DIR:/home/app/.vibe-kanban-data"
echo ""
GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9 ./target/release/vibe-kanban