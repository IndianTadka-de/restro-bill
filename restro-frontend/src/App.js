import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderCreate from "./pages/OrderCreate/OrderCreate";
import OrderUpdate from "./pages/OrderUpdate/OrderUpdate";
import OrderList from "./pages/OrderList/OrderList";
import OrderDetails from "./pages/OrderDetails/OrderDetails";
import Sidebar from "./components/Sidebar";
import "./App.css";
import Bookings from "./pages/Bookings/Bookings";
import Menu from "./pages/Menu/Menu";
import OrderReport from "./pages/Report/OrderReport";

function App() {
  return (
    <div className="main-content">
      <Sidebar className="sidebar" />
      <div className="heading">The Indian Tadka</div>
      
      <div className="content">
        <Routes>
          <Route path="/" element={<OrderList />} />
          <Route path="/orderCreate" element={<OrderCreate />} />
          <Route path="/orderUpdate/:id" element={<OrderUpdate />} />
          <Route path="/orderDetails/:id" element={<OrderDetails />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/report" element={<OrderReport />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
