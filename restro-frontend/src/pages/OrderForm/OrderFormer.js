import React, { useEffect, useState } from "react";
import { Input, Button, Table } from "antd";
import CounterButton from "../../components/CounterButton";
import Modal from "../../components/Modal";
import ItemList from "../../components/Itemslist";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "loadsh";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons"; // Import the back arrow icon

export default function OrderForm({
  title,
  initialData = {},
  onSubmit,
  isSubmitting,
  formType,
  onStatusChange,
}) {
  const [tableNumber, setTableNumber] = useState(
    initialData?.tableNumber || ""
  );
  const [orderItems, setOrderItems] = useState(initialData?.orderItems || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDate, setOrderDate] = useState(getTodayDate);
  const [status] = useState("INPROGRESS");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEmpty(initialData)) {
      setOrderDate(initialData.orderDate);
      setTableNumber(initialData.tableNumber);
      setOrderItems(initialData.orderItems);
    }
  }, [initialData]);

  const handleAddItem = (item) => {
    setOrderItems((prev) =>
      prev.find((p) => p.itemName === item.itemName)
        ? prev
        : [...prev, { ...item, quantity: 1 }]
    );
  };
  const handleRemovePayload =(item) =>{
    setOrderItems(orderItems.filter((i) => i.itemId !== item.itemId))
  }

  const handleQuantityChange = (record, quantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === record.itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmit = () => {
    const payload = { tableNumber, orderDate, orderItems, status };
    payload.orderDate = getCurrentTime(payload.orderDate)
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
    { title: "Price", dataIndex: "price" },
    {
      title: "Actions",
      render: (_, record) => (
        <Button danger
          onClick={() =>
            setOrderItems(orderItems.filter((i) => i.itemId !== record.itemId))
          }
          icon={<DeleteOutlined />} // Edit icon for "Edit"
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Back Arrow Icon */}
        <ArrowLeftOutlined
          onClick={() => navigate("/")}
          style={{ fontSize: "20px", marginRight: "10px", cursor: "pointer" }}
        />
        <h2>{title}</h2>
      </div>

      <Input
        value={orderDate}
        onChange={(e) => setOrderDate(e.target.value)}
        placeholder="Order Date"
        type="date"
      />
      <Input
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="Table Number"
      />
      <Table columns={columns} dataSource={orderItems} rowKey="itemId" />
      <Button
        style={{ margin: "10px" }}
        type="primary"
        onClick={() => setIsModalOpen(true)}
      >
        Add Item
      </Button>
      <Button
        style={{ margin: "10px" }}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ItemList data={orderItems} handleAddToPayload={handleAddItem} handleRemoveFromPayload={handleRemovePayload}/>
        </Modal>
      )}
    </div>
  );
}

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getCurrentTime = (date) =>{
const currentTime = new Date();
const hours = String(currentTime.getHours()).padStart(2, '0');
const minutes = String(currentTime.getMinutes()).padStart(2, '0');
const seconds = String(currentTime.getSeconds()).padStart(2, '0');
const dateWithTimeString = `${date}T${hours}:${minutes}:${seconds}`;
return new Date(dateWithTimeString);
}
