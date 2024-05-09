import fetch from 'node-fetch';

const userProfileCache: {[key: string]: { ttl?: number, result }} = {
    ttl: undefined,
    result: undefined
};

export async function userProfile(email: string, bottoken: unknown) {
    if (!userProfileCache[email] || new Date().getTime() > (userProfileCache[email].ttl ?? 0)) {
        console.log(`Building cache entry for user profile [email=${email}, previousCache.ttl=${userProfileCache[email]?.ttl ?? 'no-entry'}`);
        userProfileCache[email] = {
            ttl: new Date().getTime() + 1000 * 60 * 10,
            result: await fetch(
                `https://slack.com/api/users.lookupByEmail?email=${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${bottoken}`,
                        'Content-type': 'application/json'
                    },
                }
            )
                .then(result => result.json())
                .then((result: any) => result.user)
        }
        console.log(`New cache entry for user list [email=${email}, cache.ttl=${userProfileCache[email].ttl}]`);
    }
    return userProfileCache[email].result;
}
