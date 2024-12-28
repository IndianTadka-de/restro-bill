import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table } from "antd";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // React Router hook for navigation
  const [orderData, setOrderData] = useState(null);

  const fetchOrderData = async (orderId) => {
    try {
      console.log("Fetching data...");
      const response = await fetch(`https://restro-bill.onrender.com/api/orders/${orderId}`);
      const data = await response.json();
      console.log("Data fetched:", data);
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderData(id);
  }, [id]);

  if (!orderData) return <div>Loading...</div>;

  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    { title: "Quantity", dataIndex: "quantity" },
    {
      title: "Price (€)",
      dataIndex: "price",
      render: (price) => `€${price.toFixed(2)}`, // Format price in euros
    },
    {
      title: "Total (€)",
      render: (_, record) => `€${(record.quantity * record.price).toFixed(2)}`, // Calculate and format total price
    },
  ];

  // Calculate total price for the order
  const totalPrice = orderData.orderItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  return (
    <div>
      <h2>Order Details</h2>
      <p><b>Table Number:</b> {orderData.tableNumber}</p>
      <p><b>Order Date:</b> {new Date(orderData.createdAt).toLocaleDateString()}</p>
      <Table columns={columns} dataSource={orderData.orderItems} rowKey="itemId" pagination={false} />
      <div style={{ marginTop: "20px", fontSize: "16px", fontWeight: "bold" }}>
        <p><b>Total Price:</b> €{totalPrice.toFixed(2)}</p>
      </div>

      {/* Back to Home Button */}
      <div style={{ marginTop: "30px" }}>
        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}


