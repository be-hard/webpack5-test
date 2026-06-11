import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Home = lazy(() => import("@pages/Home/index"));
const Login = lazy(() => import("@pages/Login/index"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <div>Page not found</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);
