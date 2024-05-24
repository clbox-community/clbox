import React, { FC } from 'react';

export const SkillMeter: FC<{ value: number }> = ({value}) => {
    const valueNumber = value ?? 0;
    const progressColor = valueNumber > 0 ? (valueNumber > 1 ? '#91e4bc' : '#d4e491') : 'lightgray';
    return <div style={{
        paddingRight: '4px',
        backgroundColor: progressColor,
        width: `${20 + 20 * valueNumber}px`,
        textAlign: 'right'
    }}>
        {valueNumber}
    </div>;
}
