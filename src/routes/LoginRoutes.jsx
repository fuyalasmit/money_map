import { lazy } from "react";

// project imports
import AuthLayout from "layout/Auth";
import Loadable from "components/Loadable";
import { Navigate } from "react-router-dom";

// jwt auth
const LoginPage = Loadable(lazy(() => import("pages/auth/Login")));
const RegisterPage = Loadable(lazy(() => import("pages/auth/Register")));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: "/",
  children: [
    {
      path: "/",
      element: <AuthLayout />,
      children: [
        {
          path: "/",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          path: "/register",
          element: <RegisterPage />,
        },
      ],
    },
  ],
};

export default LoginRoutes;
