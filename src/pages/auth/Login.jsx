import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// material-ui
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project imports
import AuthWrapper from "sections/auth/AuthWrapper";
import AuthLogin from "sections/auth/AuthLogin";

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/mainpage";
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in - only once on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      // User is already logged in, redirect to dashboard
      navigate(redirect, { replace: true });
    }
    setCheckingAuth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  const handleLoginSuccess = () => {
    // After successful login, redirect to dashboard
    navigate(redirect, { replace: true });
  };

  // Don't render the login form while checking auth status
  if (checkingAuth) {
    return null; // Or render a loading spinner here
  }

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack
            direction="row"
            sx={{
              alignItems: "baseline",
              justifyContent: "space-between",
              mb: { xs: -0.5, sm: 0.5 },
            }}
          >
            <Typography variant="h3">Login</Typography>
            <Typography
              component={Link}
              to={"/register"}
              variant="body1"
              sx={{ textDecoration: "none" }}
              color="primary"
            >
              Don&apos;t have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin onSuccess={handleLoginSuccess} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
