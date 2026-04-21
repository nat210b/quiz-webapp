import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "../components/navBar/Navbar";
import { supabase } from "../utils/supabaseClient";

import Home from "../pages/Home";
import QuizPage from "../pages/QuizPage";
import Home1 from "../pages/Home1";
import VocabLists from "../pages/wordManagement/VocabLists";
import Register from "../pages/register/Register";
import Selection from "../pages/selection/Selection";
import Quiz from "../pages/quiz/Quiz";
import FeedbackForm from "../pages/feedback/FeedbackForm";

// ── Routes ที่ไม่แสดง Navbar ───────────────────────────────────
const HIDDEN_NAVBAR_ROUTES = ["/register"];

// ── Layout หลัก ─────────────────────────────────────────────────
function AppLayout() {
  const { pathname } = useLocation();
  const showNavbar = !HIDDEN_NAVBAR_ROUTES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Outlet />
    </>
  );
}

// ── Guard: เข้าได้เฉพาะตอนที่ยัง logout อยู่ ───────────────────
function GuestOnlyRoute({ redirectTo = "/" }) {
  const [authState, setAuthState] = useState("loading"); // "loading" | "authed" | "guest"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? "authed" : "guest");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? "authed" : "guest");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState === "loading") return null;
  if (authState === "authed") return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}

// ── Router ───────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/quiz/:part", element: <QuizPage /> },
      { path: "/home", element: <Home1 /> },
      { path: "/vocab", element: <VocabLists /> },
      { path: "/home_V2", element: <Selection /> },
      { path: "/quiz", element: <Quiz /> },
      { path: "/feedback", element: <FeedbackForm /> },

      // Guest-only: login แล้ว → redirect กลับ "/"
      {
        element: <GuestOnlyRoute redirectTo="/" />,
        children: [{ path: "/register", element: <Register /> }],
      },
    ],
  },
]);

export default router;
