import {createAction} from '@reduxjs/toolkit';
import {Message} from '../../../message/model/message';

export interface SentFetchedPayload {
    messages: Message[]
}

export const sentFetched = createAction<SentFetchedPayload>('SentFetched');
