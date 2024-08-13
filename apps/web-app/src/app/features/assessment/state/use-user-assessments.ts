import { firebaseApp } from '../../firebase/firebase.app';
import { useEffect, useState } from 'react';
import { UserAssessmentRef, WithId } from 'assessment-model';

const firestore = firebaseApp.firestore();

export function useUserAssessments(team: string, user: string) {
    const [assessments, setAssessments] = useState<(WithId & UserAssessmentRef)[]>();
    useEffect(
        () => {
            return firestore
                .collection(`/team/${team}/user/${user}/user-assessment-pending`)
                .orderBy('deadline', 'asc')
                .onSnapshot(
                    docs => setAssessments(docs.docs.map(
                        doc => ({
                            id: doc.id,
                            ...(doc.data() as UserAssessmentRef)
                        })
                    ))
                );
        },
        [team, user]
    );
    return assessments;
}
