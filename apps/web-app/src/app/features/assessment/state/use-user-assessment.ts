import { UserAssessment } from '../model/user-assessment';
import { firebaseApp } from '../../firebase/firebase.app';
import { useCallback, useEffect, useState } from 'react';
import { WithId } from '../model/with-id';
import { UserAssessmentRef } from '../model/user-assessment-ref';

const firestore = firebaseApp.firestore();

export const useUserAssessment = (team: string, user: string, id: string): [WithId & UserAssessment, (update: {
    [key: string]: unknown
}) => void, ((finishDate: number) => void)] => {
    const [assessment, setAssessment] = useState<WithId & UserAssessment | undefined>();
    useEffect(
        () => {
            if (team && user && id) {
                const controller = new AbortController();
                firestore
                    .doc(`/team/${team}/user/${user}/assessment-survey/${id}`)
                    .get()
                    .then(userAssessmentRef => {
                        const userAssessmentRefData = userAssessmentRef.data() as UserAssessmentRef;
                        const unsubscribe = firestore
                            .doc(`/team/${team}/assessment/${userAssessmentRefData.assessmentId}/result/${id}`)
                            .onSnapshot(doc => {
                                if (doc.exists) {
                                    setAssessment({ id: doc.id, ...doc.data() as UserAssessment });
                                } else {
                                    setAssessment(null);
                                }
                            });
                        controller.signal.addEventListener('abort', () => {
                            console.log('unsubscribing...');
                            unsubscribe();
                        });
                    });
                return () => controller.abort();
            }
        },
        [team, user, id]
    );
    const updateAssessment = useCallback(
        (update: { [key: string]: unknown }) => {
            if (team && user && id) {
                firestore
                    .doc(`/team/${team}/user/${user}/assessment-survey/${id}`)
                    .update(update);
            } else {
                throw new Error('Update for assessment without team && user && id');
            }
        },
        [team, user, id]
    );
    const finishAssessment = useCallback(
        async (finishDate: number) => {
            await firestore
                .doc(`/team/${team}/user/${user}/assessment-survey/${id}`)
                .update('finished', true);
            await firestore.doc(`/team/${team}/user/${user}/assessment-survey/${id}/data/state`).set({
                finishedDate: finishDate ?? new Date().getTime()
            });
        },
        [team, user, id]
    );
    return [assessment, updateAssessment, finishAssessment];
};
