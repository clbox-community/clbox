import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import React, {FC, PropsWithChildren, useEffect, useState} from "react";
import styled from 'styled-components';
import {SurveyAnswerScale} from '../../model/survey-answer-scale';
import {SurveyQuestionData} from "../../model/survey-question-data";

const ScaleWrapper = styled.div`
    margin: 0 auto;
    max-width: 80%;
`;

interface ScaleMark {
    value: number,
    label: string
}

const StyledSlider = styled(Slider)<{ lastindex: number, withvalue: string }>(({lastindex, withvalue}) => ({
    marginBottom: '64px',
    '& .MuiSlider-thumb': {
        opacity: `${withvalue === 'true' ? 1 : 0}`
    },
    '& .MuiSlider-mark': {
        width: `8px`,
        height: `8px`,
        borderRadius: `50%`,
        '&.MuiSlider-markActive': {
            opacity: 1,
            backgroundColor: 'currentColor',
        },
    },
    '& .MuiSlider-markLabel': {
        // outline: '1px dashed lightgray',
        maxWidth: '150px',
        width: '100%',
        whiteSpace: 'normal',
        textAlign: 'center',
        '&[data-index="0"]': {
            transform: 'translateX(0)',
            marginLeft: '-8px',
            textAlign: 'left'
        },
        [`&[data-index="${lastindex}"]`]: {
            transform: 'translateX(calc(-100% + 8px))',
            textAlign: 'right'
        },
    }
}));

const ScaleMarkWithTooltip: FC<PropsWithChildren<{ tooltip?: string }>> = ({children, tooltip}) =>
    !tooltip ? <div>{children}</div> :
        <Tooltip enterTouchDelay={0}
                 placement="bottom"
                 title={tooltip}>
            <div>{children}</div>
        </Tooltip>
;

function generateAnswers(scale: SurveyAnswerScale): ScaleMark[] {
    const answers = [];
    answers.push({
        value: scale.min.value,
        label: <ScaleMarkWithTooltip tooltip={scale.min.tooltip ?? scale.min.text}>
            {scale.min.text}
        </ScaleMarkWithTooltip>
    });
    for (let idx = 1; idx < scale.max.value - scale.min.value; ++idx) {
        answers.push({
            value: scale.min.value + idx,
            label: <ScaleMarkWithTooltip
                tooltip={scale.labels?.[idx + 1]?.tooltip ?? scale.labels?.[idx + 1]?.text ?? ''}>
                <>{scale.labels?.[idx + 1]?.text ?? ''}</>
            </ScaleMarkWithTooltip>
        });
    }
    answers.push({
        value: scale.max.value,
        label: <ScaleMarkWithTooltip tooltip={scale.max.tooltip ?? scale.max.text}>
            <>{scale.max.text}</>
        </ScaleMarkWithTooltip>
    });
    return answers;
}

interface ScaleAnswerProps {
    answers: SurveyQuestionData<SurveyAnswerScale>;
    selected: (answer: number) => void;
    defaultValue: number | undefined;
}

export const ScaleAnswer = ({answers, selected, defaultValue}: ScaleAnswerProps) => {
    const [scale, setScale] = useState<ScaleMark[]>(undefined)
    const [withValue, setWithValue] = useState<boolean>(!!defaultValue)

    useEffect(() => setScale(generateAnswers(answers.params)), [answers.params])

    return <ScaleWrapper>
        <StyledSlider
            withvalue={`${withValue}`}
            lastindex={answers.params.max.value - 1}
            defaultValue={defaultValue}
            marks={scale}
            step={null}
            min={answers.params.min.value}
            max={answers.params.max.value}
            onChange={(ev, newValue) => {
                selected(newValue as number);
                if (!withValue) {
                    setWithValue(true);
                }
            }}
            track={false}
        />
    </ScaleWrapper>
};
