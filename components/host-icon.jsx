import LbryIcon from './icons/lbry';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function HostIcon(props) {
  const iconMap = {
    lbry: <LbryIcon {...props} />,
    youtube: <YouTubeIcon {...props} />,
  };

  return (
    <>
      {iconMap[props.host]}
    </>
  );
}