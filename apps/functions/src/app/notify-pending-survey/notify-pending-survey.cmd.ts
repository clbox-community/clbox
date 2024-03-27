import {notifyPendingSurveyHandler} from "./notify-pending-survey.handler";

import * as firebase from "firebase-admin";

const [, , ...args] = process.argv;
const project = args[0];

if (!project) {
    throw new Error(`expected projectId`);
}

firebase.initializeApp({
    projectId: project
});

const config = {
    webapp: {
        url: 'webapp.url'
    },
    slack: {
        bottoken: 'slack.bottoken'
    }
};

(async () => await notifyPendingSurveyHandler(firebase, config))();
