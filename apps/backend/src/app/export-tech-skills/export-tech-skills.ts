import * as crypto from 'crypto'

const encrypt = (key, plaintext) => {
    const iv = crypto.randomBytes(12).toString('base64');
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(key, 'base64'),
        Buffer.from(iv, 'base64')
    );
    const encoded = cipher.update(plaintext, 'utf8', 'base64') + cipher.final('base64');
    const tag = cipher.getAuthTag().toString('base64');

    return {encoded, iv, tag}
}

export const exportTechSkills = async (
    config: Record<string, any>,
    firebase: typeof import('firebase-admin')
) => {
    const bucket = firebase.storage().bucket();

    const exportKey: string = config.skills?.exportkey;
    if (!exportKey) {
        throw new Error(`Public key for encryption not present in configuration. Be sure to setup public key with config key skills.exportkey.`);
    }

    console.log(`Encrypting file using public key ${exportKey.substring(0, 8)}...`);

    const db = firebase.firestore();

    const teams = await db.collection(`/team`).listDocuments();
    for (const team of teams) {
        const skills = {
            lastUpdate: new Date().toISOString(),
            categories: {},
            users: {}
        };

        const trees = await team.collection('skill').listDocuments();
        for (const treeRef of trees) {
            const treeDoc = await treeRef.get();
            const tree = treeDoc.data();
            skills.categories = {
                ...skills.categories,
                ...tree.categories
            }
        }
        const users = await team.collection('user').listDocuments();
        for (const userRef of users) {
            const skillsDoc = await userRef.collection('data').doc('skills').get();
            if (skillsDoc.exists) {
                skills.users[userRef.id] = skillsDoc.data();
            }
        }

        console.log(`Encrypting skills object`);
        const encrypted = JSON.stringify(encrypt(exportKey, JSON.stringify(skills, undefined, 2)));

        console.log(`Updating file content with skill data`);
        const file = bucket.file(`${team.id}_tech-skills.enc.json`);
        console.log(`Syncing user skills to file: ${file.publicUrl()}`);
        await file.save(
            encrypted,
            {
                public: true,
                metadata: {
                    cacheControl: 'no-cache'
                }
            }
        );
    }
}
