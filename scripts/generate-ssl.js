const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

function generateSelfSignedCertificate() {
    console.log('🔐 Generating self-signed SSL certificate...');
    const sslDir = path.join(__dirname, '..', 'ssl');
    if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir, { recursive: true });

    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = (Math.floor(Math.random()*100000)+1).toString();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear()+1);

    const attrs = [
        { name: 'countryName', value: 'ID' },
        { name: 'stateOrProvinceName', value: 'Jakarta' },
        { name: 'localityName', value: 'Jakarta' },
        { name: 'organizationName', value: 'Tour Sales Management' },
        { name: 'organizationalUnitName', value: 'IT Department' },
        { name: 'commonName', value: 'localhost' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
        { name: 'basicConstraints', cA: true },
        { name: 'keyUsage', keyCertSign: true, digitalSignature: true, keyEncipherment: true },
        { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
        { name: 'subjectAltName', altNames: [
            { type: 2, value: 'localhost' }, { type: 2, value: '*.localhost' },
            { type: 7, ip: '127.0.0.1' }, { type: 7, ip: '::1' }
        ]}
    ]);

    cert.sign(keys.privateKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const certificatePem = forge.pki.certificateToPem(cert);

    fs.writeFileSync(path.join(sslDir, 'private-key.pem'), privateKeyPem);
    fs.writeFileSync(path.join(sslDir, 'certificate.pem'), certificatePem);

    console.log('✅ SSL generated:', path.join(sslDir));
    return { key: path.join(sslDir, 'private-key.pem'), cert: path.join(sslDir, 'certificate.pem') };
}

if (require.main === module) {
  try { generateSelfSignedCertificate(); } catch(e) { console.error('SSL generation error', e); process.exit(1); }
}
module.exports = generateSelfSignedCertificate;
