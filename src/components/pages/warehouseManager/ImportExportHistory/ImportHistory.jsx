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
import { Import, Search } from "lucide-react";
import axiosInstance from "../../../../config/axios";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ImportHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateRange, setDateRange] = useState(null); // [moment, moment]

  const fetchHistoryImport = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/inbounds/warehouse");
      setData(res.data);
    } catch (error) {
      console.error("API error:", error);
      message.error("Failed to load import history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryImport();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const receiptMatch = item._id
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const emailMatch = item.createdBy?.email
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const zoneMatch = zoneFilter ? item.zoneId?.name === zoneFilter : true;
      const supplierMatch = supplierFilter
        ? item.supplierId?.name === supplierFilter
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

      return (
        (receiptMatch || emailMatch) && zoneMatch && supplierMatch && dateMatch
      );
    });
  }, [data, searchText, zoneFilter, supplierFilter, dateRange]);

  const columns = [
    {
      title: "Receipt Code",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Tag color="blue">{id.slice(-6).toUpperCase()}</Tag>,
    },
    {
      title: "Zone",
      dataIndex: ["zoneId", "name"],
      key: "zoneName",
    },
    {
      title: "Supplier",
      dataIndex: ["supplierId", "name"],
      key: "supplierName",
    },
    {
      title: "Created By",
      dataIndex: ["createdBy", "email"],
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
      render: (record) => record.item.length,
    },
  ];

  const expandedRowRender = (record) => {
    const itemColumns = [
      {
        title: "Product Name",
        dataIndex: ["productId", "name"],
        key: "productName",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Weight (kg)",
        dataIndex: "weights",
        key: "weights",
      },
      {
        title: "Expiry Date",
        dataIndex: "expiredDate",
        key: "expiredDate",
        render: (date) =>
          date ? new Date(date).toLocaleDateString("en-US") : "N/A",
      },
    ];

    return (
      <div className="p-4 bg-gray-50">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Full Receipt Code">
            {record._id}
          </Descriptions.Item>
          <Descriptions.Item label="Zone">
            {record.zoneId?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {record.supplierId?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {record.createdBy?.email || "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <Table
          columns={itemColumns}
          dataSource={record.item}
          rowKey="_id"
          pagination={false}
          size="small"
          className="mt-4"
          bordered
        />
      </div>
    );
  };

  const uniqueZones = [
    ...new Set(data.map((item) => item.zoneId?.name).filter(Boolean)),
  ];
  const uniqueSuppliers = [
    ...new Set(data.map((item) => item.supplierId?.name).filter(Boolean)),
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center mb-4">
        <Import className="inline-block mr-2" size={40} />
        <Title level={3} className="inline-block">
          Import History
        </Title>
      </div>

      {/* Filter Section */}
      <Space className="mb-4" wrap>
        <Input
          placeholder="Search by receipt code or email"
          prefix={<Search size={16} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />

        <Select
          placeholder="Filter by Zone"
          value={zoneFilter}
          onChange={(value) => setZoneFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          {uniqueZones.map((zone) => (
            <Option key={zone} value={zone}>
              {zone}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by Supplier"
          value={supplierFilter}
          onChange={(value) => setSupplierFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          {uniqueSuppliers.map((supplier) => (
            <Option key={supplier} value={supplier}>
              {supplier}
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
            setZoneFilter("");
            setSupplierFilter("");
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
            rowExpandable: (record) => record.item && record.item.length > 0,
          }}
        />
      </Spin>
    </div>
  );
};

export default ImportHistory;
