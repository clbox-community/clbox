import type { firestore } from 'firebase-admin';
import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';
import { UserPublicProfile } from 'user-profile-model';

export const updatePublicProfileHandlerFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions
) => onDocumentWritten({document: 'team/{team}/user/{user}', ...options},
    async (event) => {
        console.log(`Updating user public profile after user change on ${event.data.after.ref.path}`);

        const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase.firestore()
            .doc(`team/${event.params.team}/profile-public/${event.params.user}`) as firestore.DocumentReference<UserPublicProfile>;
        if (!event.data.after.exists) {
            await profileDoc.delete();
            console.log(`${profileDoc.path} deleted`);
        } else {
            const user = event.data.after.data() as UserPublicProfile;
            const updatedPublicProfile: UserPublicProfile = {
                display_name: user.display_name,
                slackMemberId: user.slackMemberId,
                email: user.email,
                textForm: user.textForm,
                seniority: user.seniority,
                chapterLeader: user.chapterLeader,
                projects: user.projects,
                teams: user.teams,
                roles: user.roles
            };

            const existingProfile = await profileDoc.get();
            if (!existingProfile.exists || existingProfile.exists && !isSameData(updatedPublicProfile, existingProfile.data())) {
                await profileDoc.set(updatedPublicProfile);
                console.log(`${profileDoc.path} updated with public profile: ` + JSON.stringify(updatedPublicProfile));
            } else {
                console.log(`${profileDoc.path} update skipped due to no changes`);
            }
        }
    }
);

function isSameData(a: UserPublicProfile, b: UserPublicProfile): boolean {
    return a.email === b.email
        && a.display_name === b.display_name
        && a.seniority === b.seniority
        && a.textForm === b.textForm
        && a.chapterLeader === b.chapterLeader
        && a.roles === b.roles
        && JSON.stringify(sorted(a.teams)) === JSON.stringify(sorted(b.teams))
        && JSON.stringify(sorted(a.projects)) === JSON.stringify(sorted(b.projects));
}

function sorted(array: string[]): string[] {
    return array.slice().sort((a, b) => a.localeCompare(b));
}
