import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Hotels from "./pages/Hotels";
import HotelRooms from "./pages/HotelRooms";
import RoomDetails from "./pages/RoomDetails";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserRoutes from "./pages/user/UserRoutes";
import AdminRoutes from "./pages/admin/AdminRoutes";
import ManagerRoutes from "./pages/manager/ManagerRoutes";
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

export default function App() {
  const location = useLocation();

  const hideLayoutRoutes = [
    "/user/profile",
    "/user/my-bookings",
    "/user/dashboard",
    "/user/wish-list",
    "/user/payments",
    "/admin/profile",
    "/admin/dashboard",
    "/admin/hotels",
    "/admin/bookings",
    "/admin/users",
    "/admin/feedback",
    "/admin/messages",
    "/admin/reports",
    "/manager/hotel-profile",
    "/manager/dashboard",
    "/manager/manager-info",
    "/manager/rooms-management",
    "/manager/bookings",
    "/manager/guests",
    "/manager/feedback-ratings",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  const hideLayout = hideLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel-rooms/:hotelId" element={<HotelRooms />} />
        <Route path="/room-details/:id" element={<RoomDetails />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/manager/*" element={<ManagerRoutes />} />
      </Routes>

      {!hideLayout && <Footer />}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
