import CommentIcon from '@mui/icons-material/Comment';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import {grey} from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';
import {Subject} from 'rxjs';
import {debounceTime, tap} from "rxjs/operators";
import styled from 'styled-components';
import {Feedback} from '../../model/feedback';

const StyledCard = styled(Card)`
    width: 100%;
`;

const Content = styled(Typography)`
    white-space: pre-wrap;
`;

const Filler = styled.div`
    flex: 1;
`;

export const FeedbackCard = ({feedback, existingLabels, onDiscard, onCommentChange, onLabelsChange}: ViewProps) => {
    const hasComments = feedback.comments?.length > 0;
    const [comment, setComment] = useState('');
    const [labels, setLabels] = useState([]);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentDraft, setCommentDraft] = useState(false);
    const [commentText$] = useState(new Subject<string>());
    const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState(undefined);
    useEffect(() => {
        const subscription = commentText$
            .pipe(
                tap(msg => setComment(msg)),
                tap(() => !commentDraft && setCommentDraft(true)),
                debounceTime(1000),
            )
            .subscribe(msg => {
                onCommentChange(msg);
                setCommentDraft(false);
            });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => setComment(feedback?.comments?.[0]?.text ?? ''), [feedback]);
    useEffect(() => setLabels(feedback?.labels ?? []), [feedback]);
    const onLabelsAutocompleteChange = (_, labels) => {
        setLabels(labels);
        onLabelsChange(labels);
    };

    return <StyledCard>
        <CardHeader
            title={feedback.forName}
            subheader={`by ${feedback.fromName} on ${feedback.date}`}
            action={
                <IconButton onClick={ev => setHeaderMenuAnchorEl(ev.currentTarget)}>
                    <MoreVertIcon/>
                </IconButton>
            }
        />
        <Menu
            anchorEl={headerMenuAnchorEl}
            open={Boolean(headerMenuAnchorEl)}
            onClose={() => setHeaderMenuAnchorEl(undefined)}
        >
            <MenuItem onClick={onDiscard} sx={{color: 'secondary.main'}}>
                <ListItemIcon>
                    <DeleteForeverIcon color={"secondary"}/>
                </ListItemIcon>
                <ListItemText primary="Discard"/>
            </MenuItem>
        </Menu>
        <CardContent>
            <Content variant="body2">{feedback.message}</Content>
        </CardContent>
        {onDiscard && <CardActions>
            <Autocomplete
                multiple
                options={existingLabels ?? []}
                value={labels}
                freeSolo
                disableClearable
                onChange={onLabelsAutocompleteChange}
                renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                        <Chip variant="outlined" label={option} {...getTagProps({index})} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        placeholder={labels.length == 0 ? 'Labels' : undefined}
                        InputProps={{...params.InputProps, disableUnderline: true}}
                        sx={{
                            minWidth: '300px',
                            marginLeft: '8px'
                        }}
                    />
                )}
            />
            <Filler/>
            <Button size="small"
                    color="primary"
                    onClick={() => setCommentsVisible(!commentsVisible)}
                    sx={{
                        color: !hasComments ? grey[500] : ''
                    }}
            >
                <CommentIcon/>
            </Button>
        </CardActions>}
        <Collapse in={commentsVisible} timeout="auto" unmountOnExit>
            <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'right'
            }}>
                <TextField
                    value={comment}
                    sx={{flex: 1}}
                    multiline
                    placeholder={'Add comments'}
                    onChange={ev => commentText$.next(ev.target.value)}
                />
                {commentDraft && <LinearProgress sx={{height: '2px'}}/>}
            </CardContent>
        </Collapse>
    </StyledCard>;
};

interface ViewProps {
    feedback: Feedback;
    existingLabels: string[];
    onDiscard?: () => void,
    onCommentChange?: (value: string) => void
    onLabelsChange?: (value: string[]) => void
}
