import { Button, Table, Popconfirm, Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PayCircleOutlined, // Payment icon
  PrinterOutlined
} from "@ant-design/icons"; // Import icons for status update
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the styles
import * as XLSX from "xlsx"; // Import xlsx library for Excel functionality
import "./OrderList.css";

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle payment option selection
  const handlePayment = async(record, paymentMethod) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/orders/${record.orderId}/paymentMethod`, { paymentMethod });
      if (response.status === 200) {
        toast.success("Order payment updated successfully", { position: "top-right" });
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === record.orderId ? { ...order, paymentMethod } : order
          )
        );
      } 
    } catch (error) {
      toast.error(error.response.data.message, { position: "top-right" });
    }
  };

  const genrateOrder = async(record) => {

    try {
      // Send GET request to your backend route
      const response = await axios.get(`http://localhost:8080/api/generate-bill/${record.orderId}`, {
        responseType: 'blob', // Ensure we handle the response as a Blob (binary data)
      });

      // Create a URL for the Blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill_${record.displayId}.pdf`; // Name the file
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Error:', error);
    } 
  };

  const genrateOrderBill = async (record) => {
    try {
      // Send GET request to your backend route
      const response = await axios.get(`http://localhost:8080/api/generate-bill/${record.orderId}`, {
        responseType: 'blob', // Ensure we handle the response as a Blob (binary data)
      });
  
      // Create a Blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
  
      // Open the PDF in a new browser tab
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.onload = () => {
          // Trigger the print dialog
          newWindow.print();
        };
      }
  
      // Optionally revoke the Blob URL after some time
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error('Error generating the bill:', error);
      toast.error('Failed to generate the bill. Please try again.', { position: 'top-right' });
    }
  };

  const handleDownloadExcel = () => {
    // Convert the orders to a format suitable for Excel
    const formattedOrders = orders.flatMap((order) => {
      // Calculate the total order price
      const totalPrice = order.orderItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2);
  
      // Format each item of the order with its details in separate rows
      return order.orderItems.map((item) => ({
        "Order ID": order.orderId,
        "Table Number": order.tableNumber,
        "Order Date": new Date(order.createdAt).toLocaleDateString(),
        "Order Status": order.status,
        "Order Total Price": `€${totalPrice}`,
        "Item Name": item.itemName,
        "Quantity": item.quantity,
        "Item Price": `€${(item.price * item.quantity).toFixed(2)}`
      }));
    });
  
    // Create a new worksheet from the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedOrders);
  
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
  
    // Trigger the download of the Excel file
    XLSX.writeFile(wb, "Order_List.xlsx");
  };

  const handleDeleteRow = async (record) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/orders/${record.orderId}`);
      if (response.status === 200) {
        setOrders((prev) => prev.filter((order) => order.orderId !== record.orderId));
        toast.success("Order deleted successfully", { position: "top-right" });
      } else {
        toast.error("Failed to delete order. Please try again.", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error deleting order", error);
      toast.error("Failed to delete order. Please try again.", { position: "top-right" });
    }
  };

  const handleStatusChange = async (record, status) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/orders/${record.orderId}/status`, { status });
      if (response.status === 200) {
        toast.success("Order status updated successfully", { position: "top-right" });
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === record.orderId ? { ...order, status } : order
          )
        );
      } else {
        toast.error(response.error, { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.response.data.message, { position: "top-right" });
    }
  };

  const orderListColumn = [
    {
      title: "OrderId",
      dataIndex: "displayId",
      sorter: true,
    },
    {
      title: "Table Number",
      dataIndex: "tableNumber",
      sorter: true,
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      render: (text, record) => new Date(record.createdAt).toLocaleDateString(),
    },
    {
      title: "Order Price",
      render: (_, record) =>
        `€${record.orderItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}`,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
         <Button
            type="link"
            onClick={() => genrateOrderBill(record)}
            icon={<PrinterOutlined />} // Eye icon for "View"
          />
        <Button
            type="link"
            onClick={() => genrateOrder(record)}
            icon={<DownloadOutlined />} // Eye icon for "View"
          />
          <Button
            type="link"
            onClick={() => navigate(`/orderDetails/${record.orderId}`)}
            icon={<EyeOutlined />} // Eye icon for "View"
          />
          {
            record.status !== 'COMPLETED'&&(<Button
            type="link"
            onClick={() => navigate(`/orderUpdate/${record.orderId}`)}
            icon={<EditOutlined />} // Edit icon for "Edit"
          />)
          }
          
          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => handleDeleteRow(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />} // Delete icon for "Delete"
            />
          </Popconfirm>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" onClick={() => handlePayment(record, "Cash")}>
                  Cash
                </Menu.Item>
                <Menu.Item key="2" onClick={() => handlePayment(record, "Card")}>
                  Card
                </Menu.Item>
                <Menu.Item key="3" onClick={() => handlePayment(record, "Paypal")}>
                  Paypal
                </Menu.Item>
              </Menu>
            }
          >
            <Button
              type="link"
              icon={<PayCircleOutlined />} // Payment icon
              disabled={record.paymentMethod}
            >
              {record.paymentMethod}
            </Button>
          </Dropdown>
          {record.paymentMethod && record.status !== "COMPLETED" && (
          <Button
            type="link"
            onClick={() => handleStatusChange(record, "COMPLETED")}
            icon={<CheckCircleOutlined />} // Icon for "Update Status"
          >
            Complete
          </Button>
        )}
        
        </>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: (text, record) => record.status,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      render: (text, record) => record.paymentMethod,
    },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/orders");
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="centered-container">
      <div className="list-page-heading">The Indian Tadka</div>
      <div className="place-order-btn-container">
        <Button className="place-order-btn" onClick={() => navigate("/orderCreate")}>
          Place Order
        </Button>
        {/* Add the Excel Download Button */}
        <Button
          className="download-excel-btn"
          icon={<DownloadOutlined />}
          onClick={handleDownloadExcel}
        >
          Download Orders Excel
        </Button>
      </div>
      <div className="table-container">
        <Table
          columns={orderListColumn}
          rowKey="orderId"
          dataSource={orders}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default OrderList;
