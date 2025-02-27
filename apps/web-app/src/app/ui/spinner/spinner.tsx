import styled from 'styled-components';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

const SpinnerWrapper = styled.div`
    width: 100%;
    margin-top: 32px;
    display: flex;
    justify-content: center;
`;

export const Spinner = () => <SpinnerWrapper>
    <CircularProgress />
</SpinnerWrapper>;
