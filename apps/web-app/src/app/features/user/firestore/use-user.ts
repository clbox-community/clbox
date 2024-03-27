import {useEffect, useState} from "react";
import {firebaseApp} from "../../firebase/firebase.app";

const db = firebaseApp.firestore();

export function useUser(team: string, id: string) {
    const [user, setUser] = useState<any>();
    useEffect(
        () => {
            if (team && id) {
                db.doc(`/team/${team}/user/${id}`)
                    .get()
                    .then(result => setUser(result.data()))
            }
        },
        [team, id]
    );
    return [user];
}
