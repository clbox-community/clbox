import fetch from 'node-fetch';

export async function userProfile(email: string, bottoken: unknown) {
    return await fetch(
        `https://slack.com/api/users.lookupByEmail?email=${email}`,
        {
            headers: {
                Authorization: `Bearer ${bottoken}`,
                'Content-type': 'application/json'
            },
        }
    )
        .then(result => result.json())
        .then((result: any) => result.user);
}
