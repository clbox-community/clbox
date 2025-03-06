import * as firebase from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';
import { getChapterStatsFactory } from './app/get-chapter-stats/get-chapter-stats-factory';

firebase.initializeApp();

setGlobalOptions({ region: 'europe-west3', memory: '256MiB', maxInstances: 1 });

export const getChapterStatsV2 = getChapterStatsFactory(firebase);
