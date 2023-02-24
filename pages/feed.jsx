import { useEffect, useReducer, useState } from 'react';
import { Fragment } from 'react';

import { getSubscriptions } from '../lib/subscriptions';
import { loadServerConfig } from '../lib/config';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { useTheme } from '@mui/material/styles';
import useSWR from 'swr/immutable';

import { FeedTabs, FeedTabsWithFilter } from '../components/feed/tabs';
import Header from '../components/header';
import HostIcon from '../components/host-icon';
import { Link, linkResolver } from '../components/feed/link';
import VideoFeed2 from '../components/feed/video-feed';

import CssBaseline from '@mui/material/CssBaseline';
import globalStyles from '../styles/global';

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

import LbryIcon from '../components/icons/lbry';
import LinkIcon from '@mui/icons-material/Link';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import YouTubeIcon from '@mui/icons-material/YouTube';

async function fetcher(req) {
  const promises = [];
  const tmpResults = [];
  const ytLbryList = [];
  const ytLbryMap = {};
  const results = {
    upcoming: {},
    now: {},
    today: {},
    week: {},
    month: {},
    older: {},
  };

  for (const s of req.subs) {
    if (s.host == "youtube") {
      promises.push(fetch(
        `http://127.0.0.1:8080/api/list/video?host=${s.host}&channel_id=${s.channelId}&params=videos`
      ).then(resp => resp.json()));
      promises.push(fetch(
        `http://127.0.0.1:8080/api/list/video?host=${s.host}&channel_id=${s.channelId}&params=shorts`
      ).then(resp => resp.json()));
      promises.push(fetch(
        `http://127.0.0.1:8080/api/list/video?host=${s.host}&channel_id=${s.channelId}&params=streams`
      ).then(resp => resp.json()));
    } else if (s.host == "lbry") {
      promises.push(fetch(
        `http://127.0.0.1:8080/api/list/video?host=${s.host}&channel_id=${s.channelId}`
      ).then(resp => resp.json()));
    }
  }

  const resps = await Promise.all(promises);

  if (req.options.lbryDedupe) {
    const resolvePromises = [];
    for (const r of resps) {
      if (r.length > 0) {
        if (r[0].host == "youtube") {
          resolvePromises.push(fetch(
            `http://127.0.0.1:8080/api/ytResolve/video?host=lbry&videoIds=` + encodeURIComponent(r.map(e => e.videoId).join(","))
          ).then(r => r.json()));
        }
      }
    }
    const resolveResponses = await Promise.all(resolvePromises);

    for (const r of resolveResponses) {
      for (const ytId in r) {
        if (!ytLbryMap[ytId]) {
          ytLbryMap[ytId] = [];
        }
        ytLbryMap[ytId].push(r[ytId]);
        ytLbryList.push(r[ytId].videoId);
      }
    }
  }


  console.time("feed fetecher sort");
  if (req.options.lbryDedupe) {
    for (const resp of resps) {
      for (const v of resp) {
        if (v.host == "youtube" && ytLbryMap[v.videoId]) {
          for (const a of ytLbryMap[v.videoId]) {
            v.sources[a.host] = a.videoId
          }
        }
      }
    }
  }

  for (const resp of resps) {
    tmpResults.push(...resp);
  }
  tmpResults.sort((a, b) => b.publishedTime - a.publishedTime);

  // YouTube Lbry de-dupe (ignore lbry entries)
  for (const v of tmpResults) {
    if (v.host == "lbry" && ytLbryList.includes(v.videoId)) {
      continue;
    }

    let time = "older";
    let type = v.type;

    if (type == "liveStream") {
      time = "now";
      type = "stream"
    } else if (type == "livePremiere") {
      time = "now";
      type = "video"
    } else if (currentUnixTime < v.publishedTime) {
      time = "upcoming";
    } else if (currentUnixTime - v.publishedTime < 86400) {
      time = "today";
    } else if (currentUnixTime - v.publishedTime < 604800) {
      time = "week";
    } else if (currentUnixTime - v.publishedTime < 2592000) {
      time = "month";
    }

    if (type == "upcomingPremiere" || type == "livePremiere") {
      type = "video";
    } else if (type == "upcomingStream") {
      type = "stream";
    }

    if (!results[time][type]) {
      results[time][type] = [];
    }
    results[time][type].push(v);

    if (!results[time]["all"]) {
      results[time]["all"] = [];
    }
    results[time]["all"].push(v);
  }
  console.timeEnd("feed fetecher sort");
  return results;
}

const currentUnixTime = Math.floor(Date.now() / 1000);

const timePeriods = [
  { key: "now", title: "Happening now" },
  { key: "upcoming", title: "Upcoming" },
  { key: "today", title: "Today" },
  { key: "week", title: "Last week" },
  { key: "month", title: "Last month" },
  { key: "older", title: "Older" },
];

