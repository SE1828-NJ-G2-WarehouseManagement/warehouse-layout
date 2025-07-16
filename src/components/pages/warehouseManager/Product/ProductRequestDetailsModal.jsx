import React from 'react';
import {
  Modal, Card, Button, Space, Typography, Tag,
  Descriptions, Divider, Popconfirm, Spin
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProductRequestDetailsModal = ({
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
          <Spin size="large" tip="Loading product details..." />
        </div>
      </Modal>
    );
  }

  if (!currentRequest) return null;

  return (
    <Modal
      title={<Title level={4} className="text-center mb-6">Review Product Request</Title>}
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
          {/* Request Summary Section */}
          <Card className="mb-6 shadow-sm border border-gray-100 p-6 rounded-lg">
            <Title level={5} className="mb-4">Request Details</Title>
            <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
              <Descriptions.Item label={<Text strong>Request ID</Text>}>{currentRequest.id}</Descriptions.Item>
              <Descriptions.Item label={<Text strong>Submitted By</Text>}>{currentRequest.submittedBy}</Descriptions.Item>
              <Descriptions.Item label={<Text strong>Request Type</Text>}>
                <Tag color={
                  currentRequest.type === 'Create' ? 'blue' :
                  currentRequest.type === 'Update' ? 'orange' : 'purple'
                }>
                  {currentRequest.type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Date Submitted</Text>}>
                {dayjs(currentRequest.dateSubmitted).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Current Status</Text>} span={2}>
                <Tag color={
                  currentRequest.status === 'Pending' ? 'gold' :
                  currentRequest.status === 'Approved' ? 'green' : 'red'
                }>
                  {currentRequest.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Product Details Section */}
          <Divider orientation="left" className="my-6">Product Information</Divider>
          <div className="mt-4">
            {currentRequest.type === 'Create' && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">New Product Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Image</Text>} span={2}>
                    {currentRequest.productDetails.image && (
                      <img
                        src={currentRequest.productDetails.image}
                        alt="Product Image"
                        className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/D0D0D0/808080?text=No+Image"; }}
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Product Name</Text>}>{currentRequest.productDetails.name}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Category</Text>}>{currentRequest.productDetails.category}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Storage Temp (°C)</Text>}>{currentRequest.productDetails.storageTemp}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Density</Text>}>{currentRequest.productDetails.density}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
            {currentRequest.type === 'Update' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  title={<Title level={5} className="text-red-600 mb-0">Old Data</Title>}
                  className="shadow-sm border border-red-200 p-4 rounded-lg"
                >
                  <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                    <Descriptions.Item label={<Text strong>Image</Text>}>
                      {currentRequest.productDetails.old?.image && (
                        <img
                          src={currentRequest.productDetails.old.image}
                          alt="Old Product Image"
                          className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/D0D0D0/808080?text=No+Image"; }}
                        />
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Product Name</Text>}>{currentRequest.productDetails.old?.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Category</Text>}>{currentRequest.productDetails.old?.category || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Storage Temp (°C)</Text>}>{currentRequest.productDetails.old?.storageTemp || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Density</Text>}>{currentRequest.productDetails.old?.density || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </Card>
                <Card
                  title={<Title level={5} className="text-green-600 mb-0">New Data</Title>}
                  className="shadow-sm border border-green-200 p-4 rounded-lg"
                >
                  <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                    <Descriptions.Item label={<Text strong>Image</Text>}>
                      {currentRequest.productDetails.new?.image && (
                        <img
                          src={currentRequest.productDetails.new.image}
                          alt="New Product Image"
                          className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1"
                          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/D0D0D0/808080?text=No+Image"; }}
                        />
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Product Name</Text>}>{currentRequest.productDetails.new?.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Category</Text>}>{currentRequest.productDetails.new?.category || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Storage Temp (°C)</Text>}>{currentRequest.productDetails.new?.storageTemp || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Density</Text>}>{currentRequest.productDetails.new?.density || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
            {currentRequest.type === 'Status Change' && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">Status Change Details</Title>
                <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Product Name</Text>}>
                    {currentRequest.productDetails.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Transition</Text>}>
                    <Space>
                      <Tag color={currentRequest.productDetails.oldStatus === 'Available' ? 'green' : 'red'}>
                        {currentRequest.productDetails.oldStatus}
                      </Tag>
                      <ArrowRightOutlined style={{ color: '#999' }} />
                      <Tag color={currentRequest.productDetails.newStatus === 'Available' ? 'green' : 'red'}>
                        {currentRequest.productDetails.newStatus}
                      </Tag>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
            {currentRequest.status === 'Rejected' && currentRequest.rejectionReason && (
              <Card className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                <Text strong className="text-red-700">Rejection Reason:</Text> {currentRequest.rejectionReason}
              </Card>
            )}
          </div>
        </div>

        {/* Actions for Pending Requests */}
        {currentRequest.status === 'Pending' && (
          <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
            <Popconfirm
              title="Approve Request?"
              description="Are you sure you want to approve this product request?"
              onConfirm={onApprove}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" icon={<CheckCircleOutlined />} loading={loading} className="rounded-md">
                Approve
              </Button>
            </Popconfirm>
            <Button danger icon={<CloseCircleOutlined />} onClick={onShowRejectModal} className="rounded-md">
              Reject
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductRequestDetailsModal;