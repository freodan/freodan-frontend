import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

export default function EmptyNotice(props) {
  return (
    <Paper
      variant="outlined"
      square
      component="a"
      href="./manage"
      sx={(theme) => ({
        maxWidth: theme.breakpoints.values.md,
        margin: "0 auto",
        p: 4,
        borderRadius: 2,
        mt: 2,
        mb: 2,
        display: "block",
        textDecoration: "none",
      })}
    >
      <Stack direction="column" sx={{ alignItems: "center" }}>
        <SubscriptionsIcon sx={(theme) => ({ color: theme.palette.info.main, fontSize: "5rem", mb: "1rem" })} />
        <Typography
          variant="body1"
          color="text.primary"
        >
          Nothing here.
        </Typography>
        <Typography
          variant="body1"
          color="text.primary"
        >
          You might want to add some channels to your subscription list.
        </Typography>
      </Stack>
    </Paper>
  );
}