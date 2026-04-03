import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {AppState} from "../../state/app-state";

const NavbarAnonymousView = ({}: ConnectedProps<typeof connector>) => {
    return (
        <AppBar position="static" color={'default'}>
            <Toolbar>
                <div style={{marginRight: '8px', fontWeight: 600}}>clbox</div>
            </Toolbar>
        </AppBar>
    );
};

const connector = connect(
    (state: AppState) => ({}),
    {}
);

export const NavbarAnonymous = connector(NavbarAnonymousView);
