import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

import {firebaseConfig} from './firebase.config';

export const firebaseApp = firebase.initializeApp(firebaseConfig);
