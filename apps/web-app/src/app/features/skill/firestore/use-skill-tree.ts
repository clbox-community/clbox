import {useEffect, useState} from "react";
import {SkillTreeCategory} from "../model/skill-tree-category";
import {firebaseApp} from "../../firebase/firebase.app";

const db = firebaseApp.firestore();

export function useSkillTree(team: string) {
    const [skills, setSkills] = useState<SkillTreeCategory[]>();
    useEffect(
        () => {
            if (team) {
                return db
                    .doc(`/team/${team}/skill/tree0`)
                    .onSnapshot(async snapshot => {
                        const data = snapshot.data();
                        if (data) {
                            const categories: { [key: string]: SkillTreeCategory } = {};
                            Object.keys(data.categories).forEach(id => {
                                categories[id] = {
                                    ...data.categories[id],
                                    id,
                                    page: `/team/${team}/skill/tree0`
                                };
                            });

                            const nextPage = data.nextPage;
                            const hasMorePages = !!nextPage;

                            setSkills(
                                Object.values(categories)
                                    .sort((a, b) => (a.summary ?? a.id).localeCompare(b.summary ?? b.id))
                            );
                        } else {
                            setSkills([]);
                        }
                    })
            }
        },
        [team]
    );
    return [skills];
}
