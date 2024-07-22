import { AssessmentsPending } from './assessments-pending';
import { OneColumnLayoutWide } from '../../layout/one-column-layout-wide';
import { AssessmentsActive } from './assessments-active';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../state/app-state';
import { useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Snackbar } from '@mui/material';

export const AssessmentsView = ({}: ConnectedProps<typeof connector>) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [toast, setToast] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (searchParams.has('created')) {
            setToast('Utworzona ankieta jest właśnie wysyłana do osób oceniających. Ankiety pojawią się na listach w ciągu kilku minut.');
            setSearchParams({}, {
                replace: true
            });
        }
    }, [searchParams, setSearchParams]);
    useEffect(() => {
        if (searchParams.has('finished')) {
            setToast('Dziękujemy za wypełnienie ankiety. Twoje wyniki zostaną opublikowane w ciągu kilku minut.');
            setSearchParams({}, {
                replace: true
            });
        }
    }, [setToast, setSearchParams]);
    return <OneColumnLayoutWide>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={!!toast}
            autoHideDuration={5000}
            onClose={() => setToast(undefined)}
            message={toast}
            key="toastSnackbar"
        />
        <div style={{ marginBottom: '24px' }}>
            <AssessmentsPending />
        </div>
        {<div style={{ marginBottom: '24px' }}>
            <AssessmentsActive />
        </div>}
        {/*{<div>*/}
        {/*    <AssessmentsArchive/>*/}
        {/*</div>}*/}
    </OneColumnLayoutWide>;
};

const connector = connect(
    (state: AppState) => ({}),
    {}
);

export const Assessments = connector(AssessmentsView);
