import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Import the ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import styles for Toastify

import OrderCreate from "./pages/OrderCreate/OrderCreate";
import OrderUpdate from "./pages/OrderUpdate/OrderUpdate";
import OrderList from "./pages/OrderList/OrderList";
import OrderDetails from "./pages/OrderDetails/OrderDetails";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path="/orderCreate" element={<OrderCreate />} />
        <Route path="/orderUpdate/:id" element={<OrderUpdate />} />
        <Route path="/orderDetails/:id" element={<OrderDetails />} />
      </Routes>

      {/* Add ToastContainer to handle the toasts */}
      <ToastContainer
        position="top-right"  // Position of the toast
        autoClose={5000}      // Auto close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
