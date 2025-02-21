import {SkillLevel} from "@clbox/skill-roadmap";
import React from "react";

export const SkillLevelFilter = ({level, onLevelChange}: {
    level: SkillLevel,
    onLevelChange: (level: SkillLevel) => void
}) => {
    return <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.8em', fontStyle: 'italic' }}>
        Poziom:&nbsp;
        <span style={{ cursor: 'pointer', fontWeight: level === 1 ? 600 : undefined }}
              onClick={() => onLevelChange(SkillLevel.Level1)}>1</span>&nbsp;|&nbsp;
        <span style={{ cursor: 'pointer', fontWeight: level === 2 ? 600 : undefined }}
              onClick={() => onLevelChange(SkillLevel.Level2)}>2</span>&nbsp;|&nbsp;
        <span style={{ cursor: 'pointer', fontWeight: level === 3 ? 600 : undefined }}
              onClick={() => onLevelChange(SkillLevel.Level3)}>3</span>&nbsp;|&nbsp;
        <span style={{ cursor: 'pointer', fontWeight: level === 4 ? 600 : undefined }}
              onClick={() => onLevelChange(SkillLevel.Level3plus)}>3+</span>&nbsp;|&nbsp;
        <span style={{ cursor: 'pointer', fontWeight: level === 5 ? 600 : undefined }}
              onClick={() => onLevelChange(SkillLevel.NeedAssessment)}>*</span>
    </div>;

}
