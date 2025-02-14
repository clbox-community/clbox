import type { firestore } from 'firebase-admin';
import type { Change } from 'firebase-functions';
import { UserPublicProfile } from 'user-profile-model';

export const updatePublicProfileHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/user/{user}').onWrite(
    async (change: Change<firestore.QueryDocumentSnapshot<UserPublicProfile>>, context) => {
        console.log(`Updating user public profile after user change on ${change.after.ref.path}`);

        const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase.firestore()
            .doc(`team/${context.params.team}/profile-public/${context.params.user}`) as firestore.DocumentReference<UserPublicProfile>;
        if (change.after === undefined) {
            await profileDoc.delete();
            console.log(`${profileDoc.path} deleted`);
        } else {
            const user = change.after.data();
            const updatedPublicProfile: UserPublicProfile = {
                display_name: user.display_name,
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
        && JSON.stringify(a.teams.sort()) === JSON.stringify(b.teams.sort())
        && JSON.stringify(a.projects.sort()) === JSON.stringify(b.projects.sort());
}
