import { useEffect, useMemo, useState } from "react"
import { useConfig } from "./config";

export function useFeed(channels, options) {
  const currentUnixTime = Math.floor(Date.now() / 1000);
  const resultTemplate = {
    upcoming: {},
    now: {},
    today: {},
    week: {},
    month: {},
    older: {},
  };

  const config = useConfig();
  const [data, setData] = useState({ ...resultTemplate });
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [video, setVideo] = useState(0);

  useEffect(() => {
    if (!config.apiBaseUrl) {
      return;
    }
    const result = { ...resultTemplate };
    const urls = [];
    setLoaded(0);
    setVideo(0);
    if (channels && channels.length) {
      for (const c of channels) {
        if (c.host == "youtube") {
          urls.push(`${config.apiBaseUrl}/api/list/video?host=${c.host}&channel_id=${c.channelId}&params=videos`);
          urls.push(`${config.apiBaseUrl}/api/list/video?host=${c.host}&channel_id=${c.channelId}&params=shorts`);
          urls.push(`${config.apiBaseUrl}/api/list/video?host=${c.host}&channel_id=${c.channelId}&params=streams`);
        } else {
          urls.push(`${config.apiBaseUrl}/api/list/video?host=${c.host}&channel_id=${c.channelId}`);
        }
      }
      setTotal(urls.length);
      for (const u of urls) {
        fetch(u).then((resp) => {
          const p = resp.json();
          p.then((r) => {
            if (r.error !== null || !r.data || !r.data.length) {
              return state;
            }

            for (const v of r.data) {
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

              if (!result[time][type]) {
                result[time][type] = [];
              }
              result[time][type].push(v);

              if (!result[time]["all"]) {
                result[time]["all"] = [];
              }
              result[time]["all"].push(v);

              setVideo(state => state + 1);
            }

            setLoaded(state => state + 1);
            setData(result);
          });
          return p;
        });
      }
    }
  }, [channels, config]);

  return [data, loaded, total, video];
}