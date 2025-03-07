import { useTheme } from '@mui/material/styles';
import nameLogo from 'assets/images/users/namelogo.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <img 
      src={nameLogo} 
      alt="Logo" 
      width="100" 
      style={{ filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}
    />
  );
}