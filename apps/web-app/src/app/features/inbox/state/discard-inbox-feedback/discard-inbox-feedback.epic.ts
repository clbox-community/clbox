import { EMPTY, from } from 'rxjs';
import { catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { firebaseApp } from '../../../firebase/firebase.app';
import { discardInboxFeedback } from './discard-inbox-feedback.action';
import { AppState } from '../../../../state/app-state';
import { Epic } from 'redux-observable';

export const discardInboxFeedbackEpic: Epic<unknown, unknown, AppState> = (action$, state$) => action$
    .pipe(
        filter(discardInboxFeedback.match),
        withLatestFrom(state$),
        switchMap(([{ payload }, state]) =>
            from(
                firebaseApp.firestore()
                    .collection(`team/${state.team.current.id}/user/${state.authentication.email}/inbox/`)
                    .doc(payload.message.id)
                    .delete()
            ).pipe(
                switchMap(_ => EMPTY),
                catchError(error => {
                    console.error(
                        `Can't discard inbox message [team/${state.team.current.id}/user/${state.authentication.email}/inbox/${payload.message.id}]`,
                        error
                    );
                    return EMPTY;
                })
            ))
    );
