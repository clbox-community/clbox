import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import {CircularProgress} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {Link} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {AppState} from '../../state/app-state';
import {firebaseApp} from '../firebase/firebase.app';
import {OneColumnLayout} from '../layout/one-column-layout';
import {Survey} from '../survey/model/survey';

const firestore = firebaseApp.firestore();

type SurveyItem = Survey & { id: string };

const SurveysView = ({teamId, userId}: ViewProps) => {

    const [surveys, setSurveys] = useState<SurveyItem[]>(undefined);

    useEffect(() => {
        (async () => {
            if (teamId && userId) {
                const queryResult = await firestore
                    .collection(`/team/${teamId}/survey`)
                    .where("forUser", "==", userId)
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

    return <OneColumnLayout>
        {surveys?.length > 0 && surveys.map(survey => <Card key={survey.id}>
            <Link to={`/s/${teamId}/${survey.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <CardContent>
                    <div>{survey.title}</div>
                    <div style={{fontSize: '0.8em', fontStyle: 'italic', color: 'gray'}}>
                        <div>Pytania: {survey.pages.length}</div>
                        <div>Utworzona: {survey.created}</div>
                    </div>
                </CardContent>
            </Link>
        </Card>)}
        {surveys === undefined && <div style={{textAlign: 'center', marginTop: '64px'}}>
            <CircularProgress/>
        </div>}
        {surveys?.length === 0 && <Card>
            <CardContent style={{textAlign: 'center'}}>
                <div><ThumbUpIcon/></div>
                <div>Nie masz żadnych niewypełnionych ankiet</div>
            </CardContent>
        </Card>}
    </OneColumnLayout>;
}

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
