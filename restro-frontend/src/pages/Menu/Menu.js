import React, { useEffect, useState } from "react";
import "./Menu.css";
import { Button, Table } from "antd";
import Modal from "../../components/Modal";
// import { toast } from "react-toastify";
import axios from "axios";
import { base_url } from "../../utils/apiList";
import { MdAddChart } from "react-icons/md";
import MenuItemForm from "../../components/MenuItem";

const Menu = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialValues = {
    itemId: "",
    itemName: "",
    price: 0,
    category: "",
  };

  // Fetch reservations data
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/menu`);
      setMenu(response.data);
    } catch (error) {
      console.error("Error fetching menu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(); // Fetch data when the component mounts
  }, []); // Empty dependency array means this runs only on component mount

  // const handleBookingSubmit = async (payload) => {
  //   try {
  //     delete payload.hour;
  //     delete payload.minute;

  //     const response = await axios.post(`${base_url}/reservations`, {
  //       ...payload,
  //     });
  //     if (response?.status === 201) {
  //       toast.success("Order Booking created successfully!", {
  //         position: "top-right",
  //       });
  //       // Trigger re-fetch after successfully creating a booking
  //       fetchReservations();
  //     }
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message, {
  //       position: "top-right",
  //     });
  //   } finally {
  //     setModalOpen(false); // Close the modal after submission
  //   }
  // };

  const menuColumns = [
    {
      title: "Item Id",
      dataIndex: "itemId",
      render: (_, record) => record.itemId, // Display the serial number (starting from 1)
    },
    { title: "Item Name", dataIndex: "itemName" },
    {
      title: "Price",
      dataIndex: "price",
      render: (_, record) => record.price + " €",
    },
    { title: "Category", dataIndex: "category" },
  ];

  const handleMenuItemSubmit = (payload) => {
    console.log('payload....',payload)
    setModalOpen(false)
  };

  return (
    <div className="menu-container">
      <div className="create-menu-button">
        <Button icon={<MdAddChart />} onClick={() => setModalOpen(true)} block>
          Create Item
        </Button>
      </div>
      <Table
        columns={menuColumns}
        dataSource={menu} // Provide your data source here
        loading={loading}
        rowKey="itemId"
        scroll={{ x: "max-content" }}
        className="menu-table"
      />
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)} size="small">
          <MenuItemForm
            initialValues={initialValues}
            handleFormSubit={handleMenuItemSubmit}
          />
        </Modal>
      )}
    </div>
  );
};

export default Menu;
