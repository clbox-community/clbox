import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(item: string, value: readonly string[]) {
    return {
        fontWeight: value.indexOf(item) === -1 ? undefined : '500'
    };
}

export const SelectFromDomain = ({
                                     value,
                                     domain,
                                     onChange,
                                     label,
                                     multiple,
                                     disabled
                                 }: {
    value: string | string[],
    label: string,
    domain: { id: string, label: string }[],
    onChange: (value: string[]) => void,
    multiple?: boolean,
    disabled?: boolean
}) => {
    return <Select
        multiple={multiple !== undefined ? multiple : true}
        value={value}
        disabled={disabled}
        input={<OutlinedInput label={label}/>}
        style={{width: '100%'}}
        onChange={change => {
            const newValue = typeof change.target.value === 'string' ? change.target.value.split(',') : change.target.value;
            return onChange(newValue.sort((a, b) => a.localeCompare(b)));
        }}
        renderValue={(selected) => (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                {(Array.isArray(selected) ? selected : [selected]).map((value) => (
                    <Chip key={value} label={domain.find(item => item.id === value).label}/>
                ))}
            </Box>
        )}
        MenuProps={MenuProps}
    >
        {domain.map(
            item => <MenuItem
                key={item.id}
                value={item.id}
                style={getStyles(item.id, Array.isArray(value) ? value : [value])}>
                {item.label}
            </MenuItem>
        )}
    </Select>;
}
