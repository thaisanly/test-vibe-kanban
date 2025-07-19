# Build stage for vibe-kanban - using Rust base with Node.js (fastest working option)
# FROM rust:1.80-slim AS vibe-kanban-builder

# # Install Node.js 20 and minimal dependencies (Rust already included)
# RUN apt-get update && apt-get install -y \
#     zip \
#     curl \
#     git \
#     build-essential \
#     pkg-config \
#     libssl-dev \
#     && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
#     && apt-get install -y nodejs \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Install pnpm
# RUN npm install -g pnpm

# # Clone and build vibe-kanban
# RUN git clone https://github.com/BloopAI/vibe-kanban.git /tmp/vibe-kanban

# WORKDIR /tmp/vibe-kanban

# # Create .env file with configuration
# RUN echo "HOST=0.0.0.0" > .env && \
#     echo "GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9" >> .env && \
#     echo "FRONTEND_PORT=40631" >> .env && \
#     echo "BACKEND_PORT=40632" >> .env

# # Install dependencies and build
# RUN GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9 pnpm install && \
#     ./build-npm-package.sh

# # Create the npm package
# WORKDIR /tmp/vibe-kanban/npx-cli
# RUN npm pack

# Main stage
FROM mcr.microsoft.com/playwright:v1.53.1-noble

ARG TZ
ENV TZ="$TZ"

# Switch to root for package installation
USER root

# Install basic development tools and iptables/ipset
RUN apt-get update && apt-get install -y \
  zip \
  less \
  git \
  procps \
  sudo \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  gh \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  jq \
  conntrack \
  tcpdump \
  net-tools \
  curl \
  wget \
  ca-certificates \
  fonts-liberation \
  tmux \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libasound2t64 \
  locales \
  fonts-powerline \
  build-essential \
  pkg-config \
  libssl-dev && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Set locale
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Install FZF manually to ensure files are in the right place
RUN git clone --depth 1 https://github.com/junegunn/fzf.git /tmp/fzf && \
  /tmp/fzf/install --bin --no-bash --no-fish && \
  cp /tmp/fzf/bin/fzf /usr/local/bin/ && \
  mkdir -p /usr/share/doc/fzf/examples && \
  cp /tmp/fzf/shell/*.zsh /usr/share/doc/fzf/examples/ && \
  rm -rf /tmp/fzf

# Create claude user if it doesn't exist (Playwright image uses pwuser by default)
RUN useradd -m -s /bin/bash claude || true

# Add claude user to sudoers
RUN echo "claude ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Install Node.js 20 if not present
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
  apt-get install -y nodejs && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Configure npm to use /usr/local for global packages
RUN npm config set prefix /usr/local

# Ensure claude user has access to global npm binaries
RUN echo 'export PATH="/usr/local/bin:$PATH"' >> /home/claude/.bashrc && \
    echo 'export PATH="/usr/local/bin:$PATH"' >> /home/claude/.profile

ARG USERNAME=claude

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir -p /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME:$USERNAME /commandhistory \
  && chmod 775 /commandhistory \
  && chmod 664 /commandhistory/.bash_history

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Install Rust and Cargo as root for all users
ENV RUSTUP_HOME=/opt/rust
ENV CARGO_HOME=/opt/rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path && \
  chmod -R 755 /opt/rust && \
  ln -s /opt/rust/bin/* /usr/local/bin/

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/claude/.claude && \
  chown -R claude:claude /workspace /home/claude/.claude && \
  chmod 755 /home/claude/.claude && \
  echo '{}' > /home/claude/.claude/.claude.json && \
  chown claude:claude /home/claude/.claude/.claude.json && \
  chmod 644 /home/claude/.claude/.claude.json

WORKDIR /workspace

RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/0.18.2/git-delta_0.18.2_${ARCH}.deb" && \
  dpkg -i "git-delta_0.18.2_${ARCH}.deb" && \
  rm "git-delta_0.18.2_${ARCH}.deb"

# Configure npm to use a global directory accessible to all users
RUN mkdir -p /usr/local/lib/node_modules && \
    npm config set prefix /usr/local && \
    chmod -R 755 /usr/local/lib/node_modules && \
    chmod -R 755 /usr/local/bin

# Install pnpm globally
RUN npm install -g pnpm

# Copy and install the pre-built vibe-kanban package from the builder stage
# COPY --from=vibe-kanban-builder /tmp/vibe-kanban/npx-cli/*.tgz /tmp/
# RUN npm install -g /tmp/*.tgz && rm /tmp/*.tgz

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code

# Ensure claude user can access global npm packages
RUN chown -R claude:claude /usr/local/lib/node_modules && \
    chmod -R 755 /usr/local/lib/node_modules && \
    chmod -R 755 /usr/local/bin

# Set up non-root user
USER claude

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Install oh-my-zsh with powerline theme
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.2.0/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -t https://github.com/romkatv/powerlevel10k \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Add environment variables for vibe-kanban to shell configs and ensure PATH includes global npm binaries
RUN echo 'export GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9' >> /home/claude/.bashrc && \
    echo 'export GITHUB_CLIENT_ID=Ov23li2ho9y2NypR8Pi9' >> /home/claude/.zshrc && \
    echo 'export PATH="/usr/local/bin:$PATH"' >> /home/claude/.zshrc && \
    echo 'export PATH="/usr/local/bin:$PATH"' >> /home/claude/.bashrc