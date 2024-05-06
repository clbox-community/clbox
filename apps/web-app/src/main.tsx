import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import {Provider} from 'react-redux';
import {AppWrapper} from './app/app-wrapper';
import {firebaseApp} from './app/features/firebase/firebase.app';
import {FirebaseContext} from './app/features/firebase/firebase.context';
import {store} from './app/store/store';
import {createRoot} from 'react-dom/client';

import {createTheme, ThemeProvider} from '@mui/material/styles';
import {BrowserRouter} from "react-router-dom";

const theme = createTheme({
    typography: {
    },
    palette: {
        primary: {
            main: '#b31536',
        },
        secondary: {
            main: '#999999',
        },
    },
});

const container = document.getElementById('clbox');
const root = createRoot(container);
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline>
            <FirebaseContext.Provider value={firebaseApp}>
                <Provider store={store}>
                    <BrowserRouter>
                        <AppWrapper/>
                    </BrowserRouter>
                </Provider>
            </FirebaseContext.Provider>
        </CssBaseline>
    </ThemeProvider>
);
