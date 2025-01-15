import React, { useState, useEffect, useCallback } from "react";
import { Button, Row, Col, Table, message, DatePicker, Tabs } from "antd";
import moment from "moment";
import axios from "axios";
import "./OrderReport.css";
import { base_url } from "../../utils/apiList";
import { toast } from "react-toastify";

const { RangePicker } = DatePicker;

const OrderReport = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    paymentMethod: "Cash",
  });
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1, // Set default current page
    pageSize: 8, // Default page size is 8
  });
  const [pageChange, setPageChange] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const search = [];

    if (selectedFilters.paymentMethod) {
      search.push(`paymentMethod: ${selectedFilters.paymentMethod}`);
    }
    if (selectedFilters.today) {
      search.push(`today:${selectedFilters.today}`);
    }
    if (selectedFilters.currentWeek) {
      search.push(`currentWeek:${selectedFilters.currentWeek}`);
    }
    if (selectedFilters.currentMonth) {
      search.push(`currentMonth:${selectedFilters.currentMonth}`);
    }
    if (selectedFilters.currentYear) {
      search.push(`currentYear:${selectedFilters.currentYear}`);
    }
    if (selectedFilters.dateRange) {
      const [startDate, endDate] = selectedFilters.dateRange;
      search.push(`dateRange:${startDate} TO ${endDate}`);
    }

    try {
      const response = await axios.post(
        `${base_url}/orders-listing`,
        {
          search: search.join(" AND "),
        },
        {
          params: {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          },
        }
      );
      setOrders(response.data.orders);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error) {
      setOrders([]);
      toast.error(error?.response?.data?.message, {
        position: "top-right", // Correct position value
      });
    } finally {
      setLoading(false); // Set loading to false after the request
    }
  }, [selectedFilters, pagination.currentPage, pagination.pageSize]);

  // UseEffect to call fetchData change

  useEffect(() => {
    fetchOrders();
  }, [pageChange, fetchOrders]);

  const handleDateFilterChange = (filter) => {
    const today = new Date().toISOString().split("T")[0];

    // Reset all date filters before applying the new filter
    setSelectedFilters((prevState) => {
      let newFilters = {
        ...prevState,
        paymentMethod: prevState.paymentMethod, // Keep paymentMethod unchanged
        today: undefined, // Clear today filter
        currentWeek: undefined, // Clear currentWeek filter
        currentMonth: undefined, // Clear currentMonth filter
        currentYear: undefined, // Clear currentYear filter
        dateRange: undefined, // Clear custom date range
      };

      // Apply the selected filter
      if (filter === "today") {
        newFilters.today = today; // Apply today filter
        newFilters.dateRange = undefined;
      } else if (filter === "currentWeek") {
        newFilters.dateRange = undefined;
        newFilters.currentWeek = today; // Apply current week filter
      } else if (filter === "currentMonth") {
        newFilters.dateRange = undefined;
        newFilters.currentMonth = today; // Apply current month filter
      } else if (filter === "currentYear") {
        newFilters.dateRange = undefined;
        newFilters.currentYear = today; // Apply current year filter
      }

      return newFilters;
    });
  };

  const handleCustomDateChange = (dates) => {
    if (dates && dates.length === 2) {
      // If dates are selected, store them as date range
      const startDate = dates[0].format("YYYY-MM-DD"); // Start date formatted as "YYYY-MM-DD"
      const endDate = dates[1].format("YYYY-MM-DD"); // End date formatted as "YYYY-MM-DD"

      setSelectedFilters((prevState) => ({
        ...prevState,
        today: undefined, // Clear today filter
        currentWeek: undefined, // Clear currentWeek filter
        currentMonth: undefined, // Clear currentMonth filter
        currentYear: undefined, // Clear currentYear filter
        dateRange: [startDate, endDate], // Store only date part in selectedFilters
      }));
    } else {
      // If the date range is cleared (dates are null or empty), remove dateRange filter
      setSelectedFilters((prevState) => ({
        ...prevState,
        dateRange: undefined, // Remove dateRange filter
      }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedFilters((prevState) => ({
      ...prevState,
      paymentMethod: method,
    }));
  };

  const handlePageChange = ({ pageSize, current }) => {
    if (pagination.pageSize !== pageSize || pagination.current !== current) {
      setPageChange(true);
    }
    setPagination((prev) => ({
      currentPage: current,
      pageSize: pageSize,
    }));
  };

  const disabledDate = (current) => {
    // Disable all dates after today (future dates)
    return current && current > moment().endOf('day');
  };

  const calculateTotalPrice = () => {
    return orders
      .reduce((total, order) => {
        return (
          total +
          order.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        );
      }, 0)
      .toFixed(2); // Format the total price to 2 decimal places
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "displayId",
      key: "orderId",
    },
    {
      title: "Payment Type",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Order Price ",
      dataIndex: "price",
      render: (_, record) =>
        `€${record.orderItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}`,
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const items = [
    {
      key: "Cash",
      label: "Cash",
    },
    {
      key: "PayPal",
      label: "PayPal",
    },
    {
      key: "Card",
      label: "Card",
    },
  ];
  return (
    <div className="order-report-container">
      <Row gutter={[16, 16]}>
        <Col span={24} className="filter-buttons">
          <Button.Group>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("day").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("today")}
              className={selectedFilters?.today ? "selected" : ""}
            >
              Today
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("week").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentWeek")}
              className={selectedFilters?.currentWeek ? "selected" : ""}
            >
              This Week
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("month").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentMonth")}
              className={selectedFilters?.currentMonth ? "selected" : ""}
            >
              This Month
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("year").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentYear")}
              className={selectedFilters?.currentYear ? "selected" : ""}
            >
              This Year
            </Button>
          </Button.Group>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="custom-date-row">
        <Col span={24}>
          <RangePicker
            value={
              selectedFilters.dateRange
                ? [
                    moment(selectedFilters.dateRange[0]),
                    moment(selectedFilters.dateRange[1]),
                  ]
                : null // If dateRange is undefined, set value to null (clears the RangePicker)
            }
            onChange={handleCustomDateChange}
            allowClear
            disabledDate={disabledDate}
            placeholder={["Start Date", "End Date"]}
              dropdownClassName="single-month-picker"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="payment-tabs-row">
        <Col span={24}>
          <Tabs
            defaultActiveKey="Cash"
            onChange={handlePaymentMethodChange}
            centered
            items={items}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div
            style={{ textAlign: "right", fontSize: "16px", fontWeight: "bold" }}
          >
            Total Price: €{calculateTotalPrice()}
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        onChange={handlePageChange} // Handle page changes (page size, current page)
        pagination={{
          className: "table-pagination",
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: totalCount,
          showSizeChanger: true,
          total: totalCount,
          pageSizeOptions: ["5", "8", "15", "20"], // Page size options
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} orders`,
        }}
      />
    </div>
  );
};

export default OrderReport;
