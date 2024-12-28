import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderForm from "../OrderForm/OrderFormer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrderData = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}`);
      const data = await response.json();
      setInitialData({
        tableNumber: data.tableNumber,
        orderDate: new Date(data.createdAt).toISOString().slice(0, 10),
        orderItems: data.orderItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  useEffect(() => {
    fetchOrderData(id);
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:8080/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Order updated successfully!", {
          position: "top-right",
        });
        navigate("/");
      } else {
        toast.error(result.message || "Failed to update order.", {
          position: "top-right",
        });
        throw new Error(result.message || "Failed to update order.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Order status updated successfully!", {
          position: "top-right",
        });
        navigate("/");
      } else {
        toast.error(result.message || "Failed to update order status.", {
          position: "top-right",
        });
        throw new Error(result.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderForm
      title="Update Order"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      formType="update"
      onStatusChange={handleStatusChange}
    />
  );
}
