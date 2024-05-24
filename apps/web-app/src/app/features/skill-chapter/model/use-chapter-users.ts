import { firebaseApp } from '../../firebase/firebase.app';
import { useEffect, useState } from 'react';

const db = firebaseApp.firestore();

interface ChapterUser {
    name: string;
    id: string;
}

export function useChapterUsers(team: string, chapterLeader: string) {
    const [users, setUsers] = useState<ChapterUser[]>();
    useEffect(
        () => {
            if (team && chapterLeader) {
                db.collection(`/team/${team}/user`)
                    .where('chapterLeader', '==', chapterLeader)
                    .get()
                    .then(result => setUsers(
                        result.docs
                            .map(dbDoc => dbDoc.data())
                            .map(dbDoc => ({
                                name: dbDoc.display_name,
                                id: dbDoc.email
                            }))
                    ))
            }
        },
        [team, chapterLeader]
    );
    return users;
}
