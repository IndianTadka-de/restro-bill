import React, { useEffect, useState } from "react";
import "./Bookings.css";
import { Button, Table } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import Modal from "../../components/Modal";
import BookingForm from "../../components/BookingForm";
import { toast } from "react-toastify";
import axios from "axios";
import { base_url } from "../../utils/apiList";

const Bookings = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [filteredOrders, setFilteredOrders] = useState(orders);
  const initialValues = {
    bookingDate: new Date().toISOString().split("T")[0], // Today's date in the format YYYY-MM-DD
    numberOfPeople: 0,
    bookingName: "",
    bookingTime: "",
    phoneNumber: "",
    hour: "",
    minute: "",
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${base_url}/reservations`);
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReservations();
  }, []);

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
      setModalOpen(false);
    }
  };

  const bookingColumns = [
    {
      title: "Booking Id",
      render: (_, record, index) => index + 1, // Display the serial number (starting from 1)
    },
    { title: "Booking Name", dataIndex: "bookingName" },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      render: (_, record) =>
        new Date(record.bookingDate).toISOString().split("T")[0],
    },
    { title: "Number Of People", dataIndex: "numberOfPeople" },
    { title: "Booking Time", dataIndex: "bookingTime" },
    { title: "Phone Number", dataIndex: "phoneNumber" },
  ];

  return (
    <div className="booking-container">
      <div className="create-booking-button">
        <Button
          icon={<FileAddOutlined />}
          onClick={() => setModalOpen(true)}
          block
        >
          Create Booking
        </Button>
      </div>
      <Table
        columns={bookingColumns}
        dataSource={reservations} // Provide your data source here
        loading={loading}
        rowKey="bookingId"
        scroll={{ x: "max-content" }}
        className="booking-table"
      />
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)} size="small">
          <BookingForm
            initialValues={initialValues}
            handleFormSubit={handleBookingSubmit}
          />
        </Modal>
      )}
    </div>
  );
};

export default Bookings;
