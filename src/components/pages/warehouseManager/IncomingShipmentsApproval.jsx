import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Descriptions,
  Divider,
  Select,
  Spin,
  Alert,
  DatePicker,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
const { Title, Text } = Typography;
const { Option } = Select;
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const API_BASE = "http://localhost:8080/api/v1";
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${JSON.parse(localStorage.getItem("access_token"))}`,
    },
});
console.log(localStorage.getItem("access_token"));
const IncomingShipmentsApproval = () => {
  // State
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Chi tiết đơn
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Reject
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionForm] = Form.useForm();
  const [rejecting, setRejecting] = useState(false);

  // Approve
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [zones, setZones] = useState([]);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState("");
  const [approving, setApproving] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const { RangePicker } = DatePicker;
  // Error
  const [apiError, setApiError] = useState("");

  // --- Fetch all transfer requests ---
 useEffect(() => {
   setLoading(true);
   axios
     .get(`${API_BASE}/internal-transfers`, getAuthHeaders())
     .then((res) => {
       setRequests(res.data || []);
       setLoading(false);
     })
     .catch(() => {
       setLoading(false);
       message.error("Failed to load transfer requests.");
     });
 }, []);

 // --- Filtering Logic ---
 useEffect(() => {
   let filtered = requests;

   if (searchTerm) {
     const lower = searchTerm.toLowerCase();
     filtered = filtered.filter(
       (req) =>
         req.sourceWarehouseId?.name?.toLowerCase().includes(lower) ||
         req.receiver?.warehouseId?.name?.toLowerCase().includes(lower)
     );
   }
   if (statusFilter) {
     filtered = filtered.filter((req) => req.status === statusFilter);
   }
   if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
     filtered = filtered.filter((req) => {
       if (!req.createdAt) return false;

       const created = dayjs(req.createdAt);
       const startDate = dayjs(dateRange[0]).startOf("day");
       const endDate = dayjs(dateRange[1]).endOf("day");

       return (
         created.isSameOrAfter(startDate) && created.isSameOrBefore(endDate)
       );
     });
   }
   setFilteredRequests(filtered);
 }, [searchTerm, statusFilter, dateRange, requests]);

 // --- Show details modal ---
 const showDetailsModal = async (record) => {
  console.log("Review ID:", record._id); 
   setDetailsLoading(true);
   setApiError("");
   try {
     const res = await axios.get(
       `${API_BASE}/internal-transfers/${record._id}`,
       getAuthHeaders()
     );
     setCurrentRequest(res.data);
     setIsDetailsModalVisible(true);
   } catch (err) {
     setApiError("Failed to load request details.");
   }
   setDetailsLoading(false);
 };

 // --- Approve Modal ---
 const showApproveModal = async () => {
   setZoneLoading(true);
   setApiError("");
   setSelectedZone("");
   try {
     const res = await axios.get(
       `${API_BASE}/warehouses/my-warehouse/zones-capacity`,
       getAuthHeaders()
     );
     // Sửa đoạn này để lấy đúng zones
     setZones(
       Array.isArray(res.data)
         ? res.data[0]?.zones || []
         : res.data?.zones || []
     );
     setIsApproveModalVisible(true);
   } catch (err) {
     setApiError("Failed to load zones.");
   }
   setZoneLoading(false);
 };
 const handleApprove = async () => {
   if (!selectedZone) {
     setApiError("Please select a zone.");
     return;
   }
   setApproving(true);
   setApiError("");
   try {
     await axios.put(
       `${API_BASE}/internal-transfers/${currentRequest._id}/approve`,
       { zoneId: selectedZone },
       getAuthHeaders()
     );
     message.success("Approved successfully!");
     setIsApproveModalVisible(false);
     setIsDetailsModalVisible(false);
     // Refresh list
     const res = await axios.get(
       `${API_BASE}/internal-transfers`,
       getAuthHeaders()
     );
     setRequests(res.data || []);
   } catch (err) {
     setApiError(err?.response?.data?.message || "Approve failed!");
   }
   setApproving(false);
 };

 // --- Reject Modal ---
 const showRejectModal = () => {
   rejectionForm.resetFields();
   setIsRejectModalVisible(true);
   setApiError("");
 };

 const handleReject = async (values) => {
   setRejecting(true);
   setApiError("");
   try {
     await axios.put(
       `${API_BASE}/internal-transfers/${currentRequest._id}/reject`,
       { rejectedNote: values.reason },
       getAuthHeaders()
     );
     message.success("Rejected successfully!");
     setIsRejectModalVisible(false);
     setIsDetailsModalVisible(false);
     // Refresh list
     const res = await axios.get(
       `${API_BASE}/internal-transfers`,
       getAuthHeaders()
     );
     setRequests(res.data || []);
   } catch (err) {
     setApiError(err?.response?.data?.message || "Reject failed!");
   }
   setRejecting(false);
 };

  // --- Table Columns ---
  const columns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Created By",
      key: "createdBy",
      dataIndex: "createdBy",
      render: (createdBy) =>
        createdBy?.email ||
        [createdBy?.firstName, createdBy?.lastName].filter(Boolean).join(" ") ||
        "N/A",
      width: 180,
    },
    {
      title: "Source Warehouse",
      key: "sourceWarehouseName",
      render: (_, record) => record.sourceWarehouseId?.name || "N/A",
      width: 200,
    },
    {
      title: "Destination Warehouse",
      dataIndex: ["receiver", "warehouseId", "name"],
      key: "warehouseName",
      render: (_, record) => record.receiver?.warehouseId?.name || "N/A",
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        if (status === "PENDING") color = "gold";
        if (status === "APPROVED") color = "green";
        if (status === "REJECTED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Review">
            <Button
              icon={<EyeOutlined />}
              type="primary"
              onClick={() => showDetailsModal(record)}
              className="rounded-md"
            >
              Review
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: 1200 }}>
      <Title level={2} style={{ marginBottom: 30 }}>
        <InboxOutlined /> Internal Transfer Approval
      </Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="horizontal" size="middle" style={{ width: "100%" }}>
          <Input
            placeholder="Search by Warehouse Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            allowClear
          >
            <Option value="">All Status</Option>
            <Option value="PENDING">PENDING</Option>
            <Option value="APPROVED">APPROVED</Option>
            <Option value="REJECTED">REJECTED</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </Card>
      <Table
        columns={columns}
        dataSource={filteredRequests}
        loading={loading}
        rowKey={(record) => record._id}
      />
      {/* Details Modal */}
      <Modal
        title={
          <Title level={4} className="text-center mb-6">
            Review Internal Transfer
          </Title>
        }
        open={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setCurrentRequest(null);
          setApiError("");
        }}
        footer={null}
        destroyOnClose
        width={900}
        centered
      >
        {detailsLoading ? (
          <Spin tip="Loading details..." />
        ) : (
          currentRequest && (
            <div>
              {apiError && (
                <Alert
                  type="error"
                  message={apiError}
                  showIcon
                  className="mb-4"
                />
              )}
              <Card className="mb-6 shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">
                  Transfer Details
                </Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label={<Text strong>Created By</Text>}>
                    {currentRequest.createdBy?.email ||
                      [
                        currentRequest.createdBy?.firstName,
                        currentRequest.createdBy?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Status</Text>}>
                    <Tag
                      color={
                        currentRequest.status === "PENDING"
                          ? "gold"
                          : currentRequest.status === "APPROVED"
                          ? "green"
                          : "red"
                      }
                    >
                      {currentRequest.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Source Warehouse</Text>}
                  >
                    {currentRequest.sourceWarehouseId?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Source Zone</Text>}>
                    {currentRequest.sourceZoneId?.name}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Destination Warehouse</Text>}
                  >
                    {currentRequest.receiver?.warehouseId?.name}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Destination Zone</Text>}
                  >
                    {currentRequest.receiver?.zoneId?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Created At</Text>}>
                    {dayjs(currentRequest.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Rejected Note</Text>}
                    span={2}
                  >
                    {currentRequest.rejectedNote || (
                      <Text type="secondary">N/A</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider orientation="left" className="my-6">
                Items
              </Divider>
              <Table
                dataSource={currentRequest.items || []}
                columns={[
                  {
                    title: "Product",
                    key: "product",
                    render: (_, r) => {
                      const product = r.zoneItemId?.itemId?.productId;
                      const temp =
                        r.zoneItemId?.itemId?.productId?.storageTemperature;
                      console.log("Product:", product, "Temp:", temp);
                      return (
                        <div>
                          {temp && (
                            <span
                              style={{
                                color: "#1890ff",
                                fontSize: 13,
                                marginRight: 8,
                              }}
                            >
                              <span role="img" aria-label="temp">
                                🌡️
                              </span>
                              Temp: {temp?.min}°C ~ {temp?.max}°C
                            </span>
                          )}
                          <div>{product?.name || "N/A"}</div>
                        </div>
                      );
                    },
                  },
                  {
                    title: "Zone",
                    key: "zone",
                    render: (_, r) => r.zoneItemId?.zoneId?.name || "N/A",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                  {
                    title: "Density",
                    key: "density",
                    render: (_, r) =>
                      r.zoneItemId?.itemId?.productId?.density ?? "N/A",
                  },
                  {
                    title: "Expired Date",
                    key: "expiredDate",
                    render: (_, r) =>
                      r.zoneItemId?.itemId?.expiredDate
                        ? dayjs(r.zoneItemId.itemId.expiredDate).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A",
                  },
                ]}
                rowKey={(_, idx) => idx}
                pagination={false}
                size="small"
                bordered
              />

              {currentRequest.status === "PENDING" && (
                <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={showApproveModal}
                    className="rounded-md"
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={showRejectModal}
                    className="rounded-md"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={
          <Title level={4} className="text-center mb-6">
            Select Zone for Approval
          </Title>
        }
        open={isApproveModalVisible}
        onCancel={() => {
          setIsApproveModalVisible(false);
          setApiError("");
        }}
        footer={null}
        destroyOnClose
        width={500}
        centered
      >
        {zoneLoading ? (
          <Spin tip="Loading zones..." />
        ) : (
          <Form layout="vertical" onFinish={handleApprove}>
            {apiError && (
              <Alert
                type="error"
                message={apiError}
                showIcon
                className="mb-4"
              />
            )}
            <Form.Item
              label="Select Zone"
              required
              validateStatus={!selectedZone && apiError ? "error" : ""}
              help={!selectedZone && apiError ? apiError : ""}
            >
              <Select
                placeholder="Select a zone"
                value={selectedZone}
                onChange={setSelectedZone}
                style={{ width: "100%" }}
              >
                {zones.map((zone) => (
                  <Option key={zone.zoneId} value={zone.zoneId}>
                    {zone.zoneName}-(Available: {zone.capacity?.available}{" "}
                    m³)({zone.storageTemperature?.min}°C ~{" "}
                    {zone.storageTemperature?.max}°C)
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className="flex justify-end mt-4">
              <Space>
                <Button
                  onClick={() => setIsApproveModalVisible(false)}
                  className="rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={approving}
                  className="rounded-md"
                >
                  Confirm Approve
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <Title level={4} className="text-center mb-6">
            Enter Rejection Reason
          </Title>
        }
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={null}
        destroyOnClose
        width={500}
        centered
      >
        <Form
          form={rejectionForm}
          layout="vertical"
          name="rejection_reason_form"
          onFinish={handleReject}
        >
          {apiError && (
            <Alert type="error" message={apiError} showIcon className="mb-4" />
          )}
          <Form.Item
            label={<Text strong>Reason for Rejection</Text>}
            name="reason"
            rules={[
              {
                required: true,
                message: "Please enter a reason for rejection.",
              },
              { min: 10, message: "Reason must be at least 10 characters." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter reason for rejecting this transfer (min 10 characters)"
              className="rounded-md"
            />
          </Form.Item>
          <Form.Item className="flex justify-end mt-4">
            <Space>
              <Button
                onClick={() => setIsRejectModalVisible(false)}
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={rejecting}
                className="rounded-md"
              >
                Submit Rejection
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
  
};

export default IncomingShipmentsApproval;
