import { Link, useNavigate } from "react-router-dom";

// material-ui
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project imports
import AuthWrapper from "sections/auth/AuthWrapper";
import AuthRegister from "sections/auth/AuthRegister";

// ================================|| JWT - REGISTER ||================================ //

export default function Register() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate("/login");
  };

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
            <Typography variant="h3">Sign up</Typography>
            <Typography
              component={Link}
              to="/login"
              variant="body1"
              sx={{ textDecoration: "none" }}
              color="primary"
            >
              Already have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthRegister onSuccess={handleRegisterSuccess} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
