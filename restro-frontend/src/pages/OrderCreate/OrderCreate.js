import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderForm from "../OrderForm/OrderFormer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the styles

export default function OrderCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if the response is successful
      if (response.ok) {
        // Only trigger success toast on success
        toast.success("Order created successfully!", {
          position: "top-right",
        });
        navigate("/");  // Navigate to the main page or wherever you want
      } else {
        const result = await response.json();

        // If the server returns a 400 status, it's related to the duplicate order check
        if (response.status === 400) {
          toast.error(result.message || "An active order exists for this table. Please update the existing order!", {
            position: "top-right",  // Correct position value
          });
        } else {
          toast.error(result.message || "Failed to create order.", {
            position: "top-right",  // Correct position value
          });
        }
        throw new Error(result.message || "Failed to create order.");
      }
    } catch (error) {
      // Only trigger error toast if something goes wrong
      console.error(error.message);
      toast.error(error.message, {
        position: "top-right",  // Correct position value
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderForm title="Create Order" onSubmit={handleSubmit} isSubmitting={isSubmitting} formType="create" />
  );
}
