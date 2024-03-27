import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Navigate} from 'react-router';
import styled from 'styled-components';
import {AppRoutingUnauthenticated} from './app-routing';
import {LoginWait} from './features/authentication/components/login-wait/login-wait';
import {AppState} from './state/app-state';
import {ScrollToTop} from "./features/scroll-to-top/scroll-to-top";
import {LayoutHeader} from "./features/layout/layout-header";
import {LayoutBody} from "./features/layout/layout-body";
import {NavbarAnonymous} from "./features/navbar/navbar-anonymous";

const ViewWrapper = styled.div`
    margin-top: 32px;
`;

export const UnauthenticatedAppView = ({authenticated}: ViewProps) => <>
    {authenticated === undefined && <ViewWrapper><LoginWait/></ViewWrapper>}
    {authenticated === true && <Navigate to='/'/>}
    {authenticated === false && <>
        <ScrollToTop/>
        <LayoutHeader>
            <NavbarAnonymous/>
        </LayoutHeader>
        <LayoutBody>
            <AppRoutingUnauthenticated/>
        </LayoutBody>
    </>}
</>;

type ViewProps = ConnectedProps<typeof connector>

const connector = connect(
    (state: AppState) => ({
        authenticated: state.authentication.authenticated
    })
);

export const UnauthenticatedApp = connector(UnauthenticatedAppView);
