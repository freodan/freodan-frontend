import { useState } from 'react';

import useSWR from 'swr/immutable';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import CssBaseline from '@mui/material/CssBaseline';

import ChannelInfo from '../../components/manage/channel-info';
import Header from '../../components/header';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

import { addSubscriptions, getSubscriptions } from '../../lib/subscriptions';

async function fetcher(query) {
  const promises = [];
  const results = [];
  promises.push(fetch(
    `http://127.0.0.1:8080/api/search/channel?host=youtube&query=${encodeURIComponent(query)}`
  ).then(resp => resp.json()));
  promises.push(fetch(
    `http://127.0.0.1:8080/api/search/channel?host=lbry&query=${encodeURIComponent(query)}`
  ).then(resp => resp.json()));

  const tmpResults = await Promise.all(promises);
  for (let i = 0; i < Math.max(...tmpResults.map((e) => e.data.length)); i++) {
    for (let j = 0; j < tmpResults.length; j++) {
      if (i < tmpResults[j].data.length) {
        results.push(tmpResults[j].data[i]);
      }
    }
  }

  return results;

  // YouTube Lbry de-dupe (ignore lbry entries)
  const alternativeIds = [];
  if (results && results.length) {
    for (const c of results) {
      if (c.host == "youtube" && c.alternatives.length > 0) {
        for (const a of c.alternatives) {
          alternativeIds.push(a.channelId);
        }
      }
    }
  }

  // return results;
  return results.filter((c) => !alternativeIds.includes(c.channelId));
};

async function resolveFetcher(query) {
  const promises = [];
  const results = {};
  promises.push(fetch(
    `http://127.0.0.1:8080/api/ytResolve/channel?host=lbry&channelIds=${encodeURIComponent(query)}`
  ).then(resp => resp.json()));

  const tmpResults = await Promise.all(promises);

  for (let i = 0; i < tmpResults.length; i++) {
    for (const k in tmpResults[i].data) {
      if (!results[k]) {
        results[k] = [];
      }
      results[k].push(tmpResults[i].data[k])
    }
  }

  return results;
};

export default function Add() {
  const [query, setQuery] = useState("");
  const [queryTextField, setQueryTextField] = useState("");


  let { data: results, error, isValidating } = useSWR(query.length ? query : null, fetcher);
  const { data: resolveResults } = useSWR(results && results.length ? results.filter(e => e.host == "youtube").map(e => e.channelId).join(",") : null, resolveFetcher);

  const alternativeIds = [];
  if (results && resolveResults) {
    for (const c of results) {
      if (resolveResults[c.channelId]) {
        for (const a of resolveResults[c.channelId]) {
          c.alternatives.push(a);
          alternativeIds.push(`${a.host}_${a.channelId}`)
        }
      }
    }
    // YouTube Lbry de-dupe (ignore lbry entries)
    results = results.filter((c) => !alternativeIds.includes(`${c.host}_${c.channelId}`));
  }

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
        position="sticky"
        buttons={
          <>
            <Stack direction="row" spacing={1}>
              <Button color="inherit" href="../../feed" startIcon={<DynamicFeedIcon />}>Feed</Button>
              <Button color="inherit" href="../../settings" startIcon={<SettingsIcon />}>Settings</Button>
            </Stack>
          </>
        }
      />
      <Container maxWidth="md">
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
            Search
          </Typography>
        </Stack>
        <Paper
          variant="outlined"
          sx={{ padding: "1rem", marginBottom: "1rem" }}
        >
          <Stack direction="row" spacing={1}>
            <TextField
              label="Channel name or URL"
              variant="outlined"
              fullWidth
              value={queryTextField}
              onChange={(e) => setQueryTextField(e.target.value)}
              onKeyDown={(e) => e.key == "Enter" && setQuery(queryTextField)}
            />
            <Button
              variant="contained"
              onClick={() => setQuery(queryTextField)}
            >
              Search
            </Button>
          </Stack>
          {
            results &&
            results.length > 0 &&
            results
              .map((c) => <ChannelInfo key={`${c.host}_${c.channelId}`} channelInfo={c} showAlternatives={1} />)
          }
          {
            results && results.length == 0 && <EmptyNotice />
          }
        </Paper>
      </Container>
    </>
  );
}

function EmptyNotice(props) {
  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      {/* <SubscriptionsIcon sx={{ fontSize: "5rem", mb: "1rem" }} /> */}
      <Typography
        variant="body1"
        color="text.primary"
        sx={{ mt: 2 }}
      >
        No results found.
      </Typography>
    </Stack>
  );
}