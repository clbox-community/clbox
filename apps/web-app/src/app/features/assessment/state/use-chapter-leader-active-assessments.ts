import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import {WithId} from "../model/with-id";
import {Assessment} from "../model/assessment";

const firestore = firebaseApp.firestore();

export function useChapterLeaderActiveAssessments(team: string, user: string) {
    const [assessments, setAssessments] = useState<(WithId & Assessment)[]>();
    useEffect(
        () => {
            return firestore
                .collection(`/team/${team}/assessment/`)
                .where('accessibleBy', 'array-contains', user)
                .orderBy('deadline', 'desc')
                .onSnapshot(
                    docs => setAssessments(docs.docs.map(
                        doc => ({
                            id: doc.id,
                            ...(doc.data() as Assessment)
                        })
                    ))
                );
        },
        [team, user]
    );
    return assessments;
}
