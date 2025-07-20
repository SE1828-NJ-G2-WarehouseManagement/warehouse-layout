import React from 'react';
import {
  Modal, Card, Button, Space, Typography, Tag,
  Descriptions, Divider, Popconfirm, Spin, Flex
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SupplierRequestDetailsModal = ({
  visible,
  currentRequest,
  onCancel,
  onApprove,
  onShowRejectModal,
  loading
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
        <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
          <Spin size="large" tip="Loading supplier details..." />
        </div>
      </Modal>
    );
  }

  if (!currentRequest) return null;

  const getStatusTag = (status) => {
    let color = 'default';
    if (status === 'PENDING') color = 'gold';
    if (status === 'APPROVED') color = 'green';
    if (status === 'REJECTED') color = 'red';
    if (status === 'ACTIVE') color = 'blue';
    if (status === 'INACTIVE') color = 'volcano';
    return <Tag color={color}>{status ? status?.toUpperCase() : 'N/A'}</Tag>;
  };

  const getRequestTypeTag = (type) => {
    let color = 'blue';
    if (type === 'UPDATE') color = 'orange';
    if (type === 'STATUS CHANGE') color = 'purple';
    if (type === 'CREATE') color = 'green';
    return <Tag color={color}>{type ? type.toUpperCase() : 'N/A'}</Tag>;
  };

  const createdByDisplayName = currentRequest.submittedBy;
  console.log("currentRequest", currentRequest)
  return (
    <Modal
      title={<Title level={4} className="text-center mb-6">Review Supplier Request</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={900}
      className="rounded-lg"
      centered
    >
      <div className="flex flex-col h-full">
        <div className="p-4 bg-white rounded-lg flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Card className="mb-6 shadow-sm border border-gray-100 p-6 rounded-lg">
            <Title level={5} className="mb-4">Request Details</Title>
            <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
              <Descriptions.Item label={<Text strong>Request ID</Text>}>{currentRequest?.id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label={<Text strong>Supplier Name</Text>}>
                {currentRequest.type === 'UPDATE' ?
                  currentRequest.supplierDetails.new.name :
                  currentRequest.supplierDetails.name}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Submitted By</Text>}>{createdByDisplayName}</Descriptions.Item>
              <Descriptions.Item label={<Text strong>Request Type</Text>}>
                {getRequestTypeTag(currentRequest.type)}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Date Submitted</Text>}>
                {dayjs(currentRequest.dateSubmitted).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Current Status</Text>} span={2}>
                {getStatusTag(currentRequest.status)}
              </Descriptions.Item>
              {currentRequest.status === 'REJECTED' && currentRequest.rejectionReason && (
                <Descriptions.Item label={<Text strong className="text-red-700">Rejection Reason</Text>} span={2}>
                  <Text type="danger">{currentRequest.rejectionReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Divider orientation="left" className="my-6">Supplier Information</Divider>
          <div className="mt-4">
            {currentRequest.type === 'CREATE' && currentRequest.supplierDetails && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">New Supplier Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.name}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.email}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.phone}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Address</Text>} span={2}>{currentRequest.supplierDetails.address}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Tax ID</Text>}>{currentRequest.supplierDetails.taxId}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {currentRequest.type === 'UPDATE' && currentRequest.supplierDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  title={<Title level={5} className="text-red-600 mb-0">Old Data</Title>}
                  className="shadow-sm border border-red-200 p-4 rounded-lg"
                >
                  <Descriptions labelStyle={{ width: 100 }} column={1} bordered size="small" className="ant-descriptions-condensed">
                    <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.old.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.old.email}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.old.phone}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Address</Text>}>{currentRequest.supplierDetails.old.address}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Tax ID</Text>}>{currentRequest.supplierDetails.old.taxId}</Descriptions.Item>
                  </Descriptions>
                </Card>
                <Card
                  title={<Title level={5} className="text-green-600 mb-0">New Data</Title>}
                  className="shadow-sm border border-green-200 p-4 rounded-lg"
                >
                  <Descriptions labelStyle={{ width: 100 }} column={1} bordered size="small" className="ant-descriptions-condensed">
                    <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.new.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.new.email}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.new.phone}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Address</Text>}>{currentRequest.supplierDetails.new.address}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Tax ID</Text>}>{currentRequest.supplierDetails.new.taxId}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>

            )}

            {currentRequest.type === 'STATUS_CHANGE' && currentRequest.supplierDetails && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">Status Change Details</Title>
                <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Supplier Name</Text>}>
                    {currentRequest.supplierDetails.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Transition</Text>}>
                    <Space>
                      <Tag color={currentRequest.supplierDetails?.oldStatus === 'ACTIVE' ? 'green' : 'red'}>
                        {currentRequest.supplierDetails?.oldStatus?.toUpperCase()}
                      </Tag>
                      <ArrowRightOutlined style={{ color: '#999' }} />
                      <Tag color={currentRequest.supplierDetails?.newStatus === 'ACTIVE' ? 'green' : 'red'}>
                        {currentRequest.supplierDetails?.newStatus?.toUpperCase()}
                      </Tag>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>

              </Card>
            )}

            {currentRequest.status === 'REJECTED' && currentRequest.rejectionReason && (
              <Card className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                <Title level={5} className="text-red-700 mb-2">Rejection Reason</Title>
                <Text className="text-red-800 text-base">{currentRequest.rejectionReason}</Text>
              </Card>
            )}
          </div>
        </div>

        {currentRequest.status === 'PENDING' && (
          <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
            <Popconfirm
              title="Approve Request?"
              description="Are you sure you want to approve this supplier request?"
              onConfirm={onApprove}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" icon={<CheckCircleOutlined />} loading={loading} className="rounded-md">
                Approve
              </Button>
            </Popconfirm>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => onShowRejectModal(currentRequest)} className="rounded-md">
              Reject
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SupplierRequestDetailsModal;
