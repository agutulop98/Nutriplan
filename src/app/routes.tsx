import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Search } from "./pages/Search";
import { RecipeDetail } from "./pages/RecipeDetail";
import { WeeklyPlanner } from "./pages/WeeklyPlanner";
import { ShoppingList } from "./pages/ShoppingList";
import { Favorites } from "./pages/Favorites";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/forgot-password", Component: ForgotPassword },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "search", Component: Search },
          { path: "recipe/:id", Component: RecipeDetail },
          { path: "planner", Component: WeeklyPlanner },
          { path: "shopping", Component: ShoppingList },
          { path: "favorites", Component: Favorites },
          { path: "profile", Component: Profile },
          { path: "admin", Component: Admin },
        ],
      },
    ],
  },
]);
