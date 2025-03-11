import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    // Redirect to login page if user is not logged in
    // Save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;
