import * as functions from 'firebase-functions/v1';
import * as firebase from 'firebase-admin';
import {exportTechSkills} from "./export-tech-skills";

const [, , ...args] = process.argv;
const projectId = args[0];
const storageBucket = args[1];

firebase.initializeApp({
    projectId,
    storageBucket
});

(async function () {
    await exportTechSkills(functions.config(), firebase);
})();
