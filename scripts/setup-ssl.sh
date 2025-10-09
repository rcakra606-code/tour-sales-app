#!/bin/bash
echo "Creating ssl via openssl..."
mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -keyout ssl/private-key.pem -out ssl/certificate.pem -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Tour Sales Management/OU=IT Department/CN=localhost"
chmod 600 ssl/private-key.pem || true
chmod 644 ssl/certificate.pem || true
echo "SSL files in ./ssl"
