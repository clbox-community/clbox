import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import {styled as muiStyled} from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import React from "react";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../../state/app-state";
import {logout} from "../../../authentication/state/logout/logout.action";
import {useNavigate} from "react-router-dom";

const StyledAvatar = muiStyled(Avatar)`
    background-color: ${({theme}) => theme.palette.secondary.main};
    cursor: pointer;
`;

const PopoverContent = styled.div`
    padding: 16px
`;

const PopoverActions = styled.div`
    padding: 8px;
    display: flex;
    justify-content: center;
`;

const NavbarUserCardView = ({profile, onLogout}: ViewProps) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return !profile ? <></> : <div>
        <StyledAvatar onClick={ev => setAnchorEl(ev.currentTarget)}>
            {profile.username.substr(0, 2).toUpperCase()}
        </StyledAvatar>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            sx={{padding: 16}}
        >
            <PopoverContent>
                <div><Typography variant={"subtitle1"}>{profile.display_name}</Typography></div>
                <div>{profile.email}</div>
                <PopoverActions>
                    <IconButton>
                        <SettingsIcon/>
                    </IconButton>
                    <IconButton onClick={() => {
                        setAnchorEl(null);
                        navigate('/profile');
                    }}>
                        <AccountCircleIcon/>
                    </IconButton>
                    <IconButton color="secondary" onClick={onLogout}>
                        <PowerSettingsNewIcon/>
                    </IconButton>
                </PopoverActions>
            </PopoverContent>
        </Popover>
    </div>;
};

type ViewProps = ConnectedProps<typeof connector>

const connector = connect(
    (state: AppState) => ({
        profile: state.profile?.profile
    }),
    {
        onLogout: () => logout()
    }
);

export const NavbarUserCard = connector(NavbarUserCardView);
