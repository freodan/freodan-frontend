import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

import CssBaseline from '@mui/material/CssBaseline';

import ChannelInfo from './../components/manage/channel-info'
import Header from '../components/header';

import { addSubscriptions, getSubscriptions } from '../lib/subscriptions';

export default function Manage() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    setSubs(getSubscriptions());
  }, []);

  return (
    <>
      <CssBaseline />
      <Header
        position="sticky"
        buttons={
          <>
            <Stack direction="row" spacing={1}>
              <Button color="inherit" href="./feed" startIcon={<DynamicFeedIcon />}>Feed</Button>
              <Button color="inherit" href="./settings" startIcon={<SettingsIcon />}>Settings</Button>
            </Stack>
          </>
        }
      />
      <Container maxWidth="md" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={0} sx={{ padding: "0rem 1rem" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            href="javascript:history.back()"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, padding: "6px 0", lineHeight: "1.75" }}>
            Subscriptions
          </Typography>
        </Stack>
        <Paper
          variant="outlined"
          sx={{ padding: "1rem", marginBottom: "1rem" }}
        >
          {subs.map((item) => <ChannelInfo key={`${item.host}_${item.channelId}`} channelInfo={item} />)}
          {!subs.length && <EmptyNotice />}
        </Paper>
      </Container>
      <Fab
        variant="extended"
        color="primary"
        href="./manage/add"
        sx={(theme) => ({
          p: 2,
          position: "fixed",
          bottom: "2rem",
          [theme.breakpoints.down("md")]: {
            right: "2.5rem",
          },
          [theme.breakpoints.up("md")]: {
            right: "calc((100vw - 900px) / 2 + 24px + 1rem)",
          },
          right: 0,
        })}
      >
        <AddBoxIcon sx={{ mr: 1 }} />
        Add
      </Fab>
    </>
  );
}

function EmptyNotice(props) {
  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <SubscriptionsIcon sx={{ fontSize: "5rem", mb: "1rem" }} />
      <Typography
        variant="body1"
        color="text.primary"
      >
        You are not subscribed to any channel.
      </Typography>
    </Stack>
  );
}