import React from "react";
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Descriptions,
  Divider,
  Popconfirm,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const TYPE_COLOR = {
  CREATE: "blue",
  UPDATE: "orange",
  STATUS_CHANGE: "purple",
};

const STATUS_COLOR = {
  PENDING: "gold",
  APPROVED: "green",
  REJECTED: "red",
  ACTIVE: "green",
  INACTIVE: "gray",
};

const ProductRequestDetailsModal = ({
  visible,
  currentRequest,
  onCancel,
  onApprove,
  onShowRejectModal,
  loading,
}) => {
  if (!currentRequest && loading) {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        destroyOnClose
        width={900}
        className="rounded-lg"
        centered
      >
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "200px" }}
        >
          <Spin size="large" tip="Loading product details..." />
        </div>
      </Modal>
    );
  }

  if (!currentRequest) return null;
  return (
    <Modal
      title={
        <Title level={4} className="text-center mb-6">
          Review Product Request
        </Title>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={900}
      className="rounded-lg"
      centered
    >
      <div className="flex flex-col h-full">
        <div
          className="p-4 bg-white rounded-lg flex-grow overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          {/* Request Summary Section */}
          <Card className="mb-6 shadow-sm border border-gray-100 p-6 rounded-lg">
            <Title level={5} className="mb-4">
              Request Details
            </Title>
            <Descriptions
              column={2}
              bordered
              size="small"
              className="ant-descriptions-condensed"
            >
              <Descriptions.Item label={<Text strong>Created By</Text>}>
                {currentRequest.submittedBy}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Submitted By</Text>}>
                {currentRequest.submittedBy}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Request Type</Text>}>
                <Tag color={TYPE_COLOR[currentRequest.type] || "default"}>
                  {currentRequest.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Date Submitted</Text>}>
                {dayjs(currentRequest.dateSubmitted).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Current Action</Text>}
                span={2}
              >
                <Tag color={STATUS_COLOR[currentRequest.action] || "default"}>
                  {currentRequest.action}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Product Details Section */}
          <Divider orientation="left" className="my-6">
            Product Information
          </Divider>
          <div className="mt-4">
            {/* CREATE */}
            {currentRequest.type === "CREATE" && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">
                  New Product Details
                </Title>
                <Descriptions
                  column={2}
                  bordered
                  size="small"
                  className="ant-descriptions-condensed"
                >
                  <Descriptions.Item label={<Text strong>Image</Text>} span={2}>
                    {currentRequest.productDetails?.image && (
                      <img
                        src={currentRequest.productDetails.image}
                        alt="Product Image"
                        className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/100x100/D0D0D0/808080?text=No+Image";
                        }}
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Product Name</Text>}>
                    {currentRequest.productDetails?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Category</Text>}>
                    {currentRequest.productDetails?.category || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Storage Temp (°C)</Text>}
                  >
                    {currentRequest.productDetails?.storageTemp}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Density</Text>}>
                    {currentRequest.productDetails?.density}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* UPDATE & STATUS_CHANGE: Logic đảo chiều Old/New */}
            {currentRequest.type === "UPDATE" &&
              (currentRequest.status === "APPROVED" &&
              currentRequest.type === "UPDATE" ? (
                // Trái: New, Phải: Old
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    title={
                      <Title level={5} className="text-red-600 mb-0">
                        Old Data
                      </Title>
                    }
                    className="shadow-sm border border-red-200 p-4 rounded-lg"
                  >
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      className="ant-descriptions-condensed"
                    >
                      <Descriptions.Item label={<Text strong>Image</Text>}>
                        {currentRequest.productDetails?.new?.image && (
                          <img
                            src={currentRequest.productDetails.new.image}
                            alt="New Product Image"
                            className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100/D0D0D0/808080?text=No+Image";
                            }}
                          />
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Product Name</Text>}
                      >
                        {currentRequest.productDetails?.new?.name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Category</Text>}>
                        {currentRequest.productDetails?.new?.category || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Storage Temp (°C)</Text>}
                      >
                        {currentRequest.productDetails?.new?.storageTemp ||
                          "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Density</Text>}>
                        {currentRequest.productDetails?.new?.density || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card
                    title={
                      <Title level={5} className="text-green-600 mb-0">
                        New Data
                      </Title>
                    }
                    className="shadow-sm border border-green-200 p-4 rounded-lg"
                  >
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      className="ant-descriptions-condensed"
                    >
                      <Descriptions.Item label={<Text strong>Image</Text>}>
                        {currentRequest.productDetails?.old?.image && (
                          <img
                            src={currentRequest.productDetails.old.image}
                            alt="Old Product Image"
                            className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100/D0D0D0/808080?text=No+Image";
                            }}
                          />
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Product Name</Text>}
                      >
                        {currentRequest.productDetails?.old?.name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Category</Text>}>
                        {currentRequest.productDetails?.old?.category || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Storage Temp (°C)</Text>}
                      >
                        {currentRequest.productDetails?.old?.storageTemp ||
                          "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Density</Text>}>
                        {currentRequest.productDetails?.old?.density || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ) : (
                // Trái: Old, Phải: New (bình thường)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    title={
                      <Title level={5} className="text-red-600 mb-0">
                        Old Data
                      </Title>
                    }
                    className="shadow-sm border border-red-200 p-4 rounded-lg"
                  >
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      className="ant-descriptions-condensed"
                    >
                      <Descriptions.Item label={<Text strong>Image</Text>}>
                        {currentRequest.productDetails?.old?.image && (
                          <img
                            src={currentRequest.productDetails.old.image}
                            alt="Old Product Image"
                            className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100/D0D0D0/808080?text=No+Image";
                            }}
                          />
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Product Name</Text>}
                      >
                        {currentRequest.productDetails?.old?.name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Category</Text>}>
                        {currentRequest.productDetails?.old?.category || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Storage Temp (°C)</Text>}
                      >
                        {currentRequest.productDetails?.old?.storageTemp ||
                          "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Density</Text>}>
                        {currentRequest.productDetails?.old?.density || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card
                    title={
                      <Title level={5} className="text-green-600 mb-0">
                        New Data
                      </Title>
                    }
                    className="shadow-sm border border-green-200 p-4 rounded-lg"
                  >
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      className="ant-descriptions-condensed"
                    >
                      <Descriptions.Item label={<Text strong>Image</Text>}>
                        {currentRequest.productDetails?.new?.image && (
                          <img
                            src={currentRequest.productDetails.new.image}
                            alt="New Product Image"
                            className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100/D0D0D0/808080?text=No+Image";
                            }}
                          />
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Product Name</Text>}
                      >
                        {currentRequest.productDetails?.new?.name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Category</Text>}>
                        {currentRequest.productDetails?.new?.category || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Storage Temp (°C)</Text>}
                      >
                        {currentRequest.productDetails?.new?.storageTemp ||
                          "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Density</Text>}>
                        {currentRequest.productDetails?.new?.density || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ))}

            {/* STATUS_CHANGE riêng nếu không có old/new */}
            {currentRequest.type === "STATUS_CHANGE" &&
              !currentRequest.productDetails?.old &&
              !currentRequest.productDetails?.new && (
                <Card
                  title={
                    <Title level={5} className="text-green-600 mb-0">
                      Data
                    </Title>
                  }
                  className="shadow-sm border border-green-200 p-4 rounded-lg"
                >
                  <Descriptions
                    column={1}
                    bordered
                    size="small"
                    className="ant-descriptions-condensed"
                  >
                    <Descriptions.Item label={<Text strong>Transition</Text>}>
                      <Space>
                        <Tag
                          color={
                            (currentRequest.status === "APPROVED"
                              ? currentRequest.productDetails?.newStatus
                              : currentRequest.productDetails?.oldStatus) ===
                            "ACTIVE"
                              ? "green"
                              : "red"
                          }
                        >
                          {(currentRequest.status === "APPROVED"
                            ? currentRequest.productDetails?.newStatus
                            : currentRequest.productDetails?.oldStatus
                          )?.toUpperCase() || "N/A"}
                        </Tag>
                        <ArrowRightOutlined style={{ color: "#999" }} />
                        <Tag
                          color={
                            (currentRequest.status === "APPROVED"
                              ? currentRequest.productDetails?.oldStatus
                              : currentRequest.productDetails?.newStatus) ===
                            "ACTIVE"
                              ? "green"
                              : "red"
                          }
                        >
                          {(currentRequest.status === "APPROVED"
                            ? currentRequest.productDetails?.oldStatus
                            : currentRequest.productDetails?.newStatus
                          )?.toUpperCase() || "N/A"}
                        </Tag>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

            {/* Rejection Reason */}
            {currentRequest.status === "REJECTED" &&
              currentRequest.rejectionReason && (
                <Card className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <Text strong className="text-red-700">
                    Rejection Reason:
                  </Text>{" "}
                  {currentRequest.rejectionReason}
                </Card>
              )}
          </div>
        </div>

        {/* Actions for Pending Requests */}
        {currentRequest?.status === "PENDING" && (
          <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
            <Popconfirm
              title="Approve Request?"
              description="Are you sure you want to approve this product request?"
              onConfirm={onApprove}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading}
                className="rounded-md"
              >
                Approve
              </Button>
            </Popconfirm>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={onShowRejectModal}
              className="rounded-md"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductRequestDetailsModal;
