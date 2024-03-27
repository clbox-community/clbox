import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import {WithId} from "../model/with-id";
import {UserAssessment} from "../model/user-assessment";

const firestore = firebaseApp.firestore();

export function useUserAssessments(team: string, user: string) {
    const [assessments, setAssessments] = useState<(WithId & UserAssessment)[]>();
    useEffect(
        () => {
            return firestore
                .collection(`/team/${team}/user/${user}/assessment-survey`)
                .orderBy('deadline', 'asc')
                .onSnapshot(
                    docs => setAssessments(docs.docs.map(
                        doc => ({
                            id: doc.id,
                            ...(doc.data() as UserAssessment)
                        })
                    ))
                );
        },
        [team, user]
    );
    return assessments;
}
