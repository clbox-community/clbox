import {onRequest} from 'firebase-functions/v2/https';
import type {HttpsOptions} from 'firebase-functions/v2/https';

export const awakeHandlerFactory = (options?: HttpsOptions) =>
    onRequest(options ?? {}, (request, response) => {
        response.status(200).send({status: 'ok'});
    });
