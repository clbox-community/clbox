import {firebaseApp} from "../../firebase/firebase.app";
import {UserProfile} from "../model/user-profile";
import {useEffect, useState} from "react";

const db = firebaseApp.firestore();

export function useUserProfiles(teamId: string): UserProfile[] {
    const [users, setUsers] = useState<UserProfile[]>();
    useEffect(
        () => {
            if (teamId) {
                db.collection(`/team/${teamId}/user`)
                    .get()
                    .then(result => setUsers(result.docs.map(doc => doc.data()).map(doc => ({
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
                    }))))
            }
        },
        [teamId]
    );
    return users;
}
