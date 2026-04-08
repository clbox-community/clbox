import { checkSlackSignature } from '../slack/check-slack-signature';
import { PendingFeedbackMessage } from '../pending-feedback-message';
import { SlashCommandRequest } from '../slack/slash-command-request';
import {onRequest} from 'firebase-functions/v2/https';
import type {HttpsOptions} from 'firebase-functions/v2/https';

export const kudosHandlerFactory = (
    config: Record<string, any>,
    pubsub: import('@google-cloud/pubsub').PubSub,
    userFeedbackTopic: string,
    channelFeedbackTopic: string,
    options?: HttpsOptions) =>
    onRequest(options ?? {}, async (request, response) => {
        if (request.method !== 'POST') {
            response.status(405).send('Invalid request method (only POST allowed)');
            return;
        }
        if (!checkSlackSignature(
            config.slack.signingsecret,
            request.headers['x-slack-signature'] as string,
            request.headers['x-slack-request-timestamp'],
            request.rawBody.toString()
        )) {
            console.log('Invalid slack signing');
            response.status(401).send('Invalid slack signing');
            return;
        }

        const slashCommand: SlashCommandRequest = request.body;

        const userMention = slashCommand.text.match(/@[^\s]+/);
        const channelMention = slashCommand.text.match(/#[^\s]+/);
        if (userMention && userMention.length === 1) {
            const mention = userMention[0].substr(1);
            const feedback = slashCommand.text.substr(mention.length + 2);

            await pubsub.topic(userFeedbackTopic).publish(Buffer.from(JSON.stringify(<PendingFeedbackMessage>{
                mention, feedback, user: slashCommand.user_name, userId: slashCommand.user_id, team: slashCommand.team_domain
            })));

            response.contentType('json')
                .status(200)
                .send({
                    'response_type': 'ephemeral',
                    'text': `Thank you for your feedback!`
                });
        } else if (channelMention && channelMention.length === 1) {
            const mention = channelMention[0].substr(1);
            const feedback = slashCommand.text.substr(mention.length + 2);

            console.log(`Channel feedback for ${mention}: ${feedback}`);
            // await pubsub.topic(channelFeedbackTopic).publish(Buffer.from(JSON.stringify(<PendingFeedbackMessage>{
            //   mention, feedback, user: slashCommand.user_name, userId: slashCommand.user_id, team: slashCommand.team_domain
            // })));
            //
            // response.contentType('json')
            //   .status(200)
            //   .send({
            //     'response_type': 'ephemeral',
            //     'text': `Thank you for your feedback!`
            //   });

            response.contentType('json')
                .status(200)
                .send({
                    'response_type': 'ephemeral',
                    'text': `Channel feedback is currently suspended due to maintenance. Please contact channel manager directly. Your message was: ${feedback}`
                });
        } else {
            response.contentType('json')
                .status(200)
                .send({
                    'response_type': 'ephemeral',
                    'text': `Please use /kudos @mention/#mention rest of the feedback`
                });
        }
    });
