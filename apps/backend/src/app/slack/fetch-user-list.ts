import fetch from 'node-fetch';
import { SlackUserIndex } from './slack-user-index';
import { SlackUser } from './slack-user';

const userListCache: { ttl?: number, result } = {
    ttl: undefined,
    result: undefined
};

export async function userList(bottoken: unknown): Promise<SlackUserIndex | void> {
    if (!userListCache.result || new Date().getTime() > (userListCache.ttl ?? 0)) {
        console.log(`Building cache entry for user list [previousCache.ttl=${userListCache.ttl ?? 'no-entry'}]`);
        userListCache.ttl = new Date().getTime() + 1000 * 60 * 10;
        userListCache.result = await fetch(
            `https://slack.com/api/users.list`,
            {
                headers: {
                    Authorization: `Bearer ${bottoken}`,
                    'Content-type': 'application/json'
                }
            })
            .then(res => res.json())
            .then((res: { members: SlackUser[] }) => {
                if (res.members) {
                    return res.members;
                } else {
                    console.log(`Can't fetch slack user list (missing members info) [%o]`, res);
                    throw new Error(`Can't fetch slack user list`);
                }
            })
            .then(
                (users: SlackUser[]) => users.reduce((index, user) => ({
                        ...index,
                        [user.name]: user
                    }),
                    {} as SlackUserIndex
                )
            );
        console.log(`New cache entry for user list [cache.ttl=${userListCache.ttl}]`);
    }
    return userListCache.result;
}
