import { useCallback, useEffect, useState } from 'react';
import { firebaseApp } from '../../firebase/firebase.app';

export type CategoryResults = [{ [id: string]: boolean }, (id: string, value: boolean) => void];

const db = firebaseApp.firestore();

export const useCategoryResult: (team: string, user: string, category: string) => CategoryResults = (team: string, user: string, category: string) => {
    const [skills, setSkills] = useState<{ [id: string]: boolean }>(undefined);
    const setSkill = useCallback((id: string, value: boolean) => {
            if (team && user && category) {
                db
                    .doc(`/team/${team}/user/${user}/skill-roadmap-result/${category}`)
                    .set(
                        { [id]: value },
                        { merge: true }
                    );
            }
        },
        [team, user, category]
    );
    useEffect(
        () => {
            if (team && user && category) {
                return db
                    .doc(`/team/${team}/user/${user}/skill-roadmap-result/${category}`)
                    .onSnapshot(doc => {
                        if (doc.exists) {
                            setSkills(doc.data());
                        } else {
                            setSkills({});
                        }
                    });
            }
        },
        [team, user, category, setSkills]
    );
    return [skills, setSkill];
};
