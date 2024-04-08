import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import {WithId} from "../model/with-id";
import {Assessment} from "../model/assessment";

const firestore = firebaseApp.firestore();

export const useAssessment = (team: string, assessment: string): (WithId & Assessment) => {
    const [result, setResult] = useState<(WithId & Assessment) | undefined>();
    useEffect(
        () => {
            if (team && assessment) {
                return firestore
                    .doc(`/team/${team}/assessment/${assessment}`)
                    .onSnapshot(doc => setResult({
                        id: doc.id,
                        assessors: doc.data().assessees, // tymczasowy fallback legacy ankiet
                        ...(doc.data() as Assessment)
                    }));
            }
        },
        [team, assessment]
    );
    return result;
}
