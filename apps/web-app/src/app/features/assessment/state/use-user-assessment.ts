import {UserAssessment} from "../model/user-assessment";
import {firebaseApp} from "../../firebase/firebase.app";
import {useCallback, useEffect, useState} from "react";
import {WithId} from "../model/with-id";

const firestore = firebaseApp.firestore();

export const useUserAssessment = (team: string, user: string, id: string): [WithId & UserAssessment, (update: {
    [key: string]: unknown
}) => void, ((finishDate: number) => void)] => {
    const [assessment, setAssessment] = useState<WithId & UserAssessment | undefined>();
    useEffect(
        () => {
            if (team && user && id) {
                return firestore
                    .doc(`/team/${team}/user/${user}/assessment-survey/${id}`)
                    .onSnapshot(doc => {
                        if (doc.exists) {
                            setAssessment({id: doc.id, ...doc.data() as UserAssessment})
                        } else {
                            setAssessment(null);
                        }
                    });
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
}
