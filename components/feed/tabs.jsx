import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import TuneIcon from '@mui/icons-material/Tune';

export function FeedTabs(props) {
  return (
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      {...props}
      sx={{ ...props.sx, flexGrow: 1 }}
    >
      <FullWidthTab label="All" value="all" fullwidth={props.fullwidth} />
      <FullWidthTab label="Videos" value="video" fullwidth={props.fullwidth} />
      <FullWidthTab label="Streams" value="stream" fullwidth={props.fullwidth} />
      <FullWidthTab label="Shorts" value="short" fullwidth={props.fullwidth} />
    </Tabs>
  );
}

export function FeedTabsWithFilter(props) {
  return (
    <Stack direction="row" spacing={0}>
      <IconButton aria-label="filter">
        <TuneIcon />
      </IconButton>
      <FeedTabs value={props.value} onChange={props.onChange} fullwidth={props.fullWidth ? 1 : 0} />
    </Stack>
  );
}

function FullWidthTab(props) {
  return (
    <Tab {...props} sx={{ ...props.sx, flexGrow: props.fullwidth }} />
  );
}