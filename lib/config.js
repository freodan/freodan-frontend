import { useState, useEffect } from "react";

export async function loadServerConfig() {
  return await (await fetch("config.json")).json();
}

export function useConfig() {
  const [config, setConfig] = useState({});

  useEffect(() => {
    fetch(
      `/config.json`
    ).then((resp) => {
      resp.json().then((r) => {
        setConfig(r);
      });
    });
  }, []);

  return config;
}