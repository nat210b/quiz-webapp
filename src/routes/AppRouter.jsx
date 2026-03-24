import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import QuizPage from "../pages/QuizPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/quiz/:part",
    element: <QuizPage />,
  },
// ส่วนของ path และ element เราสามารถเพิ่มมาอีกได้เรื่อย ๆ กรณีที่เรามีหลายเพจ
]);

export default router;
