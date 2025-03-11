import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Check if the user is logged in by looking for currentUser in localStorage
const isLoggedIn = () => {
  return localStorage.getItem("currentUser") !== null;
};

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!isLoggedIn()) {
      // User is not logged in, redirect to login with the return URL
      const returnUrl =
        location.pathname && location.pathname !== "/"
          ? `?redirect=${encodeURIComponent(location.pathname)}`
          : "";

      // Using replace: true to avoid browser history building up
      navigate(`/login${returnUrl}`, { replace: true });
    } else {
      setAuthorized(true);
    }
  }, [navigate, location.pathname]);

  // Only render children when user is authorized to avoid flickering
  return authorized ? children : null;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default AuthGuard;
