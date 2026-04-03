import {SkillTreeCategory} from "./skill-tree-category";

export interface SkillTree {
    categories: { [id: string]: SkillTreeCategory };
}
