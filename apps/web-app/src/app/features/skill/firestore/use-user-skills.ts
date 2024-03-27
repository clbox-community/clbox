import {useEffect, useState} from "react";
import {firebaseApp} from "../../firebase/firebase.app";
import {UserSkills} from "../model/user-skills";

const db = firebaseApp.firestore();

export function useUserSkills(team: string, user: string) {
    const [skills, setSkills] = useState<UserSkills | undefined>();
    useEffect(
        () => {
            if (team && user) {
                return db
                    .doc(`/team/${team}/user/${user}/data/skills`)
                    .onSnapshot(async snapshot => {
                        setSkills(snapshot.data() || {});
                    });
            }
        },
        [team, user]
    );
    return [skills];
}
