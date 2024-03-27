import {UserAssessment} from "../model/user-assessment";
import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import {WithId} from "../model/with-id";
import {UserAssessmentResult} from "../model/user-assessment-result";

const firestore = firebaseApp.firestore();

export const useAssessmentResults = (team: string, assessment: string): (WithId & UserAssessment)[] => {
    const [results, setResults] = useState<(WithId & UserAssessmentResult)[] | undefined>();
    useEffect(
        () => {
            if (team && assessment) {
                return firestore
                    .collection(`/team/${team}/assessment/${assessment}/result`)
                    .onSnapshot(docs => setResults(docs.docs
                        .map(doc => ({
                            id: doc.id,
                            ...(doc.data() as UserAssessmentResult)
                        }))
                    ));
            }
        },
        [team, assessment]
    );
    return results;
}
