import * as crypto from 'crypto';

export const checkSlackSignature = (slackSigningSecret, signature, timestamp, rawBody) => {
    const [requestSigningVersion] = signature.split('=');

    const hmac = crypto.createHmac('sha256', slackSigningSecret);
    const data = `${requestSigningVersion}:${timestamp}:${rawBody}`;
    hmac.update(data);
    const verifyDigest = `${requestSigningVersion}=${hmac.digest('hex')}`;

    const key = crypto.randomBytes(32);
    const ah = crypto.createHmac('sha256', key).update(signature).digest();
    const bh = crypto.createHmac('sha256', key).update(verifyDigest).digest();

    return crypto.timingSafeEqual(ah, bh)
};
