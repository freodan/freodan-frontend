import { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import HostIcon from '../host-icon';

import LbryIcon from '../icons/lbry';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import YouTubeIcon from '@mui/icons-material/YouTube';

import { addSubscriptions, getSubscriptions, removeSubscription } from '../../lib/subscriptions';
import { channelUrlBuilder } from '../../lib/url';

import { useSub } from '../../lib/subscriptions';

export default function ChannelInfo(props) {
  const channelInfo = props.channelInfo;

  const [sub, add, remove] = useSub();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (sub && sub.find((c) => c.host == channelInfo.host && c.channelId == channelInfo.channelId) !== undefined) {
      setSubscribed(true);
    }
  }, [sub]);

  return (
    <>
      <Card elevation={0} square>
        <CardContent>
          <Stack direction="row" spacing={0} sx={{ marginBottom: "0.3rem" }}>
            <Avatar
              component="a"
              href={channelUrlBuilder(channelInfo.host, channelInfo.channelId)}
              target="_blank"
              src={urlRewrite(channelInfo.channelAvatar)}
              sx={{ width: "6rem", height: "6rem", marginTop: "0.5rem", marginRight: "1rem" }}
            />
            <Stack direction="column" spacing={0} sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={0} color="text.primary" sx={{ alignItems: "center" }}>
                <Typography
                  variant="body1"
                  color="inherit"
                  component="a"
                  href={channelUrlBuilder(channelInfo.host, channelInfo.channelId)}
                  target="_blank"
                  sx={{
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    margin: "0.5rem 0.25rem 0.25rem 0",
                  }}
                >
                  {channelInfo.channelTitle}
                </Typography>
                <HostIcon host={channelInfo.host} />
              </Stack>
              {channelInfo.channelSubscriberCount > 0 && <>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    marginBottom: "0.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {channelInfo.channelSubscriberCount} subscribers
                </Typography>
              </>}
              <Stack direction="row" spacing={0} color="text.secondary" >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.9rem",
                    lineHeight: "1rem",
                    marginBottom: "1rem",
                    display: "-webkit-box",
                    overflow: "hidden",
                    lineClamp: "4",
                    WebkitLineClamp: "4",
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {channelInfo.channelDescription || "No description"}
                </Typography>
              </Stack>
              <SubscribeButton channelInfo={channelInfo} />
              {props.showAlternatives &&
                channelInfo.alternatives &&
                channelInfo.alternatives.map &&
                channelInfo.alternatives.map((c) => <SubscribeButton key={`${c.host}_${c.channelId}`} channelInfo={c} />)}
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ padding: 0 }}></CardActions>
      </Card>
    </>
  );
}

function urlRewrite(url) {
  if (url.startsWith("//")) {
    url = "https:" + url;
  }
  try {
    let u = new URL(url);
    return "http://127.0.0.1:8080/proxy/" + u.host + u.pathname + u.search + u.hash;
  } catch {
    return "";
  }
}

function SubscribeButton(props) {
  const channelInfo = props.channelInfo;

  const [sub, add, remove] = useSub();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (sub && sub.find((c) => c.host == channelInfo.host && c.channelId == channelInfo.channelId) !== undefined) {
      setSubscribed(true);
    } else {
      setSubscribed(false);
    }
  }, [sub]);

  const text = {
    youtube: " to YouTube channel",
    lbry: " to LBRY channel",
  }

  return (
    <Button
      // fullWidth
      variant={subscribed ? "outlined" : "contained"}
      size="small"
      startIcon={<LibraryAddIcon />}
      sx={{ mb: 1 }}
      // sx={{ width: "fit-content" }}
      onClick={() => {
        subscribed ? remove(channelInfo) : add([channelInfo]);
        // setSubscribed(!subscribed);
      }}
    >
      {subscribed ? "Unsubscribe" : "Subscribe"}{text[channelInfo.host]}
    </Button>
  );
}