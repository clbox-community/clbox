import { EMPTY, from } from 'rxjs';
import { catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { firebaseApp } from '../../../firebase/firebase.app';
import { AppState } from '../../../../state/app-state';
import { editFeedbackComment } from './edit-feedback-comment.action';
import { Epic } from 'redux-observable';

export const editFeedbackCommentEpic: Epic<unknown, unknown, AppState> = (action$, state$) => action$
    .pipe(
        filter(editFeedbackComment.match),
        withLatestFrom(state$),
        switchMap(([{ payload }, state]) =>
            from(
                firebaseApp.firestore()
                    .collection(`team/${state.team.current.id}/user/${state.authentication.email}/inbox/`)
                    .doc(payload.message.id)
                    .update({
                        comments: payload.text?.trim().length > 0 ? [{ text: payload.text }] : []
                    })
            ).pipe(
                switchMap(_ => EMPTY),
                catchError(error => {
                    console.error(
                        `Can't change inbox message comment [team/${state.team.current.id}/user/${state.authentication.email}/inbox/${payload.message.id}]`,
                        error
                    );
                    return EMPTY;
                })
            ))
    );
