import {UserAssessment} from "../model/user-assessment";
import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import {WithId} from "../model/with-id";

const firestore = firebaseApp.firestore();

export const useAssessmentResults = (team: string, assessment: string): (WithId & UserAssessment)[] => {
    const [results, setResults] = useState<(WithId & UserAssessment)[] | undefined>();
    useEffect(
        () => {
            if (team && assessment) {
                return firestore
                    .collection(`/team/${team}/assessment/${assessment}/result`)
                    .onSnapshot(docs => setResults(docs.docs
                        .map(doc => ({
                            id: doc.id,
                            assessor: doc.data().assessee, // tempo legacy data fallback
                            ...(doc.data() as UserAssessment),
                        }))
                    ));
            }
        },
        [team, assessment]
    );
    return results;
}
