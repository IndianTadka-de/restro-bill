import React, { useEffect, useState } from "react";
import { Input, Button, Table, Col, Row, Switch } from "antd";
import CounterButton from "../../components/CounterButton";
import Modal from "../../components/Modal";
import ItemList from "../../components/Itemslist";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons"; // Icons for the toggle
import "./OrderForm.css";

export default function OrderForm({
  title,
  initialData = {},
  onSubmit,
  isSubmitting,
  formType,
  onStatusChange,
}) {
  const [tableNumber, setTableNumber] = useState(initialData?.tableNumber || "");
  const [orderItems, setOrderItems] = useState(initialData?.orderItems || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [pickupOrder, setPickupOrder] = useState(initialData?.pickupOrder || false); // State for pickupOrder
  const [status] = useState("INPROGRESS");
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setOrderDate(initialData.orderDate);
      setTableNumber(initialData.tableNumber);
      setOrderItems(initialData.orderItems);
      setPickupOrder(initialData.pickupOrder || false); // Set initial value for pickupOrder
    }
  }, [initialData]);

  const handleAddItem = (item) => {
    setOrderItems((prev) =>
      prev.find((p) => p.itemName === item.itemName)
        ? prev
        : [...prev, { ...item, quantity: 1 }]
    );
  };

  const handleRemovePayload = (item) => {
    setOrderItems(orderItems.filter((i) => i.itemId !== item.itemId));
  };

  const handleQuantityChange = (record, quantity) => {
    if (quantity < 0) return; // Prevent negative quantities
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === record.itemId ? { ...item, quantity } : item
      )
    );
  };

  const handlePriceChange = (record, newPrice) => {
    const updatedItems = orderItems.map((item) =>
      item.itemId === record.itemId ? { ...item, price: newPrice } : item
    );
    setOrderItems(updatedItems);
  };

  const handleSubmit = () => {
    const payload = { tableNumber, orderDate, orderItems, status, pickupOrder };
    payload.orderDate = getCurrentTime(payload.orderDate);

    // Ensure tableNumber is only included when pickupOrder is false
    if (pickupOrder) {
      delete payload.tableNumber;
    }

    onSubmit(payload);
  };

  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    {
      title: "Quantity",
      render: (_, record) => (
        <CounterButton
          value={record.quantity}
          onIncrease={() => handleQuantityChange(record, record.quantity + 1)}
          onDecrease={() => handleQuantityChange(record, record.quantity - 1)}
        />
      ),
    },
    { 
      title: "Price",
       dataIndex: "price",
       render: (_, record) => (
        <Input
          value={record.price}
          onChange={(e) => handlePriceChange(record, e.target.value)}
          style={{ width: 80 }}
          type="number"
        />
      ),
    },
    { 
      title: "Total Price",
      dataIndex: "totalPrice",
      render: (_, record) => (
        <span>{(record.quantity * record.price).toFixed(2)}</span> // Display total price based on qty * unitPrice
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() =>
            setOrderItems(orderItems.filter((i) => i.itemId !== record.itemId))
          }
          icon={<DeleteOutlined />}
        />
      ),
    },
  ];

  const generateTableGrid = () => {
    const tableNumbers = [];
    for (let i = 1; i <= 12; i++) {
      const isSelected = String(tableNumber) === String(i);
      tableNumbers.push(
        <Col span={6} key={i}>
          <Button
            className={`table-button ${isSelected ? "selected" : ""}`}
            onClick={() => setTableNumber(String(i))}
            disabled={pickupOrder && isSelected} // Disable only the currently selected table for pickup orders
          >
            {i}
          </Button>
        </Col>
      );
    }
    return tableNumbers;
  };

  // Handle Remove Table Number
  const handleRemoveTable = () => {
    setTableNumber(""); // Reset table number
  };

  return (
    <div className="order-form-container">
      {/* Header */}
      <div className="order-form-header">
        <ArrowLeftOutlined
          onClick={() => navigate("/")}
          className="back-arrow"
        />
        <h2>{title}</h2>
      </div>

      {/* Pickup Order Toggle */}
      <div className="pickup-order-toggle">
        <label className="pickup-order-label">Pickup Order</label>
        <Switch 
          checked={pickupOrder} 
          onChange={(checked) => setPickupOrder(checked)} 
          checkedChildren={<CheckOutlined />} // Added check icon when on
          unCheckedChildren={<CloseOutlined />} // Added close icon when off
          style={{
            width: 70, // Increased width of the switch
            height: 35, // Increased height of the switch
            borderRadius: 20,
            backgroundColor: pickupOrder ? "#52c41a" : "#f5222d", // Green for pickup, red for dine-in
            padding: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "18px", // Increased size of the text/icons
          }}
        />
        <span className="pickup-order-text">
          {pickupOrder ? "Pickup Order" : "Dine-in"}
        </span>
      </div>

      {/* Order Date */}
      <div className="order-date-container">
        <label className="order-date-label">Order Date:</label>
        <Input
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          type="date"
          className="order-date-input"
        />
      </div>
      {/* Main Section: Table Grid and Items Table */}
      <div className="main-content">
        {/* Table Number Selection */}
        {!pickupOrder && (
          <div className="table-selection-container">
            <h4 className="table-selection-label">Select Table Number</h4>
            <Row gutter={[12, 12]}>{generateTableGrid()}</Row>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table Number"
              className="table-number-input"
            />
            {/* Only show Cancel button if table is selected */}
            {tableNumber && (
              <Button
                type="default"
                danger
                onClick={handleRemoveTable}
                icon={<CloseOutlined />}
                style={{ marginTop: 10 }}
              >
                Cancel Table Selection
              </Button>
            )}
          </div>
        )}

        {/* Items Table */}
        <Table
          columns={columns}
          dataSource={orderItems}
          rowKey="itemId"
          className="order-items-table"
        />
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Add Item
        </Button>
        <Button type="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ItemList
            data={orderItems}
            handleAddToPayload={handleAddItem}
            handleRemoveFromPayload={handleRemovePayload}
          />
        </Modal>
      )}
    </div>
  );
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getCurrentTime = (date) => {
  const now = new Date();
  return `${date}T${now.toTimeString().split(" ")[0]}`;
};
