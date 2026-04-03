import {Message} from '../../message/model/message';

export interface SentState {
    messages: {
        byId: { [key: string]: Message }
    };
}
