/**
 * Describes Roadmap skill hierarchy.
 *
 * Example:
 * - Category: Angular
 *   - Section: Dependency management
 *     - Topic: Two way binding
 */
import {SkillLevel} from "./skill-level";

export interface RoadmapSkillReference {
    href?: string;
    title?: string;
    details?: string;
}

export interface RoadmapSkillTopic {
    title: string;
    slug?: string;
    uuid?: string;
    summary?: string;
    details?: string;
    level: SkillLevel;
    links?: RoadmapSkillReference[];
    labels?: string[];
}

export interface RoadmapSkillSection {
    title: string;
    slug?: string;
    details?: string;
    items: RoadmapSkillTopic[];
    uuid: string;
    links?: RoadmapSkillReference[];
}

export interface RoadmapSkillCategory {
    title: string;
    slug?: string;
    details?: string;
    items: RoadmapSkillSection[];
    uuid: string;
    links?: RoadmapSkillReference[];
    labels: string[]
}
