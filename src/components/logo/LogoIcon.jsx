// material-ui
import { useTheme } from '@mui/material/styles';
import logo from 'assets/images/users/logo.png';

// ==============================|| LOGO ICON IMAGE ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <img 
      src={logo} 
      alt="Logo" 
      width="30" 
    />
  );
}
