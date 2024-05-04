const crypto = require('crypto');
const https = require('https');

const [, , ...args] = process.argv;
if (args.length !== 2) {
    console.error(`Run with:\n$ node skills.js https://export/url.json decrypt-key`)
    process.exit(1)
}

const url = args[0];
const key = args[1];

https.get(url, result => {
    let data = '';
    result.on('data', (chunk) => {
        data += chunk;
    });
    result.on('close', () => {
        const remote = JSON.parse(data);
        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            Buffer.from(key, 'base64'),
            Buffer.from(remote.iv, 'base64')
        );
        decipher.setAuthTag(Buffer.from(remote.tag, 'base64'));
        console.log(decipher.update(remote.encoded, 'base64', 'utf8') + decipher.final('utf8'));
    });
});
