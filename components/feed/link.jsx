import Button from '@mui/material/Button';

import LbryIcon from '../icons/lbry';
import LinkIcon from '@mui/icons-material/Link';
import YouTubeIcon from '@mui/icons-material/YouTube';

import { videoUrlBuilder } from '../../lib/url';

export function Link(props) {
  const buttonMap = {
    youtube:
      <Button
        variant="text"
        size="small"
        startIcon={<LinkIcon />}
        href={videoUrlBuilder(props.host, props.videoId)}
      >
        YouTube
      </Button>,
    lbry:
      <Button
        variant="text"
        size="small"
        startIcon={<LinkIcon />}
        href={videoUrlBuilder(props.host, props.videoId)}
      >
        Lbry
      </Button>
  };

  return (
    <>
      {buttonMap[props.host]}
    </>
  );
}

export function linkResolver(host, videoId) {
  let result = videoId;
  if (host == "lbry") {
    result = `https://odysee.com/${videoId.substring(7)}`;
  } else if (host == "youtube") {
    result = `https://www.youtube.com/watch?v=${videoId}`;
  }
  return result;
}