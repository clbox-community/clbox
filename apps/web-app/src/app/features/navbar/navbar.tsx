import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React, {PropsWithChildren, ReactNode, useMemo} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Link} from 'react-router-dom';
import {AppState} from "../../state/app-state";
import {NavbarUserCard} from "../profile/components/navbar-user-card/navbar-user-card";
import {SelectTeam} from '../team/components/select-team/select-team';
import {NavbarActionButton} from "./navbar-action-button";
import {NavbarFiller} from "./navbar-filler";
import {NavbarMenuSpacer} from "./navbar-menu-spacer";
import {useLocation} from "react-router";
import {globalNavigation} from "./global-navigation";

const NavbarView = ({isLeader}: ConnectedProps<typeof connector>) => {
    const {pathname: route} = useLocation();
    const userNavigation = useMemo(
        () => globalNavigation.filter(group => group.condition?.({isLeader}) ?? true),
        [isLeader]
    );
    return (
        <AppBar position="static" color={'default'}>
            <Toolbar>
                <div style={{marginRight: '8px', fontWeight: 600}}>clbox</div>
                <NavbarMenuSpacer/>
                <SelectTeam></SelectTeam>
                <NavbarMenuSpacer/>

                {userNavigation?.map(
                    (group, index) => <React.Fragment key={group.path}>
                        <NavbarSubmenuGroup prefix={group.path} header={
                            <NavbarSubmenuItem path={group.path + group.items.find(item => item.default).path}
                                               fontWeight={route.startsWith(group.path) ? 300 : 400}>
                                {group.text}
                            </NavbarSubmenuItem>
                        }>
                            {group.items
                                .filter(item => item.condition?.({isLeader}) ?? true)
                                .map(item => <NavbarSubmenuItem key={item.path}
                                                                active={route.indexOf(group.path + item.path) === 0}
                                                                path={group.path + item.path}>
                                    {item.text}
                                </NavbarSubmenuItem>)}
                        </NavbarSubmenuGroup>
                        {index < userNavigation.length - 1 && <NavbarMenuSpacer/>}
                    </React.Fragment>
                )}
                <NavbarFiller/>
                <NavbarUserCard/>
            </Toolbar>
        </AppBar>
    );
};

const NavbarSubmenuGroup: React.FC<PropsWithChildren<{ prefix: string, header: ReactNode }>> = ({
                                                                                 prefix,
                                                                                 children,
                                                                                 header
                                                                             }) => {
    const {pathname: current} = useLocation();
    return <>
        {header}
        {current.startsWith(prefix) ? children : undefined}
    </>
}

const NavbarSubmenuItem: React.FC<PropsWithChildren<{ path: string, fontWeight?: number, active?: boolean }>> = ({
                                                                                                  path,
                                                                                                  active,
                                                                                                  fontWeight,
                                                                                                  children
                                                                                              }) => {
    return <NavbarActionButton sx={{fontWeight: active ? 500 : (fontWeight ?? 400)}}
                               color="inherit"
                               component={Link}
                               to={path}>
        {children}
    </NavbarActionButton>;
}

const connector = connect(
    (state: AppState) => ({
        isLeader: state.profile?.profile?.leader === true,
    }),
    {}
);

export const Navbar = connector(NavbarView);
