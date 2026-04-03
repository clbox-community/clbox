import styled from "styled-components";
import Button from "@mui/material/Button";
import React from "react";

export const NavbarActionButton = styled(props => <Button color={props.color} {...props}>{props.children}</Button>)`
    min-width: 0;
`;
