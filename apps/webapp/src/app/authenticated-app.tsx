import React from 'react';
import {AppRoutingAuthenticated} from './app-routing';
import {LayoutBody} from './features/layout/layout-body';
import {LayoutHeader} from './features/layout/layout-header';
import {Navbar} from './features/navbar/navbar';
import {ScrollToTop} from './features/scroll-to-top/scroll-to-top';
import {LayoutFooter} from "./features/layout/layout-footer";
import {Footer} from "./features/footer/components/footer";

export const AuthenticatedApp = () => <>
    <ScrollToTop/>
    <LayoutHeader>
        <Navbar/>
    </LayoutHeader>
    <LayoutBody>
        <AppRoutingAuthenticated/>
    </LayoutBody>
    <LayoutFooter>
        <Footer/>
    </LayoutFooter>
</>;
