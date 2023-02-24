import { useEffect, useMemo, useState } from "react"

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

    const [data, setData] = useState({ ...resultTemplate });
    const [loaded, setLoaded] = useState(0);
    const total = useMemo(() => channels ? channels.length : 0, [channels]);

    useEffect(() => {
        if (channels && channels.length) {
            const result = { ...resultTemplate };
            setLoaded(0);
            for (const c of channels) {
                fetch(
                    `http://127.0.0.1:8080/api/list/video?host=${c.host}&channel_id=${c.channelId}&params=videos`
                ).then((resp) => {
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
                        }

                        setLoaded(state => state + 1);
                        setData(result);
                    });
                    return p;
                });
            }
        }
    }, [channels]);

    return [data, loaded, total];
}