import { firebaseApp } from '../../firebase/firebase.app';
import { useEffect, useState } from 'react';
import { UserSkills } from '../../skill/model/user-skills';

const db = firebaseApp.firestore();

interface ChapterUserSkills {
    name: string;
    id: string;
    skills: UserSkills;
}

export function useChapterUsersSkill(team: string, chapterLeader: string) {
    const [users, setUsers] = useState<ChapterUserSkills[]>();
    useEffect(
        () => {
            if (team && chapterLeader) {
                db.collection(`/team/${team}/user`)
                    .where('chapterLeader', '==', chapterLeader)
                    .get()
                    .then(result => Promise.all(result.docs.map(async docRef => {
                        const user = docRef.data();
                        const skillsRef = await docRef.ref.collection('data').doc('skills').get();
                        return {
                            name: user.username,
                            id: user.email,
                            skills: skillsRef.data()
                        };
                    })))
                    .then(setUsers);
            }
        },
        [team, chapterLeader]
    );
    return users;
}
