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

import LbryIcon from '../icons/lbry';
import LinkIcon from '@mui/icons-material/Link';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import YouTubeIcon from '@mui/icons-material/YouTube';

import HostIcon from '../host-icon';

import { Link, linkResolver } from '../feed/link';

const hideViewHosts = [
    "lbry",
];

export default function VideoCard(props) {
    const v = props.video;

    return (
        <Card elevation={0} square {...props}>
            <CardMedia
                component={Thumbnail}
                overlay={thumbnailOverlay(v)}
                image={urlRewrite(v.thumbnail)}
                href={linkResolver(v.host, v.videoId)}
                sx={{
                    width: "100%",
                    height: 0,
                    paddingBottom: "56%"
                }}
            />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                    variant="body1"
                    component="a"
                    href={linkResolver(v.host, v.videoId)}
                    color="text.primary"
                    sx={{
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                        margin: "0.3rem 0",
                        display: "-webkit-box",
                        overflow: "hidden",
                        lineClamp: "2",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical"
                    }}
                >
                    {v.title}
                </Typography>
                <Stack direction="row" spacing={0} sx={{ marginBottom: "0.3rem" }}>
                    <Avatar src={v.channelAvatar} sx={{ width: "2.6rem", height: "2.6rem", marginRight: "0.4rem" }} />
                    <Stack direction="column" spacing={0}>
                        <Stack direction="row" spacing={0} color="text.secondary" sx={{ alignItems: "center" }}>
                            <Typography
                                variant="body2"
                                color="inherit"
                                sx={{
                                    fontSize: "0.9rem",
                                    lineHeight: "0.9rem",
                                    margin: "0.25rem 0"
                                }}
                            >
                                {v.channelTitle}
                            </Typography>
                            <HostIcon
                                host={v.host}
                                color="inherit"
                                sx={{
                                    fontSize: "1rem",
                                    margin: "0 0 0 0.2rem"
                                }}
                            />
                        </Stack>
                        <Stack direction="row" spacing={0} color="text.secondary" >
                            {!v.type.startsWith("upcoming") && !hideViewHosts.includes(v.host) && <>
                                <VisibilityIcon
                                    color="inherit"
                                    sx={{
                                        width: "1rem",
                                        height: "1rem",
                                        fontSize: "1rem",
                                        marginRight: "0.2rem"
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="inherit"
                                    sx={{
                                        fontSize: "0.75rem",
                                        lineHeight: "1rem",
                                        marginRight: "0.4rem"
                                    }}
                                >
                                    {v.views > 0 ? v.views : 0}
                                </Typography>
                            </>}
                            {!v.type.startsWith("live") && <>
                                <PublishIcon
                                    color="inherit"
                                    sx={{
                                        width: "1rem",
                                        height: "1rem",
                                        fontSize: "1rem",
                                        marginRight: "0.2rem"
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="inherit"
                                    sx={{
                                        fontSize: "0.75rem",
                                        lineHeight: "1rem"
                                    }}
                                >
                                    {releaseBuilder(v)}
                                </Typography>
                            </>}
                        </Stack>
                    </Stack>
                </Stack>
                <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                        textAlign: "justify",
                        wordBreak: "break-all",
                        display: props.showdesc ? "-webkit-box" : "none",
                        overflow: "hidden",
                        lineClamp: "4",
                        WebkitLineClamp: "4",
                        WebkitBoxOrient: "vertical"
                    }}
                >
                    {v.description}
                </Typography>
            </CardContent>
            <CardActions sx={{ padding: 0 }}>
                <Stack direction="row" spacing={1}>
                    {Object.keys(v.sources).map((k) => <Link key={`${k}_${v.sources[k]}`} host={k} videoId={v.sources[k]} />)}
                </Stack>
            </CardActions>
        </Card>
    );
}

function Thumbnail(props) {
    return (
        <a
            {...props}
            style={{
                ...props.style,
                position: "relative",
                borderRadius: "5px"
            }}
        >
            <Typography
                variant="body2"
                color="#eee"
                sx={{
                    position: "absolute",
                    right: 5,
                    bottom: 5,
                    padding: "4px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)"
                }}
            >
                {props.overlay}
            </Typography>
            {props.children}
        </a>
    )
}

function urlRewrite(url) {
    let u = new URL(url)
    return "http://127.0.0.1:8080/proxy/" + u.host + u.pathname + u.search + u.hash
}

function thumbnailOverlay(v) {
    if (v.type == "upcomingPremiere" || v.type == "livePremiere") {
        return "Premiere";
    } else if (v.type == "upcomingStream") {
        return "Stream";
    } else if (v.type == "short") {
        return "Short";
    } else if (v.type == "liveStream") {
        return "Live"
    }
    return lengthBuilder(v.length)
}

function releaseBuilder(v) {
    if (v.publishedTime < 0) {
        return "Unknown";
    }
    const currentUnixTime = Math.floor(Date.now() / 1000);
    let timeDiff = currentUnixTime - v.publishedTime;
    if (v.type == "liveStream") {
        return "Live";
    }
    if (v.type == "upcomingPremiere" || v.type == "upcomingStream") {
        if (timeDiff < 0) {
            let date = new Date(v.publishedTime * 1000);
            return date.toLocaleString();
        }
    }
    return `${timeBuilder(timeDiff)} ago`;
}

function lengthBuilder(length) {
    let seconds = length % 60
    let minutes = Math.floor(length / 60) % 60
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    if (length / 3600 > 1) {
        let hours = Math.floor(length / 3600)
        if (minutes < 10) {
            minutes = `0${minutes}`
        }
        return `${hours}:${minutes}:${seconds}`
    } else {
        return `${minutes}:${seconds}`
    }
}

function timeBuilder(diff) {
    if (diff < 60) {
        return `${diff} seconds`
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)} minutes`
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)} hours`
    } else if (diff < 604800) {
        return `${Math.floor(diff / 86400)} days`
    } else if (diff < 2592000) {
        return `${Math.floor(diff / 604800)} weeks`
    } else if (diff < 31536000) {
        return `${Math.floor(diff / 2592000)} months`
    } else {
        return `${Math.floor(diff / 31536000)} years`
    }
}