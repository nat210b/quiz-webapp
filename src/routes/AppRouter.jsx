import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import QuizPage from "../pages/QuizPage";
import Home1 from "../pages/Home1";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/quiz/:part",
    element: <QuizPage />,
  },
  {
    path: "home",
    element: <Home1/>
  }
// ส่วนของ path และ element เราสามารถเพิ่มมาอีกได้เรื่อย ๆ กรณีที่เรามีหลายเพจ
]);

export default router;
