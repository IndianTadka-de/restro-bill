import React, { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MdRestaurant } from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { ImFolderDownload } from "react-icons/im";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger menu
import "./Sidebar.css";
import BookingForm from "./BookingForm";
import Modal from "./Modal";
import { toast } from "react-toastify";
import axios from "axios";
import { base_url } from "../utils/apiList";
import { FaHome } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const initialValues = useState({
    bookingDate: new Date().toISOString().split("T")[0], // Today's date in the format YYYY-MM-DD
    numberOfPeople: 0,
    bookingName: "",
    bookingTime: "",
    phoneNumber: "",
    hour: "",
    minute: "",
  });

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleBookingSubmit = async (payload) => {
    try {
      delete payload.hour;
      delete payload.minute;
      const response = await axios.post(`${base_url}/booking`, {
        ...payload,
      });
      if (response?.status === 201) {
        toast.success("Order Booking created successfully!", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",
      });
    } finally {
      setReservation(false);
    }
  };

  const handleHomeButton = () => {
    // toggleSidebar();
    navigate("/");
  };

  const handleOrderButton = () => {
    // toggleSidebar();
    navigate("/orderCreate");
  };

  const handleReservation = () => {
    // toggleSidebar();
    setReservation(true);
  };

  return (
    <div>
      <div className="hamburger-icon" onClick={toggleSidebar}>
        {sidebarVisible ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
        <div className="logo-container">
          <img
            src={"/logo.png"}
            alt="Restaurant Logo"
            className="sidebar-logo"
            onClick={() => navigate("/")}
          />
        </div>

        <Button className="sidebar-btn" icon={<FaHome />} onClick={() => handleHomeButton()}>
          <span className="sidebar-text">Home</span>
        </Button>
        <Button className="sidebar-btn" icon={<MdRestaurant />} onClick={() => handleOrderButton()}>
          <span className="sidebar-text">Order</span>
        </Button>
        <Button className="sidebar-btn" icon={<FiCalendar />} onClick={() => handleReservation()}>
          <span className="sidebar-text">Reservation</span>
        </Button>
        <Button
          className="sidebar-btn"
          icon={<ImFolderDownload />}
          onClick={() => {
            console.log("Download Excel Button Clicked");
          }}
        >
          <span className="sidebar-text">Download</span>
        </Button>

        {reservation && (
          <Modal onClose={() => setReservation(false)}>
            <BookingForm initialValues={initialValues} handleFormSubit={handleBookingSubmit} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
