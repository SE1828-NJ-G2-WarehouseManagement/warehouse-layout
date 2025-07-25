import React, { useEffect, useState } from 'react';
import {
  Modal, Card, Button, Space, Typography, Tag,
  Descriptions, Divider, Popconfirm, Spin, message
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useCategory } from '../../../../hooks/useCategory';
import { useAuth } from '../../../../hooks/useAuth';

const { Title, Text } = Typography;

const CategoryRequestDetailsModal = ({
  visible,
  currentRequest,
  onCancel,
  onApprove,
  onShowRejectModal,
  loadingApprove
}) => {
  const { fetchCategoryById, approvalCategory, loading } = useCategory();
  const { user } = useAuth();
  const [detailedCategory, setDetailedCategory] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (visible && currentRequest?._id) {
        setModalLoading(true);
        try {
          const details = await fetchCategoryById(currentRequest._id);
          setDetailedCategory(details || null);
        } catch (error) {
          console.error("Error fetch category:", error);
          message.error("Failed to load category details.");
          setDetailedCategory(null);
        } finally {
          setModalLoading(false);
        }
      } else {
        setDetailedCategory(null);
      }
    };

    fetchDetails();
  }, [visible, currentRequest?._id, fetchCategoryById]);

  const handleApproveClick = async () => {
    if (!detailedCategory?._id) {
      message.error("No category ID available for approval.");
      return;
    }
    if (!user?._id) {
      message.error("User ID not found. Please log in again.");
      return;
    }

    try {
      await approvalCategory(detailedCategory._id, user._id);
      onApprove();
    } catch (error) {
      console.log("Error approving category:", error);
    }
  };

  const handleRejectClick = () => {
    if (detailedCategory) {
      onShowRejectModal(detailedCategory);
    } else {
      message.error("No category details available for rejection.");
    }
  };

  if (modalLoading || !detailedCategory) {
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
        <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
          <Spin size="large" tip="Loading category details..." />
        </div>
      </Modal>
    );
  }

  const displayRequest = detailedCategory;

  const requestType = displayRequest.requestType;

  let oldData = {};
  let newData = {};
  let oldStatus = 'N/A';
  let newStatus = 'N/A';

  if (requestType === 'UPDATE') {
    oldData = {
      name: displayRequest.name || 'N/A',
    };
    newData = {
      name: displayRequest.pendingChanges?.name || 'N/A',
    };
  } else if (requestType === 'STATUS_CHANGE') {
    oldStatus = displayRequest.action || 'N/A';
    newStatus = displayRequest.pendingChanges?.action || 'N/A';
    newData = {
      name: displayRequest.name || 'N/A',
    };
  } else if (requestType === 'CREATE') {
    newData = {
      name: displayRequest.name || 'N/A',
    };
  }

  const submittedByFullName = displayRequest.createdBy ? `${displayRequest.createdBy.firstName || ''} ${displayRequest.createdBy.lastName || ''}`.trim() : 'N/A';

  return (
    <Modal
      title={
        <Title level={4} className="text-center mb-6">
          Review Category Request
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
              <Descriptions.Item label={<Text strong>Request ID</Text>}>
                {displayRequest._id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Submitted By</Text>}>
                {submittedByFullName}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Request Type</Text>}>
                <Tag
                  color={
                    requestType === "CREATE"
                      ? "blue"
                      : requestType === "UPDATE"
                      ? "orange"
                      : requestType === "STATUS_CHANGE"
                      ? "purple"
                      : "default"
                  }
                >
                  {requestType?.toUpperCase() || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Date Submitted</Text>}>
                {displayRequest.createdAt
                  ? dayjs(displayRequest.createdAt).format("DD/MM/YYYY")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Current Status</Text>}
                span={2}
              >
                <Tag
                  color={
                    displayRequest.status === "PENDING"
                      ? "gold"
                      : displayRequest.status === "APPROVED"
                      ? "green"
                      : displayRequest.status === "REJECTED"
                      ? "red"
                      : "default"
                  }
                >
                  {displayRequest.status?.toUpperCase() || "N/A"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Category Information Section based on Request Type */}
          <Divider orientation="left" className="my-6">
            Category Information
          </Divider>
          <div className="mt-4">
            {requestType === "CREATE" && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">
                  New Category Details
                </Title>
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="ant-descriptions-condensed"
                >
                  <Descriptions.Item label={<Text strong>Category Name</Text>}>
                    {newData.name}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
            {requestType === "UPDATE" ? (
              displayRequest.status === "APPROVED" ? (
                // APPROVED + UPDATE: Trái New, phải Old
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
                      <Descriptions.Item
                        label={<Text strong>Category Name</Text>}
                      >
                        {newData.name}
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
                      <Descriptions.Item
                        label={<Text strong>Category Name</Text>}
                      >
                        {oldData.name}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ) : (
                // PENDING/REJECTED + UPDATE: Trái Old, phải New
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
                      <Descriptions.Item
                        label={<Text strong>Category Name</Text>}
                      >
                        {oldData.name}
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
                      <Descriptions.Item
                        label={<Text strong>Category Name</Text>}
                      >
                        {newData.name}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              )
            ) : requestType === "STATUS_CHANGE" ? (
              // STATUS_CHANGE: chỉ hiện New Data với Transition
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
                  <Descriptions.Item label={<Text strong>Category Name</Text>}>
                    {newData.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Transition</Text>}>
                    <Space>
                      <Tag color={oldStatus === "ACTIVE" ? "green" : "red"}>
                        {oldStatus.toUpperCase()}
                      </Tag>
                      <ArrowRightOutlined style={{ color: "#999" }} />
                      <Tag color={newStatus === "ACTIVE" ? "green" : "red"}>
                        {newStatus.toUpperCase()}
                      </Tag>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : null}

            {/* Rejection Reason */}
            {displayRequest.status === "REJECTED" &&
              displayRequest.rejectedNote && (
                <Card className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                  <Title level={5} className="text-red-700 mb-2">
                    Rejection Reason
                  </Title>
                  <Text className="text-red-800 text-base">
                    {displayRequest.rejectedNote}
                  </Text>
                </Card>
              )}
          </div>
        </div>

        {/* Actions for Pending Requests */}
        {displayRequest.status === "PENDING" && (
          <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
            <Popconfirm
              title="Approve Request?"
              description="Are you sure you want to approve this category request?"
              onConfirm={handleApproveClick}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading || loadingApprove}
                className="rounded-md"
              >
                Approve
              </Button>
            </Popconfirm>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleRejectClick}
              className="rounded-md"
            >
              Reject
            </Button>
          </div>
        )}
        {displayRequest.status !== "PENDING" && (
          <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
            <Button onClick={onCancel} className="rounded-md">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CategoryRequestDetailsModal;