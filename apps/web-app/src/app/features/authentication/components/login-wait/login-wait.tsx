import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import {FullScreenCentered} from '../../../layout/full-screen-centered';

export const LoginWait = () => <FullScreenCentered>
    <CircularProgress size={50}/>
</FullScreenCentered>;
