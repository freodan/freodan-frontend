import { useEffect, useState } from "react";

export function addSubscriptions(newSubs) {
  const subs = getSubscriptions();
  subs.push(...newSubs);
  window.localStorage.setItem("subscriptions", JSON.stringify(subs));
}

export function getSubscriptions() {
  const subsJSON = window.localStorage.getItem("subscriptions");
  try {
    const subs = JSON.parse(subsJSON);
    if (subs.length) {
      return subs;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function removeSubscription(channel) {
  let subs = getSubscriptions();
  subs = subs.filter((e) => !(e.host == channel.host && e.channelId == channel.channelId));
  window.localStorage.setItem("subscriptions", JSON.stringify(subs));
}

export function useSub() {
  if (typeof window === "undefined") {
    return [null, null, null];
  }

  const [data, setData] = useState(getSub());

  const add = (newSubs) => {
    const subs = [...getSub(), ...newSubs]
    window.localStorage.setItem("subscriptions", JSON.stringify(subs));
    setData(subs);
  };

  const remove = (channel) => {
    const subs = getSub().filter((c) => !(c.host == channel.host && c.channelId == channel.channelId));
    window.localStorage.setItem("subscriptions", JSON.stringify(subs));
    setData(subs);
  };

  return [data, add, remove];
}

function getSub() {
  const subsJSON = window.localStorage.getItem("subscriptions");
  let subs = [];
  try {
    subs = JSON.parse(subsJSON);
    if (!subs || !subs.length) {
      throw Error();
    }
  } catch {
    subs = [];
  }
  return subs;
}