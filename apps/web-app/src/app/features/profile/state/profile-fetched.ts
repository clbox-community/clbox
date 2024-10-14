import {createAction} from '@reduxjs/toolkit';
import { Profile } from 'user-profile-model';

export interface ProfileFetchedPayload {
    profile: Profile
}

export const profileFetched = createAction<ProfileFetchedPayload>('ProfileFetched');
