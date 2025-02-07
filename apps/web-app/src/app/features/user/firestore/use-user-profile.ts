import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import { UserProfile } from 'user-profile-model';

const db = firebaseApp.firestore();

export function useUserProfile(teamId: string, userId: string): UserProfile {
    const [user, setUser] = useState<UserProfile>();
    useEffect(
        () => {
            if (teamId && userId) {
                db.doc(`/team/${teamId}/user/${userId}`)
                    .get()
                    .then(doc => doc.data())
                    .then(doc => setUser({
                        email: doc.email,
                        chapterLeader: doc.chapterLeader,
                        display_name: doc.display_name,
                        teams: doc.teams,
                        chapter: doc.chapter,
                        projects: doc.projects,
                        seniority: doc.seniority,
                        textForm: doc.textForm,
                        leader: doc.leader,
                        leaderOf: doc.leaderOf,
                        roles: doc.roles ?? [],
                    }))
            }
        },
        [teamId, userId]
    );
    return user;
}