const hideViewHosts = [
  "lbry",
];

export default function Feed() {
  const { data: config, error: configError } = useSWR(true, loadServerConfig);
  console.log("config", config, configError);

  const theme = useTheme();

  const [typeFilter, setTypeFilter] = useState("all")
  const [showdesc, setShowdesc] = useState(0)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [req, setReq] = useState({
    serverConfig: config,
    subs: [],
    options: {
      lbryDedupe: false,
    },
  });

  useEffect(() => {
    setReq((state) => {
      return {
        ...state,
        subs: getSubscriptions(),
        options: {
          lbryDedupe: true,
        },
      };
    });
    setStickyHeader(window.innerWidth >= theme.breakpoints.values.md);

    window.addEventListener("resize", (e) => {
      setStickyHeader(window.innerWidth >= theme.breakpoints.values.md);
    });
  }, []);


  const { data: feed, error, isValidating } = useSWR(req.subs.length && req.serverConfig ? req : null, fetcher);

  console.log("req", req, "feed", feed);

  return (
    <>
      <CssBaseline />
      <LinearProgress
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10000,
          display: isValidating ? "block" : "none"
        }}
      />
      <Header
        position={stickyHeader ? "sticky" : "static"}
        // maxWidth="lg"
        tabs={
          <FeedTabs
            centered
            variant="standard"
            value={typeFilter}
            onChange={(e, value) => setTypeFilter(value)}
          />
        }
        buttons={
          <>
            <Stack direction="row" spacing={1}>
              <Button color="inherit" href="./manage" startIcon={<SubscriptionsIcon />}>Manage</Button>
              <Button color="inherit" href="./settings" startIcon={<SettingsIcon />}>Settings</Button>
            </Stack>
          </>
        }
      />
      <Container maxWidth="lg">
        <Grid
          container
          spacing={0}
          sx={(theme) => ({
            backgroundColor: "#fff",
            paddingTop: "4px",
            marginBottom: "1rem",
            borderBottom: "0px solid #bbb",
            position: "sticky",
            top: 0,
            zIndex: 9999,
            [theme.breakpoints.up("md")]: {
              display: "none"
            }
          })}
        >
          <Grid xs={12} sm>
            <FeedTabsWithFilter
              fullWidth
              value={typeFilter}
              onChange={(e, value) => setTypeFilter(value)}
            />
          </Grid>
          {/* <Grid xs={12} sm={3}>
            <FormGroup
              sx={(theme) => ({
                [theme.breakpoints.down("sm")]: {
                  marginTop: "1rem"
                }
              })}
            >
              <FormControlLabel
                control={<Switch
                  checked={showdesc ? true : false}
                  onChange={(e) => setShowdesc(e.target.checked ? 1 : 0)}
                />}
                label="Show Desciptions" />
            </FormGroup>
          </Grid> */}
        </Grid>
        <VideoFeed2 type={typeFilter} />
        {
          timePeriods.map((t) => feed && feed[t.key] && feed[t.key][typeFilter] &&
            <Fragment key={t.key}>
              <Stack direction="row" spacing={0} sx={{ padding: "0" }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, paddingBottom: "1rem", lineHeight: "1.75" }}>
                  {t.title}
                </Typography>
              </Stack>
              <VideoFeed feed={feed[t.key][typeFilter]} showdesc={showdesc} />
              <Divider sx={{ margin: "1.5rem 0" }} />
            </Fragment>
          )
        }
        {
          !isValidating && timePeriods.reduce((total, t) => {
            if (feed && feed[t.key] && feed[t.key][typeFilter]) {
              return total + feed[t.key][typeFilter].length;
            }
            return total;
          }, 0) == 0 && <EmptyNotice />
        }
      </Container>
      {/* <style jsx global>{globalStyles}</style> */}
    </>
  )
}

function EmptyNotice(props) {
  return (
    <Paper
      variant="outlined"
      square
      component="a"
      href="./manage"
      sx={(theme) => ({
        maxWidth: theme.breakpoints.values.md,
        margin: "0 auto",
        p: 4,
        borderRadius: 2,
        mt: 2,
        mb: 2,
        display: "block",
        textDecoration: "none",
      })}
    >
      <Stack direction="column" sx={{ alignItems: "center" }}>
        <SubscriptionsIcon sx={(theme) => ({ color: theme.palette.info.main, fontSize: "5rem", mb: "1rem" })} />
        <Typography
          variant="body1"
          color="text.primary"
        >
          Nothing here.
        </Typography>
        <Typography
          variant="body1"
          color="text.primary"
        >
          You might want to add some channels to your subscription list.
        </Typography>
      </Stack>
    </Paper>
  );
}

function VideoCard(props) {
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

function urlRewrite(url) {
  let u = new URL(url)
  return "http://127.0.0.1:8080/proxy/" + u.host + u.pathname + u.search + u.hash
}

function VideoFeed(props) {
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