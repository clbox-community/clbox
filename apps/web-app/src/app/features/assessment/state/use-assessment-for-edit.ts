import { useEffect, useState } from 'react';
import { Assessment, WithId } from 'assessment-model';
import { firebaseApp } from '../../firebase/firebase.app';

const firestore = firebaseApp.firestore();

const defaultAssessment: () => Partial<Assessment> = () => ({
    assessed: '',
    author: '',
    chapterLeader: '',
    assessors: [],
    accessibleBy: []
});

export const useAssessmentForEdit: (team: string, uuid: string) => [Partial<WithId & Assessment>, (value: (((prevState: Partial<WithId & Assessment>) => Partial<WithId & Assessment>) | Partial<WithId & Assessment>)) => void] = (team: string, uuid: string) => {
    const [result, setResult] = useState<Partial<WithId & Assessment> | undefined>();
    useEffect(
        () => {
            if (team && uuid) {
                firestore.doc(`/team/${team}/assessment/${uuid}`)
                    .get()
                    .then(doc => {
                        if (doc.exists) {
                            setResult({
                                id: doc.id,
                                assessors: doc.data().assessees, // tymczasowy fallback legacy ankiet
                                ...(doc.data() as Assessment)
                            });
                        } else {
                            setResult(defaultAssessment());
                        }
                    });
            } else if (team && !uuid) {
                setResult(defaultAssessment());
            } else {
                setResult(undefined);
            }
        },
        [team, uuid]
    );
    return [result, setResult];
};
