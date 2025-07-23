import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Descriptions,
  Tag,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
} from "antd";
import { Search ,ExternalLink} from "lucide-react";

import axiosInstance from "../../../../config/axios";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ExportHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const fetchHistoryExport = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/outbounds/warehouse");
      setData(res.data);
    } catch (error) {
      console.error("API error:", error);
      message.error("Failed to load export history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryExport();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const receiptMatch = item._id
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const emailMatch = item.createBy?.email
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const customerMatch = customerFilter
        ? item.customerId?.name === customerFilter
        : true;

      let dateMatch = true;
      if (dateRange && dateRange.length === 2) {
        const createdDate = new Date(item.createdAt).getTime();
        const startDate = new Date(
          dateRange[0].startOf("day").toISOString()
        ).getTime();
        const endDate = new Date(
          dateRange[1].endOf("day").toISOString()
        ).getTime();
        dateMatch = createdDate >= startDate && createdDate <= endDate;
      }

      return (receiptMatch || emailMatch) && customerMatch && dateMatch;
    });
  }, [data, searchText, customerFilter, dateRange]);

  const columns = [
    {
      title: "Export Code",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Tag color="blue">{id.slice(-6).toUpperCase()}</Tag>,
    },
    {
      title: "Customer",
      dataIndex: ["customerId", "name"],
      key: "customerName",
    },
    {
      title: "Created By",
      dataIndex: ["createBy", "email"],
      key: "createdBy",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleString("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Total Items",
      key: "totalItems",
      render: (record) => record.items.length,
    },
    {
      title: "Total Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  const expandedRowRender = (record) => {
    const itemColumns = [
      {
        title: "Product Name",
        dataIndex: ["zoneItem", "itemId", "productId", "name"],
        key: "productName",
      },
      {
        title: "Zone",
        dataIndex: ["zoneItem", "zoneId", "name"],
        key: "zoneName",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Weight (kg)",
        dataIndex: ["zoneItem", "itemId", "weights"],
        key: "weights",
      },
      {
        title: "Expiry Date",
        dataIndex: ["zoneItem", "itemId", "expiredDate"],
        key: "expiredDate",
        render: (date) =>
          date ? new Date(date).toLocaleDateString("en-US") : "N/A",
      },
    ];

    return (
      <div className="p-4 bg-gray-50">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Full Export Code">
            {record._id}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {record.customerId?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Phone">
            {record.customerId?.phone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Address">
            {record.customerId?.address || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {record.createBy?.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Quantity">
            {record.quantity}
          </Descriptions.Item>
        </Descriptions>

        <Table
          columns={itemColumns}
          dataSource={record.items}
          rowKey="_id"
          pagination={false}
          size="small"
          className="mt-4"
          bordered
        />
      </div>
    );
  };

  const uniqueCustomers = [
    ...new Set(data.map((item) => item.customerId?.name).filter(Boolean)),
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center mb-4">
        <ExternalLink className="inline-block mr-2" size={40} />
        <Title level={3} className="inline-block">
          Export History
        </Title>
      </div>

      {/* Filter Section */}
      <Space className="mb-4" wrap>
        <Input
          placeholder="Search by export code or email"
          prefix={<Search size={16} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />

        <Select
          placeholder="Filter by Customer"
          value={customerFilter}
          onChange={(value) => setCustomerFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          {uniqueCustomers.map((customer) => (
            <Option key={customer} value={customer}>
              {customer}
            </Option>
          ))}
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(value) => setDateRange(value)}
          allowClear
          style={{ width: 300 }}
        />

        <Button
          onClick={() => {
            setSearchText("");
            setCustomerFilter("");
            setDateRange(null);
          }}
        >
          Clear Filters
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          bordered
          pagination={{ pageSize: 8 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.items && record.items.length > 0,
          }}
        />
      </Spin>
    </div>
  );
};

export default ExportHistory;
