import {firebaseApp} from "../../firebase/firebase.app";
import {useEffect, useState} from "react";
import { guessResponseValues } from '@clbox/assessment-survey';
import { UserAssessment, WithId } from 'assessment-model';

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
                            assessor: doc.data().assessee, // temp legacy data fallback
                            ...(doc.data() as UserAssessment),
                            verifiedCategories: (doc.data() as UserAssessment).verifiedCategories ?? {},
                            responseValue: guessResponseValues(doc.data())
                        }))
                    ))
            }
        },
        [team, assessment]
    );
    return results;
}
