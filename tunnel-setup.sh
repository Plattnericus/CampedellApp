#!/bin/sh

# === KONFIGURATION - NUR HIER ANPASSEN ===
TUNNEL_NAME="campedel-app"
DOMAIN="campedel-app.plattnericus.dev"
PORT="3004"
# =========================================

echo ">>> [1/6] Installiere curl..."
apk add --no-cache curl 2>/dev/null || apt-get update -y && apt-get install -y curl
echo "✓ curl bereit"

echo ">>> [2/6] Lade cloudflared herunter..."
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
echo "✓ cloudflared $(cloudflared --version)"

echo ">>> [3/6] Login - Bitte den Link im Browser öffnen & autorisieren..."
cloudflared tunnel login
echo "✓ Login erfolgreich"

echo ">>> [4/6] Erstelle Tunnel '$TUNNEL_NAME'..."
cloudflared tunnel create "$TUNNEL_NAME"
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "✓ Tunnel ID: $TUNNEL_ID"

echo ">>> [5/6] Erstelle config.yml..."
mkdir -p /etc/cloudflared
cat > /etc/cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$PORT
  - service: http_status:404
EOF
echo "✓ Config:"
cat /etc/cloudflared/config.yml

echo ">>> [6/6] Setze DNS & starte Tunnel..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
echo "✓ DNS gesetzt - starte Tunnel..."
cloudflared tunnel --config /etc/cloudflared/config.yml run