import { firebaseApp } from '../../firebase/firebase.app';
import { useEffect, useState } from 'react';
import { UserPublicProfile } from '../model/user-public-profile';

const db = firebaseApp.firestore();

export function useUserPublicProfiles(teamId: string): UserPublicProfile[] {
    const [users, setUsers] = useState<UserPublicProfile[]>();
    useEffect(
        () => {
            if (teamId) {
                db.collection(`/team/${teamId}/profile-public`)
                    .get()
                    .then(result => setUsers(result.docs.map(doc => doc.data()).map(doc => ({
                        display_name: doc.display_name,
                        email: doc.email,
                        chapterLeader: doc.chapterLeader,
                        teams: doc.teams,
                        projects: doc.projects,
                        seniority: doc.seniority,
                        textForm: doc.textForm,
                    }))));
            }
        },
        [teamId]
    );
    return users;
}
