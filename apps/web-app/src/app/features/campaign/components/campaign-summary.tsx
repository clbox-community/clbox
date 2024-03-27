import {ButtonGroup, CircularProgress, Divider} from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem/ListItem";
import {Fragment, useEffect, useState} from "react";
import {connect, ConnectedProps} from "react-redux";
import {useParams} from "react-router";
import styled from 'styled-components';
import {AppState} from "../../../state/app-state";
import {firebaseApp} from "../../firebase/firebase.app";
import {SurveyAnswerScale} from "../../survey/model/survey-answer-scale";
import {SurveyAnswerType} from "../../survey/model/survey-answer-type";
import {SurveyPage, SurveyPageType} from "../../survey/model/survey-page";
import {SurveyQuestionAnswerType} from "../../survey/model/survey-question-answered";
import {SurveyQuestionData} from "../../survey/model/survey-question-data";
import {Campaign} from "../model/campaign";
import {CampaignAnswers} from "../model/campaign-answers";

const firestore = firebaseApp.firestore();

enum AnswersGrouping {
    BySurvey, ByAnswear
}

function asScaleParams(obj: any): SurveyAnswerScale {
    if ('min' in obj && 'max' in obj) {
        return obj as SurveyAnswerScale;
    } else {
        throw new Error(`${obj} is not SurveyAnswerScale`);
    }
}

const QuestionDetails = ({page}: { page: SurveyPage<SurveyQuestionData> }) => {
    return <div
        style={{
            margin: '4px',
            backgroundColor: '#fafafa',
            padding: '4px',
            fontStyle: 'italic',
            border: '1px dashed #e0e0e0',
            fontSize: '0.8em'
        }}
    >
        <div>
            {page.data.type === SurveyAnswerType.text ? 'Pytanie otwarte' : `Wartość ze skali`}
            ,&nbsp;
            {page.required ? 'wymagane' : 'opcjonalne'}
            ,&nbsp;
            {page.withSkip ? 'pomijalne' : 'bez możliwości pominięcia'}
            ,&nbsp;
            {page.withComment ? 'z możliwością komentowania' : 'bez możliwości komentowania'}
            .
        </div>
        {page.data.type === SurveyAnswerType.scale && <div>
            <ul>
                <li>{asScaleParams(page.data.params).min.value} - {asScaleParams(page.data.params).min.text}</li>
                {asScaleParams(page.data.params).labels && Object.keys(asScaleParams(page.data.params).labels).map(step => <li key={step}>
                    {step} - {asScaleParams(page.data.params).labels[step].text}
                </li>)}
                <li>{asScaleParams(page.data.params).max.value} - {asScaleParams(page.data.params).max.text}</li>
            </ul>
        </div>}
    </div>;
};

const SummaryDetailsRow = styled.div`
    display: flex;
`;

const SummaryDetailsLabelCell = styled.div`
    width: 100px;
    font-weight: 600;
`

const SummaryDetailsContentCell = styled.div`
    flex: 1;
    font-style: italic;
`

