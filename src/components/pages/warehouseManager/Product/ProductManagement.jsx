import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Tooltip,
  message,
  Select,
  Pagination,
  Form,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { ProductContext } from "../../../../context/ProductContext";
import ProductRequestDetailsModal from "./ProductRequestDetailsModal.jsx";
import ProductRejectionReasonModal from "./ProductRejectionReasonModal.jsx";

const { Title } = Typography;
const { Option } = Select;

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const STATUS_COLOR = {
  ACTIVE: "green",
  INACTIVE: "gray",
  PENDING: "gold",
  APPROVED: "lime",
  REJECTED: "red",
};

const TYPE_COLOR = {
  CREATE: "blue",
  UPDATE: "orange",
  STATUS_CHANGE: "purple",
};

const ACTION_COLOR = {
  ACTIVE: "blue",
  INACTIVE: "gray",
};

const ProductManagement = () => {
  const {
    products,
    loading,
    fetchAllProducts,
    getProductById,
    approveProduct,
    rejectProduct,
  } = useContext(ProductContext);

  const [mappedRequests, setMappedRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentDisplayRequest, setCurrentDisplayRequest] = useState(null);
  const [rejectionForm] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
const [dateRange, setDateRange] = useState([]);
const { RangePicker } = DatePicker;
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Map BE data to table data
  useEffect(() => {
    const mapped = products.map((item) => ({
      id: item._id,
      name: item.name,
      category: item.category,
      density: item.density,
      image: item.image,
      storageTemp: item.storageTemperature
        ? `${item.storageTemperature.min}°C - ${item.storageTemperature.max}°C`
        : "",
      type: item.requestType || "",
      submittedBy:
        (item.requestType === "CREATE"
          ? item.createdBy?.email
          : item.updatedBy?.email) || "",
      dateSubmitted:
        item.requestType === "CREATE"
          ? item.createdAt
          : item.requestType === "UPDATE" ||
            item.requestType === "STATUS_CHANGE"
          ? item.updatedAt
          : item.createdAt,
      status: item.status || "",
      action: item.action || "",
      requestType: item.requestType || "",
      rejectionReason: item.rejectedNote || "",
      raw: item,
    }));
    setMappedRequests(mapped);
  }, [products]);

  // Filtering, sorting, pagination
  useEffect(() => {
    let data = [...mappedRequests];
    // Search theo name, submittedBy, date (DD/MM/YYYY)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(lower)) ||
          (item.submittedBy &&
            item.submittedBy.toLowerCase().includes(lower)) ||
          (item.dateSubmitted &&
            dayjs(item.dateSubmitted).format("DD/MM/YYYY").includes(lower))
      );
    }
    // Status filter
    if (selectedStatusFilter !== "All") {
      data = data.filter(
        (item) => item.status && item.status === selectedStatusFilter
      );
    }
    // Type filter
    if (selectedTypeFilter !== "All") {
      data = data.filter(
        (item) => item.type && item.type === selectedTypeFilter
      );
    }
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      data = data.filter((item) => {
        if (!item.dateSubmitted) return false;

        const submitted = dayjs(item.dateSubmitted);
        const startDate = dayjs(dateRange[0]).startOf("day");
        const endDate = dayjs(dateRange[1]).endOf("day");

        return (
          submitted.isSameOrAfter(startDate) &&
          submitted.isSameOrBefore(endDate)
        );
      });
    }

    // Sort: PENDING > APPROVED > REJECTED > ACTIVE > INACTIVE, mới nhất lên đầu
    const statusOrder = {
      PENDING: 1,
      APPROVED: 2,
      REJECTED: 3,
      ACTIVE: 4,
      INACTIVE: 5,
    };
    data.sort((a, b) => {
      const sa = statusOrder[a.status] || 99;
      const sb = statusOrder[b.status] || 99;
      if (sa !== sb) return sa - sb;
      return dayjs(b.dateSubmitted).diff(dayjs(a.dateSubmitted));
    });

    setTotalItems(data.length);

    // Pagination
    const start = (currentPage - 1) * pageSize;
    setFilteredRequests(data.slice(start, start + pageSize));
  }, [
    mappedRequests,
    searchTerm,
    selectedStatusFilter,
    selectedTypeFilter,
    dateRange,
    currentPage,
    pageSize,
  ]);

  // Modal handlers
  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setCurrentDisplayRequest(null);
  };

  const showRejectModal = () => {
    rejectionForm.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleRejectModalCancel = () => {
    setIsRejectModalVisible(false);
    rejectionForm.resetFields();
  };

  // Xử lý khi ấn Review
  const handleReview = async (record) => {
    setActionLoading(true);
    try {
      const detail = await getProductById(record.id);
      const getName = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object" && val.name) return val.name;
        return "";
      };
      let modalData = {
        id: detail._id,
        submittedBy:
          (detail.requestType === "CREATE"
            ? detail.createdBy?.email
            : detail.updatedBy?.email) || "",
        dateSubmitted: detail.createdAt,
        type: detail.requestType || "",
        status: detail.status || "",
        action: detail.action || "",
        rejectionReason: detail.rejectedNote || "",
      };
      if (detail.requestType === "CREATE") {
        modalData.productDetails = {
          image: detail.image,
          name: getName(detail.name),
          category: getName(detail.category),
          storageTemp: detail.storageTemperature
            ? `${detail.storageTemperature.min}°C - ${detail.storageTemperature.max}°C`
            : "",
          density: detail.density,
        };
      } else if (detail.requestType === "UPDATE") {
        const pending = detail.pendingChanges;
        modalData.productDetails = {
          old: {
            image: detail.image,
            name: getName(detail.name),
            category: getName(detail.category),
            storageTemp: detail.storageTemperature
              ? `${detail.storageTemperature.min}°C - ${detail.storageTemperature.max}°C`
              : "",
            density: detail.density,
          },
          new: {
            image: pending.image,
            name: getName(pending.name),
            category: getName(pending.category?.name),
            storageTemp: pending.storageTemperature
              ? `${pending.storageTemperature.min}°C - ${pending.storageTemperature.max}°C`
              : "",
            density: pending.density,
          },
        };
      } else if (detail.requestType === "STATUS_CHANGE") {
        const pending = detail.pendingChanges;
        modalData.productDetails = {
          name: getName(pending.name) || getName(detail.name),
          oldStatus: detail.action,
          newStatus: pending.action,
        };
      }
      setCurrentDisplayRequest(modalData);
      setIsDetailsModalVisible(true);
    } catch (error) {
      message.error("Failed to load product details.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!currentDisplayRequest) return;
    setActionLoading(true);
    try {
      await approveProduct(currentDisplayRequest.id);
      message.success("Approved successfully!");
      handleDetailsModalCancel();
      await fetchAllProducts();
    } catch (error) {
      message.error("Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (values) => {
    if (!currentDisplayRequest) return;
    setActionLoading(true);
    try {
      await rejectProduct(currentDisplayRequest.id, values.reason);
      message.success("Rejected successfully!");
      handleRejectModalCancel();
      handleDetailsModalCancel();
      await fetchAllProducts();
    } catch (error) {
      message.error("Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "No.",
      key: "serialNo",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: "5%",
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      width: "18%",
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <img
            src={record.image}
            alt={name}
            className="h-8 w-8 object-cover rounded"
          />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "12%",
      render: (type) => <Tag color={TYPE_COLOR[type] || "default"}>{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => (
        <Tag color={STATUS_COLOR[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Submitted By",
      dataIndex: "submittedBy",
      key: "submittedBy",
      width: "18%",
    },
    {
      title: "Date Submitted",
      dataIndex: "dateSubmitted",
      key: "dateSubmitted",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      width: "13%",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "12%",
      render: (action) => (
        <Tag color={ACTION_COLOR[action] || "default"}>{action}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              type={record.status === "PENDING" ? "primary" : "default"}
              onClick={() => handleReview(record)}
              className="rounded-md"
              loading={actionLoading}
            >
              {record.status === "PENDING" ? "Review" : "View"}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1200px" }}>
      <Title level={2} style={{ marginBottom: 30 }}>
        <BoxPlotOutlined /> Product Approval
      </Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: "24px" } }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search by name, submitted by"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 400 }}
              prefix={<SearchOutlined />}
              className="rounded-md"
            />
            <Select
              defaultValue="All"
              style={{ width: 150 }}
              onChange={setSelectedStatusFilter}
              className="rounded-md"
              placeholder="Filter by Status"
              value={selectedStatusFilter}
            >
              <Option value="All">All Statuses</Option>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="PENDING">PENDING</Option>
              <Option value="APPROVED">APPROVED</Option>
              <Option value="REJECTED">REJECTED</Option>
            </Select>
            <Select
              defaultValue="All"
              style={{ width: 180 }}
              onChange={setSelectedTypeFilter}
              className="rounded-md"
              placeholder="Filter by Type"
              value={selectedTypeFilter}
            >
              <Option value="All">All Types</Option>
              <Option value="CREATE">CREATE</Option>
              <Option value="UPDATE">UPDATE</Option>
              <Option value="STATUS_CHANGE">STATUS_CHANGE</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
              }}
              format="DD/MM/YYYY"
              style={{ width: 300 }}
              allowClear
              placeholder={["Start Date", "End Date"]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            loading={loading || actionLoading}
            pagination={false}
            bordered
          />
          <Pagination
            current={currentPage}
            onChange={(page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            }}
            pageSize={pageSize}
            total={totalItems}
            align="end"
            showSizeChanger={false}
          />
        </Space>
      </Card>

      <ProductRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentDisplayRequest}
        onCancel={handleDetailsModalCancel}
        onApprove={handleApproveRequest}
        onShowRejectModal={showRejectModal}
        loading={actionLoading}
      />

      {/* Rejection Reason Modal */}
      <ProductRejectionReasonModal
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        onSubmit={handleRejectRequest}
        loading={actionLoading}
        form={rejectionForm}
      />
    </div>
  );
};

export default ProductManagement;
