#!/bin/sh
set -e

TUNNEL_NAME="campedel-app"
DOMAIN="campedel-app.plattnericus.dev"
PORT="3004"

echo "=== Cloudflare Tunnel Setup (einmalig auf dem Host ausfuehren) ==="
echo ""

# cloudflared installieren falls noetig
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[1/5] Installiere cloudflared..."
  if command -v brew >/dev/null 2>&1; then
    brew install cloudflared
  elif [ "$(uname -s)" = "Linux" ]; then
    curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" \
      -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
  else
    echo "FEHLER: cloudflared manuell installieren: https://developers.cloudflare.com/cloudflared/install"
    exit 1
  fi
else
  echo "[1/5] cloudflared bereits installiert: $(cloudflared --version)"
fi

echo ""
echo "[2/5] Login bei Cloudflare (Browser oeffnet sich)..."
cloudflared tunnel login

echo ""
echo "[3/5] Erstelle Tunnel '$TUNNEL_NAME'..."
cloudflared tunnel create "$TUNNEL_NAME" 2>/dev/null || echo "  Tunnel existiert bereits, wird wiederverwendet."

TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "  Tunnel-ID: $TUNNEL_ID"

echo ""
echo "[4/5] Kopiere Credentials und erstelle config.yml..."
mkdir -p .cloudflared
cp "$HOME/.cloudflared/$TUNNEL_ID.json" ".cloudflared/$TUNNEL_ID.json"

cat > .cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://campedellapp:$PORT
  - service: http_status:404
EOF

echo ""
echo "[5/5] DNS-Route setzen..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>/dev/null || echo "  DNS-Route bereits gesetzt."

echo ""
echo "============================================"
echo " Setup abgeschlossen!"
echo " Starte jetzt: docker compose up --build"
echo " App erreichbar unter: https://$DOMAIN"
echo "============================================"
