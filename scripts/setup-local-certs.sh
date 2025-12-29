#!/bin/bash

set -e

CERTS_DIR=".certs"
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ip route get 1 | awk '{print $7}' 2>/dev/null || echo "")

if [ -z "$LOCAL_IP" ]; then
  echo "❌ Could not detect local IP address"
  exit 1
fi

echo "🔍 Detected local IP: $LOCAL_IP"

if ! command -v mkcert &> /dev/null; then
  echo "📦 Installing mkcert..."
  if command -v brew &> /dev/null; then
    brew install mkcert
  elif command -v apt-get &> /dev/null; then
    sudo apt-get install -y mkcert
  elif command -v choco &> /dev/null; then
    choco install mkcert
  else
    echo "❌ Please install mkcert manually: https://github.com/FiloSottile/mkcert"
    exit 1
  fi
fi

if [ ! -f "$(mkcert -CAROOT)/rootCA.pem" ]; then
  echo "🔐 Installing mkcert root CA..."
  mkcert -install
fi

mkdir -p "$CERTS_DIR"

echo "📜 Generating certificates for localhost, 127.0.0.1, $LOCAL_IP..."
mkcert -key-file "$CERTS_DIR/key.pem" -cert-file "$CERTS_DIR/cert.pem" localhost 127.0.0.1 "$LOCAL_IP"

echo ""
echo "✅ Certificates created in $CERTS_DIR/"
echo ""
echo "📱 To debug on mobile device:"
echo "   1. Run: bun run dev:pwa"
echo "   2. Open on phone: https://$LOCAL_IP:3001"
echo ""
echo "⚠️  First time on mobile? Install the root CA certificate:"
echo "   Root CA location: $(mkcert -CAROOT)/rootCA.pem"
echo ""
echo "   iOS: Send rootCA.pem to phone → Settings → General → VPN & Device Management → Install"
echo "   Android: Settings → Security → Install certificate from storage"
echo ""
