#!/usr/bin/env bash
set -euo pipefail

# DarkTalk installer
# Intended future usage:
# curl -fsSL https://dark.devs.surf/install | zsh

RESET='\033[0m'
BOLD='\033[1m'
PURPLE='\033[35m'
CYAN='\033[36m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'

if [[ ! -t 1 ]]; then
    RESET=''
    BOLD=''
    PURPLE=''
    CYAN=''
    GREEN=''
    RED=''
    YELLOW=''
fi

say() {
    printf "%b%s%b\n" "$CYAN" "$1" "$RESET"
}

ok() {
    printf "%b✓%b %s\n" "$GREEN" "$RESET" "$1"
}

fail() {
    printf "\n%bERROR:%b %s\n" "$RED" "$RESET" "$1"
}

fix() {
    printf "%bFIX:%b %s\n" "$GREEN" "$RESET" "$1"
}

spinner() {
    local message="$1"
    shift

    if [[ ! -t 1 ]]; then
        printf "%s\n" "$message"
        "$@"
        return
    fi

    local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
    local i=0

    "$@" &
    local pid=$!

    while kill -0 "$pid" 2>/dev/null; do
        printf "\r%b%s%b %s" "$PURPLE" "${frames[$i]}" "$RESET" "$message"
        i=$(( (i + 1) % ${#frames[@]} ))
        sleep 0.08
    done

    wait "$pid"
    printf "\r%b✓%b %s\n" "$GREEN" "$RESET" "$message"
}

printf "\n"
printf "%b%bDARK-TALK%b\n" "$PURPLE" "$BOLD" "$RESET"
printf "\n"
printf "TALK TO THE APPLICATION LIKE YOU COULD NEVER\n"
printf "THINK IT AND CREATE IT.\n"
printf "\n"
printf "LEAVE REST ON ME.\n"
printf "\n"
printf "%bI'm Dark.%b\n\n" "$CYAN" "$RESET"

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        PLATFORM="macOS"
        ;;
    Linux)
        PLATFORM="Linux"
        ;;
    *)
        fail "I don't know how to install DarkTalk on $OS yet."
        fix "Use macOS or Linux for this alpha release."
        exit 1
        ;;
esac

case "$ARCH" in
    arm64|aarch64)
        ARCH_NAME="ARM64"
        ;;
    x86_64|amd64)
        ARCH_NAME="x64"
        ;;
    *)
        fail "I don't recognize this CPU architecture: $ARCH"
        fix "DarkTalk currently supports ARM64 and x64."
        exit 1
        ;;
esac

ok "Platform: $PLATFORM"
ok "Architecture: $ARCH_NAME"

if ! command -v node >/dev/null 2>&1; then
    fail "I couldn't find Node.js."
    fix "Install Node.js 18 or newer, then run the DarkTalk installer again."
    exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="${NODE_VERSION%%.*}"

if (( NODE_MAJOR < 18 )); then
    fail "Your Node.js version is too old: $NODE_VERSION"
    fix "DarkTalk needs Node.js 18 or newer."
    exit 1
fi

ok "Node.js $NODE_VERSION"

ROOT="${DARKTALK_INSTALL_ROOT:-$HOME/.darktalk}"
BIN="$ROOT/bin"
DARK="$BIN/dark"

mkdir -p "$BIN"

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$SOURCE_DIR/bin/dark.js" ]]; then
    fail "I couldn't find the DarkTalk compiler."
    fix "Run this installer from a complete DarkTalk distribution."
    exit 1
fi

say "I'm preparing DarkTalk..."

install_dark() {
    rm -rf "$ROOT/package" 2>/dev/null || true
    mkdir -p "$ROOT/package"

    cp -R "$SOURCE_DIR/bin" "$ROOT/package/"
    cp -R "$SOURCE_DIR/src" "$ROOT/package/"
    cp "$SOURCE_DIR/package.json" "$ROOT/package/"
}

spinner "Installing Dark Compiler" install_dark

cat > "$DARK" <<EOF
#!/usr/bin/env node
require('$ROOT/package/bin/dark.js');
EOF

chmod +x "$DARK"

ok "Dark Compiler"
ok "Dark Runtime"
ok "Dark Core"
ok "Dark CLI"

SHELL_NAME="$(basename "${SHELL:-}")"
PROFILE=""

case "$SHELL_NAME" in
    zsh)
        PROFILE="$HOME/.zshrc"
        ;;
    bash)
        PROFILE="$HOME/.bashrc"
        ;;
esac

PATH_LINE="export PATH=\"$BIN:\$PATH\""

if [[ -n "$PROFILE" ]]; then
    touch "$PROFILE"

    if ! grep -Fqx "$PATH_LINE" "$PROFILE" 2>/dev/null; then
        printf "\n# DarkTalk\n%s\n" "$PATH_LINE" >> "$PROFILE"
        ok "Added DarkTalk to $PROFILE"
    else
        ok "DarkTalk is already in your PATH"
    fi
else
    printf "\n%bINFO:%b I couldn't determine your shell profile.\n" "$YELLOW" "$RESET"
    printf "Add this manually:\n\n  %s\n\n" "$PATH_LINE"
fi

export PATH="$BIN:$PATH"

if "$DARK" --version >/dev/null 2>&1; then
    ok "Installation verified"
else
    fail "DarkTalk installed, but verification failed."
    fix "Run $DARK --version and send me the output."
    exit 1
fi

printf "\n"
printf "%b%bDarkTalk is ready.%b\n\n" "$PURPLE" "$BOLD" "$RESET"

printf "Try:\n\n"
printf "  %bdark%b\n" "$BOLD" "$RESET"
printf "  %bdark init my-app%b\n" "$BOLD" "$RESET"
printf "  %bdark doctor%b\n" "$BOLD" "$RESET"

printf "\n%bWelcome to Dark. 🖤%b\n\n" "$PURPLE" "$RESET"