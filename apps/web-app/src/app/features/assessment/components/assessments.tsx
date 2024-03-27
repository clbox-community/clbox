import {AssessmentsPending} from "./assessments-pending";
import {OneColumnLayoutWide} from "../../layout/one-column-layout-wide";
import {AssessmentsActive} from "./assessments-active";
import {AssessmentsArchive} from "./assessments-archive";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Snackbar} from "@mui/material";

export const AssessmentsView = ({isLeader}: ConnectedProps<typeof connector>) => {
    const [searchParams, setSearchParams ] = useSearchParams();
    const [toast, setToast] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (searchParams.has('created')) {
            setToast('Utworzona ankieta jest właśnie wysyłana do osób oceniających. Ankiety pojawią się na listach w ciągu kilku minut.');
            setSearchParams({}, {
                replace: true
            });
        }
    }, []);
    useEffect(() => {
        if (searchParams.has('finished')) {
            setToast('Dziękujemy za wypełnienie ankiety. Twoje wyniki zostaną opublikowane w ciągu kilku minut.');
            setSearchParams({}, {
                replace: true
            });
        }
    }, []);
    return <OneColumnLayoutWide>
        <Snackbar
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            open={!!toast}
            autoHideDuration={5000}
            onClose={() => setToast(undefined)}
            message={toast}
            key="toastSnackbar"
        />
        <div style={{marginBottom: '24px'}}>
            <AssessmentsPending/>
        </div>
        {isLeader && <div style={{marginBottom: '24px'}}>
            <AssessmentsActive/>
        </div>}
        {isLeader && <div>
            <AssessmentsArchive/>
        </div>}
        {/*<div>Otwarte ankiety (lista, status: stworzona, oczekuje na odpowiedzi, oczekuje na podsumowanie)</div>*/}
        {/*<div>Archiwalne ankiety</div>*/}
    </OneColumnLayoutWide>
}

const connector = connect(
    (state: AppState) => ({
        isLeader: state.profile?.profile?.leader === true,
    }),
    {}
);

export const Assessments = connector(AssessmentsView);
