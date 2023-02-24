import { Fragment } from 'react';

import useSWRInfinite from 'swr/infinite'

import { useFeed } from '../../lib/feed';
import { useSub } from "../../lib/subscriptions";

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import LbryIcon from '../icons/lbry';
import LinkIcon from '@mui/icons-material/Link';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import YouTubeIcon from '@mui/icons-material/YouTube';

import VideoCard from './video-card';

const timePeriods = [
    { key: "now", title: "Happening now" },
    { key: "upcoming", title: "Upcoming" },
    { key: "today", title: "Today" },
    { key: "week", title: "Last week" },
    { key: "month", title: "Last month" },
    { key: "older", title: "Older" },
];

export default function VideoFeed(props) {
    const [sub, add, remove] = useSub();
    const [data, loaded, total] = useFeed(sub);

    const type = props.type;
    const showdesc = false;

    console.log("videofeed", data, loaded, total);

    return (
        <>
            {
                timePeriods.map((t) => data && data[t.key] && data[t.key][type] &&
                    <Fragment key={t.key}>
                        <Stack direction="row" spacing={0} sx={{ padding: "0" }}>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1, paddingBottom: "1rem", lineHeight: "1.75" }}>
                                {t.title}
                            </Typography>
                        </Stack>
                        <VideoGrid feed={data[t.key][type]} showdesc={showdesc} />
                        <Divider sx={{ margin: "1.5rem 0" }} />
                    </Fragment>
                )
            }
        </>
    );
}

function VideoGrid(props) {
    return (
        <Grid container spacing={3}>
            {props.feed && props.feed.map((v) =>
                <Grid key={`${v.host}_${v.videoId}`} xs={12} sm={6} md={4} lg={3}>
                    <VideoCard video={v} showdesc={props.showdesc} />
                </Grid>
            )}
        </Grid>
    );
}