export interface SkillTreeCategory {
    id?: string;
    page?: string;
    summary: string;
    details: string;
    tag: {[key: string]: boolean};
    team: {[key: string]: boolean};
    project: {[key: string]: boolean};
    parent: string;
}
