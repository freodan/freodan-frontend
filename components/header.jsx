import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

export default function Header(props) {
  const [showShadow, setShowShadow] = useState(false);

  useEffect(() => {
    document.addEventListener("scroll", (e) => {
      setShowShadow(window.scrollY > 0 ? true : false);
    });
  }, []);

  return (
    <AppBar
      color="transparent"
      onScroll={(e) => console.log(e)}
      sx={(theme) => ({
        boxShadow: showShadow && props.position == "sticky" ? "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 10%), 0px 1px 10px 0px rgb(0 0 0 / 8%)" : "unset",
        backgroundColor: "#fff",
        position: props.position,
        top: 0,
        zIndex: 9999
      })}
    >
      <Toolbar sx={(theme) => ({
        width: "inherit",
        maxWidth: props.maxWidth,
        margin: "0rem auto",
      })}>
        <Typography variant="h6" component="div">
          Freodan
        </Typography>
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            [theme.breakpoints.up("md")]: {
              display: "none"
            }
          })}
        >
          {/* Space filler */}
        </Box>
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            [theme.breakpoints.down("md")]: {
              display: "none"
            }
          })}
        >
          {props.tabs}
        </Box>
        {props.buttons}
      </Toolbar>
    </AppBar >
  );
}