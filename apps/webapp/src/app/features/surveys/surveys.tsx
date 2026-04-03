import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { CircularProgress } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../state/app-state';
import { firebaseApp } from '../firebase/firebase.app';
import { OneColumnLayout } from '../layout/one-column-layout';
import { Survey } from '../survey/model/survey';
import Button from '@mui/material/Button';

const firestore = firebaseApp.firestore();

type SurveyItem = Survey & { id: string };

const timeInDay = 24 * 60 * 60 * 1000;
const cutOffTime = 3 * 30 * timeInDay;

const SurveysView = ({ teamId, userId }: ViewProps) => {

    const [surveys, setSurveys] = useState<SurveyItem[]>(undefined);
    const [showAll, setShowAll] = useState<boolean>(false);
    const [surveysFiltered, setSurveysFiltered] = useState<SurveyItem[]>(undefined);

    useEffect(() => {
        (async () => {
            if (teamId && userId) {
                const queryResult = await firestore
                    .collection(`/team/${teamId}/survey`)
                    .where('forUser', '==', userId)
                    .get();
                setSurveys(
                    queryResult.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as SurveyItem))
                );
            } else if (surveys !== undefined) {
                setSurveys(undefined);
            }
        })();
    }, [teamId, userId]);

    useEffect(() => {
        if (surveys) {
            setSurveysFiltered(
                surveys.filter(survey => showAll || (survey.createdTimestamp >= new Date().getTime() - cutOffTime))
            );
        } else {
            setSurveysFiltered(undefined);
        }
    }, [surveys, showAll]);

    return <OneColumnLayout>
        {surveysFiltered?.length > 0 && surveysFiltered.map(survey => <Card key={survey.id}>
            <Link to={`/s/${teamId}/${survey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardContent>
                    <div>{survey.title}</div>
                    <div style={{ fontSize: '0.8em', fontStyle: 'italic', color: 'gray' }}>
                        <div>Pytania: {survey.pages.length}</div>
                        <div>Utworzona: {survey.created}</div>
                    </div>
                </CardContent>
            </Link>
        </Card>)}
        {!showAll && surveysFiltered?.length < surveys?.length && <div style={{ marginTop: 16, fontSize: '0.9em', textAlign: 'center' }}>
            <Button variant={'text'} onClick={() => setShowAll(true)}>pokaż więcej</Button>
            <div style={{ color: 'gray', fontStyle: 'italic' }}>Ankiety starsze niż 3 miesiące są ukrywane.</div>
        </div>}
        {surveys === undefined && <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <CircularProgress />
        </div>}
        {surveys?.length === 0 && <Card>
            <CardContent style={{ textAlign: 'center' }}>
                <div><ThumbUpIcon /></div>
                <div>Nie masz żadnych niewypełnionych ankiet</div>
            </CardContent>
        </Card>}
    </OneColumnLayout>;
};

interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id,
        userId: state.authentication?.email
    }),
    {}
);

export const Surveys = connector(SurveysView);