const CampaignSummaryView = ({teamId}: ViewProps) => {

    const {uuid} = useParams<{ uuid: string }>();
    const [campaign, setCampaign] = useState<Campaign>(undefined);
    const [answers, setAnswers] = useState<CampaignAnswers[]>(undefined);
    const [grouping, setGrouping] = useState<AnswersGrouping>(AnswersGrouping.ByAnswear);

    useEffect(() => {
        (async () => {
            if (teamId && uuid) {
                const campaignDoc = await firestore
                    .collection(`/team/${teamId}/campaign`)
                    .doc(uuid)
                    .get();
                setCampaign({
                    id: campaignDoc.id,
                    ...campaignDoc.data() as Campaign
                });

                const answersQueryResult = await firestore
                    .collection(`/team/${teamId}/campaign`)
                    .doc(uuid)
                    .collection(`answers`)
                    .get();
                setAnswers(
                    answersQueryResult.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data() as CampaignAnswers
                        }))
                );
            } else if (campaign !== undefined) {
                setCampaign(undefined);
                setAnswers(undefined);
            }
        })();
    }, [teamId, uuid]);

    return <div style={{maxWidth: '800px', margin: '0 auto'}}>
        {(!campaign || !answers) && <div style={{marginTop: '32px', textAlign: 'center'}}>
            <CircularProgress/>
        </div>}
        {campaign && answers && <>
            <Card>
                <CardContent>
                    <div>{campaign?.surveyTemplate.title}</div>
                    <div style={{fontSize: '0.9em', fontStyle: 'italic'}}>{campaign?.details.comment}</div>
                    <div style={{fontSize: '0.8em', marginTop: '16px'}}>
                        <SummaryDetailsRow>
                            <SummaryDetailsLabelCell>Data</SummaryDetailsLabelCell>
                            <SummaryDetailsContentCell>{campaign?.created}</SummaryDetailsContentCell>
                        </SummaryDetailsRow>
                        <SummaryDetailsRow>
                            <SummaryDetailsLabelCell>Odpowiedzi</SummaryDetailsLabelCell>
                            <SummaryDetailsContentCell>
                                {answers.length} z {campaign.users.length} ankiet
                                ({Math.round(answers.length / campaign.users.length * 100)}%)
                            </SummaryDetailsContentCell>
                        </SummaryDetailsRow>
                        <SummaryDetailsRow>
                            <SummaryDetailsLabelCell>Typ ankiety</SummaryDetailsLabelCell>
                            <SummaryDetailsContentCell>{campaign?.responsePrivacy === "signed" ? "jawna" : "anonimowa"}</SummaryDetailsContentCell>
                        </SummaryDetailsRow>
                        <SummaryDetailsRow>
                            <SummaryDetailsLabelCell>Użytkownicy</SummaryDetailsLabelCell>
                            <SummaryDetailsContentCell>{campaign?.users.join(', ')}</SummaryDetailsContentCell>
                        </SummaryDetailsRow>
                    </div>
                </CardContent>
            </Card>
            <div style={{textAlign: 'center', marginTop: '32px', marginBottom: '32px'}}>
                <ButtonGroup variant="text">
                    <Button variant={'contained'}>Pytania</Button>
                    <Button variant={'outlined'} disabled={true}>Ankiety</Button>
                </ButtonGroup>
            </div>
            {grouping === AnswersGrouping.ByAnswear && <>
                {campaign?.surveyTemplate
                    .pages
                    .filter(page => page.type === SurveyPageType.question)
                    .map(page => <Fragment key={page.id}>
                        <Card style={{marginBottom: '16px'}}>
                            <CardHeader
                                title={page.text.main}
                                titleTypographyProps={{variant: 'h6'}}
                                subheader={`${page.text.category}`}
                                subheaderTypographyProps={{variant: 'subtitle2'}}
                            />
                            <CardContent>
                                <div>
                                    <QuestionDetails page={page as SurveyPage<SurveyQuestionData>}/>
                                </div>
                                <List>
                                    {answers?.map((answer, index) => <Fragment key={answer.id}>
                                        <ListItem>
                                            <div>
                                                <div style={{fontSize: '0.7em', fontStyle: 'italic'}}>
                                                    {answer.answers[page.id].type === SurveyQuestionAnswerType.Submit ? 'Odpowiedziano' : 'Pominięto'}
                                                </div>
                                                <div>
                                                    {!!answer.answers[page.id].value ? `${answer.answers[page.id].value}` : '(pusta odpowiedź)'}
                                                </div>
                                                {answer.answers[page.id].comment && <div style={{
                                                    fontSize: '0.8em',
                                                    fontStyle: 'italic',
                                                    paddingLeft: '8px',
                                                    marginLeft: '4px',
                                                    borderLeft: '1px dashed lightgray'
                                                }}>
                                                    {answer.answers[page.id].comment}
                                                </div>}
                                                {campaign?.responsePrivacy === "signed" && <div style={{
                                                    fontSize: '0.8em',
                                                    fontStyle: 'italic',
                                                    paddingLeft: '8px',
                                                    marginLeft: '4px',
                                                    borderLeft: '1px dashed lightgray'
                                                }}>
                                                    {answer.user}
                                                </div>}
                                            </div>
                                        </ListItem>
                                        {answers.length - 1 > index &&
                                            <Divider style={{marginBottom: '8px', marginTop: '8px'}}/>}
                                    </Fragment>)}
                                </List>
                            </CardContent>
                        </Card>
                    </Fragment>)}
            </>}
        </>}
    </div>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id
    }),
    {}
);

export const CampaignSummary = connector(CampaignSummaryView);
