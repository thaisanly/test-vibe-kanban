FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install additional OS packages if needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    vim \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Global npm packages
RUN npm install -g @anthropic-ai/claude-code

# Configure git to trust the workspace directory
RUN git config --global --add safe.directory /workspaces/vibe-kanban

USER node