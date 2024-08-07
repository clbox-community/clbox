import { EMPTY, from } from 'rxjs';
import { catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { firebaseApp } from '../../../firebase/firebase.app';
import { editFeedbackLabels } from './edit-feedback-labels.action';
import { AppState } from '../../../../state/app-state';
import { Epic } from 'redux-observable';

export const editFeedbackLabelsEpic: Epic<unknown, unknown, AppState> = (action$, state$) => action$
    .pipe(
        filter(editFeedbackLabels.match),
        withLatestFrom(state$),
        switchMap(([{ payload }, state]) =>
            from(
                firebaseApp.firestore()
                    .collection(`team/${state.team.current.id}/user/${state.authentication.email}/inbox/`)
                    .doc(payload.message.id)
                    .update({
                        labels: payload.labels,
                        labelMap: payload.labels.reduce((map, label) => ({ ...map, [label]: true }), {})
                    })
            ).pipe(
                switchMap(_ => EMPTY),
                catchError(error => {
                    console.error(
                        `Can't change inbox message labels [team/${state.team.current.id}/user/${state.authentication.email}/inbox/${payload.message.id}]`,
                        error
                    );
                    return EMPTY;
                })
            ))
    );
