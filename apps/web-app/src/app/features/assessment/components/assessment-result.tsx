import {useParams} from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {useAssessmentResults} from "../state/use-assessment-results";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {questionsWithCategories} from "../state/questions-with-categories";
import {useAssessment} from "../state/use-assessment";
import {userInText} from "./user-In-text";
import styled from "styled-components";
import {QuestionWithCategory} from "../state/question-with-category";
import {WithId} from "../model/with-id";
import {Assessment} from "../model/assessment";
import {UserAssessment} from "../model/user-assessment";
import {useState} from "react";

export const OneColumnLayoutUltraWide = styled.div`
    width: 90%;
    margin: 0 auto;
`;

function expectedResponses(q: QuestionWithCategory, assessment: WithId & Assessment) {
    return q.question.expectedResponses[assessment.user.seniority === 'lead' ? 'seniorPlus' : assessment.user.seniority];
}

function isValidResponse(q: QuestionWithCategory, assessment: WithId & Assessment, result: WithId & UserAssessment) {
    return expectedResponses(q, assessment).indexOf(result.response[q.question.id]) >= 0;
}

export const AssessmentResultView = ({teamId}: ConnectedProps<typeof connector>) => {
    const {uuid} = useParams<{ uuid: string }>();
    const assessment = useAssessment(teamId, uuid);
    const results = useAssessmentResults(teamId, uuid);
    const [showFails, setShowFails] = useState<boolean>(false);

    return assessment && <OneColumnLayoutUltraWide>
        <Card>
            <CardContent>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '0.9em'}}>
                    <span style={{cursor: 'pointer', color: 'gray'}}
                          onClick={() => setShowFails(f => !f)}
                    >
                        {showFails ? 'Ukryj poprawne pytania' : 'Pokaż poprawne pytania'}
                    </span>
                </div>
                {results && <table>
                    <tr>
                        <td>
                        ID
                        </td>
                        <td>
                            Pytanie
                        </td>
                        {results.map(result =>
                            <td key={result.assessee}>
                                {result.assessee.substring(0, result.assessee.indexOf('@'))}
                            </td>
                        )}
                        {/*<td>*/}
                        {/*    Oczekiwane*/}
                        {/*</td>*/}
                    </tr>
                    {questionsWithCategories
                        .filter(q => showFails || results.some(r => !isValidResponse(q, assessment, r)))
                        .map(q =>
                        <tr key={q.question.id}>
                            <td>
                                {q.question.id.replace('_', '.')}
                            </td>
                            <td>
                                {q.question.text3rd && userInText(q.question.text3rd[assessment.user.textForm], assessment.user.name)}
                                {!q.question.text3rd && userInText(q.question.text1st[assessment.user.textForm], assessment.user.name)}
                            </td>
                            {results.map(result =>
                                <td key={result.assessee}
                                    style={{
                                        color: isValidResponse(q, assessment, result) ? 'green' : 'red',
                                        flexBasis: '50px',
                                        marginRight: '8px'
                                    }}
                                >
                                    {result.response[q.question.id] ? 'tak' : 'nie'}
                                </td>
                            )}
                            {/*<td>*/}
                            {/*    {expectedResponses(q, assessment).map(r => r ? 'tak' : 'nie').join(', ')}*/}
                            {/*</td>*/}
                        </tr>
                    )}
                </table>}
            </CardContent>
        </Card>
    </OneColumnLayoutUltraWide>;
};

const connector = connect(
    (state: AppState) => ({
        teamId: state?.team?.current?.id
    }),
    {}
);

export const AssessmentResult = connector(AssessmentResultView);
