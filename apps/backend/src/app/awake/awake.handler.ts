export const awakeHandlerFactory = (functions: import('firebase-functions/v1').FunctionBuilder) =>
    functions.https.onRequest((request, response) => {
        response.status(200).send({status: 'ok'});
    });
