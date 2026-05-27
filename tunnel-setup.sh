#!/bin/sh
set -e

# .env laden (TUNNEL_NAME und TUNNEL_HOSTNAME)
if [ -f .env ]; then
  while IFS='=' read -r key value; do
    case "$key" in
      '#'*|'') continue ;;
    esac
    case "$key" in
      TUNNEL_NAME|TUNNEL_HOSTNAME)
        export "${key}=${value}"
        ;;
    esac
  done < .env
fi

TUNNEL_NAME="${TUNNEL_NAME:-}"
TUNNEL_HOSTNAME="${TUNNEL_HOSTNAME:-}"

if [ -z "$TUNNEL_NAME" ]; then
  echo "TUNNEL_NAME ist nicht in .env gesetzt"
  exit 1
fi
if [ -z "$TUNNEL_HOSTNAME" ]; then
  echo "TUNNEL_HOSTNAME ist nicht in .env gesetzt"
  exit 1
fi

echo "Cloudflare Tunnel Setup -- $TUNNEL_HOSTNAME"
echo "=================================================="
echo ""

# curl installieren falls nicht vorhanden (Alpine)
if ! command -v curl >/dev/null 2>&1; then
  echo "Installiere curl..."
  apk add --no-cache curl
fi

# cloudflared installieren falls nicht vorhanden
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Installiere cloudflared..."
  curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" \
    -o /usr/local/bin/cloudflared
  chmod +x /usr/local/bin/cloudflared
fi
echo "$(cloudflared --version 2>&1 | head -1)"
echo ""

# Login (einmalig, oeffnet Link im Terminal)
if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
  echo "Step 1: Login zu Cloudflare (Link im Terminal oeffnen)..."
  cloudflared tunnel login
  echo ""
else
  echo "Bereits bei Cloudflare eingeloggt"
fi

# Tunnel erstellen falls noch nicht vorhanden
if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  echo "Tunnel '$TUNNEL_NAME' existiert bereits"
else
  echo "Erstelle Tunnel '$TUNNEL_NAME'..."
  cloudflared tunnel create "$TUNNEL_NAME"
fi

# Tunnel-ID ermitteln
TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "Tunnel ID: $TUNNEL_ID"

# Config schreiben
mkdir -p "$HOME/.cloudflared"
cat > "$HOME/.cloudflared/config.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $TUNNEL_HOSTNAME
    service: http://campedellapp:3004
  - service: http_status:404
EOF
echo "Config: $HOME/.cloudflared/config.yml"

# DNS routen
echo "Route $TUNNEL_HOSTNAME -> Tunnel..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME" 2>&1 || \
  echo "  (DNS Eintrag existiert bereits -- ok)"

echo ""
echo "Fertig! Tunnel starten mit:"
echo "   cloudflared tunnel --config $HOME/.cloudflared/config.yml run"
