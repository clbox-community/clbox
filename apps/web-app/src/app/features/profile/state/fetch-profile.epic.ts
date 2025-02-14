import firebase from 'firebase/compat/app';
import { Epic } from 'redux-observable';
import { combineLatest, Observable, of } from 'rxjs';
import { distinct, map, switchMap } from 'rxjs/operators';
import { AppState } from '../../../state/app-state';
import { firebaseApp } from '../../firebase/firebase.app';
import { profileFetched } from './profile-fetched';
import { Profile } from 'user-profile-model';

const firestore = firebaseApp.firestore();

export const fetchProfileEpic: Epic<unknown, unknown, AppState> = (_, state$) =>
    combineLatest([
        state$.pipe(map(state => state.authentication?.email)),
        state$.pipe(map(state => state.team?.current?.id))
    ]).pipe(
        distinct(([user, team]) => `${user}/${team}`),
        switchMap(([user, team]) => {
            if (user && team) {
                return new Observable<firebase.firestore.DocumentSnapshot>(subscriber => {
                    firestore.collection(`team/${team}/user`).doc(user)
                        .onSnapshot(subscriber);
                });
            } else {
                return of<firebase.firestore.DocumentSnapshot>();
            }
        }),
        map(profileDoc => profileDoc.data()),
        map(profile => ({
            ...profile,
            locale: profile.locale ?? 'pl-PL'
        } as Profile)),
        map(profile => profileFetched({ profile }))
    );
