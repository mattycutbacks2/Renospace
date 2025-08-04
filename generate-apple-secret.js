const fs = require('fs');
const jwt = require('jsonwebtoken');

// ==== YOUR APPLE INFO ====
const teamId = 'J8YK4KR5LG'; // Your Apple Team ID
const clientId = 'com.renospace.signin'; // Your Service ID
const keyId = 'PFHFB939UH'; // Your Key ID
const privateKey = fs.readFileSync('./AuthKey_PFHFB939UH.p8').toString(); // Path to your .p8 file

const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + 15777000, // 6 months
  aud: 'https://appleid.apple.com',
  sub: clientId,
};

const token = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  keyid: keyId,
});

console.log(token);
