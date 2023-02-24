export function channelUrlBuilder(host, channelId) {
  let result = channelId;
  if (host == "lbry") {
    result = `https://odysee.com/${channelId.substring(7)}`;
  } else if (host == "youtube") {
    result = `https://www.youtube.com/channel/${channelId}`;
  }
  return result;
}

export function videoUrlBuilder(host, videoId) {
  let result = videoId;
  if (host == "lbry") {
    result = `https://odysee.com/${videoId.substring(7)}`;
  } else if (host == "youtube") {
    result = `https://www.youtube.com/watch?v=${videoId}`;
  }
  return result;
}