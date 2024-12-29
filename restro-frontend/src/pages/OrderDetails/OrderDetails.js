import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, InputNumber, Button, message } from "antd";
import Modal from "../../components/Modal"; // Import the Modal component
import "./OrderDetails.css"; // Import the CSS file for styling
import { base_url } from "../../utils/apiList";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [splitItems, setSplitItems] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState(3); // Default to 3 people
  const [personTotals, setPersonTotals] = useState([]);

  const fetchOrderData = async (orderId) => {
    try {
      const response = await fetch(`${base_url}/orders/${orderId}`);
      const data = await response.json();
      setOrderData(data);
      setSplitItems(data.orderItems); // Initialize split items with the order data
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderData(id);
  }, [id]);

  if (!orderData) return <div>Loading...</div>;

  // Modal Content: Assigning items to people
  const handleSplitItem = (itemIndex, personIndex, value) => {
    const updatedSplitItems = [...splitItems];
    if (!updatedSplitItems[itemIndex].assigned) {
      updatedSplitItems[itemIndex].assigned = [];
    }

    // Assign quantity to a person
    const itemAssignment =
      updatedSplitItems[itemIndex].assigned[personIndex] || 0;
    updatedSplitItems[itemIndex].assigned[personIndex] = itemAssignment + value;

    setSplitItems(updatedSplitItems);
  };

  const handleConfirmSplit = () => {
    let updatedPersonTotals = Array(numberOfPeople).fill(0);

    splitItems.forEach((item) => {
      item.assigned?.forEach((quantity, personIndex) => {
        const totalAmount = item.price * quantity;
        updatedPersonTotals[personIndex] += totalAmount;
      });
    });

    setPersonTotals(updatedPersonTotals);
    message.success("Bill split calculated successfully!");
  };

  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    { title: "Quantity", dataIndex: "quantity" },
    {
      title: "Price (€)",
      dataIndex: "price",
      render: (price) => `€${price.toFixed(2)}`,
    },
    {
      title: "Total (€)",
      render: (_, record) => `€${(record.quantity * record.price).toFixed(2)}`,
    },
  ];

  // Calculate the total price for the order
  const totalPrice = orderData.orderItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  return (
    <div>
      <h2>Order Details</h2>
      <p>
        <b>Table Number:</b> {orderData.tableNumber}
      </p>
      <p>
        <b>Order Date:</b> {new Date(orderData.createdAt).toLocaleDateString()}
      </p>
      <Table
        columns={columns}
        dataSource={orderData.orderItems}
        rowKey="itemId"
        pagination={false}
      />

      <div className="split-bill-summary">
        <p>
          <b>Total Price:</b> €{totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Split Bill Button */}
      <div className="button-container">
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="split-bill-button"
        >
          Split Bill
        </Button>

        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>

      {/* Split Bill Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="split-bill-modal-wrapper">
            <h3 className="split-bill-title">Split the Bill</h3>

            <div>
              <label className="split-bill-people-label">
                Number of People:{" "}
              </label>
              <InputNumber
                min={1}
                value={numberOfPeople}
                onChange={(value) => setNumberOfPeople(value)}
                className="split-bill-people-input"
              />
            </div>

            <div>
              {splitItems.map((item, itemIndex) => (
                <div key={item.itemId} className="split-bill-item-wrapper">
                  <h4 className="split-bill-item-name">
                    {item.itemName} - €{item.price} per unit
                  </h4>
                  <p className="split-bill-item-price">Price: €{item.price}</p>

                  {[...Array(numberOfPeople)].map((_, personIndex) => (
                    <div
                      key={personIndex}
                      className="split-bill-person-wrapper"
                    >
                      <label>Person {personIndex + 1}: </label>
                      <InputNumber
                        min={0}
                        max={item.quantity}
                        value={item.assigned ? item.assigned[personIndex] : 0}
                        onChange={(value) =>
                          handleSplitItem(itemIndex, personIndex, value)
                        }
                        className="split-bill-assignment-input"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Button
              type="primary"
              onClick={handleConfirmSplit}
              className="split-bill-confirm-button"
            >
              Confirm Split
            </Button>
          </div>

          {/* Display Calculated Totals per Person */}
          {personTotals.length > 0 && (
            <div className="split-bill-total-summary">
              <h4>Bill Summary:</h4>
              {personTotals.map((total, personIndex) => (
                <div key={personIndex} className="split-bill-person-total">
                  <p>
                    Person {personIndex + 1}: <b>€{total.toFixed(2)}</b>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
