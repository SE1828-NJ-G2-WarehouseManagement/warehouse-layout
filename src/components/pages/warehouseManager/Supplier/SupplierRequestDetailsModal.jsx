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

  const createdByDisplayName = currentRequest.submittedBy; 

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
              {/* <Descriptions.Item label={<Text strong>Request ID</Text>}>{currentRequest?.id}</Descriptions.Item> */}
              <Descriptions.Item label={<Text strong>Supplier Name</Text>}>{currentRequest.supplierDetails.name}</Descriptions.Item>
              <Descriptions.Item label={<Text strong>Submitted By</Text>}>{createdByDisplayName}</Descriptions.Item>
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
                  currentRequest.status === 'PENDING' ? 'gold' :
                  currentRequest.status === 'APPROVED' ? 'green' : 'red'
                }>
                  {currentRequest.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider orientation="left" className="my-6">Supplier Information</Divider>
          <div className="mt-4">
            {currentRequest.type === 'Create' && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">New Supplier Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.name}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Tax ID</Text>}>{currentRequest.supplierDetails.taxId}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.email}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.phone}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Address</Text>} span={2}>{currentRequest.supplierDetails.address}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
            {(currentRequest.type === 'Update' || currentRequest.type === 'Status Change') && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">Supplier Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.name}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Tax ID</Text>}>{currentRequest.supplierDetails.taxId}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Contact Person</Text>}>{currentRequest.supplierDetails.contactPerson || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.email}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.phone}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Address</Text>} span={2}>{currentRequest.supplierDetails.address}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Products</Text>} span={2}>{currentRequest.supplierDetails.products?.join(', ') || 'N/A'}</Descriptions.Item>
                  {currentRequest.type === 'Status Change' && (
                    <>
                      <Descriptions.Item label={<Text strong>Old Status</Text>}>
                          <Tag color={currentRequest.supplierDetails.previousStatus === 'ACTIVE' ? 'green' : 'red'}> {/* Sử dụng previousStatus từ API, nếu có */}
                            {currentRequest.supplierDetails.previousStatus || 'N/A'}
                          </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>New Status</Text>}>
                          <Tag color={currentRequest.supplierDetails.action === 'ACTIVE' ? 'green' : 'red'}> {/* Sử dụng action từ API, nếu có */}
                            {currentRequest.supplierDetails.action || 'N/A'}
                          </Tag>
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
                {currentRequest.status === 'Rejected' && currentRequest.rejectionReason && (
                  <Card className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                    <Text strong className="text-red-700">Rejection Reason:</Text> {currentRequest.rejectionReason}
                  </Card>
                )}
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
            <Button danger icon={<CloseCircleOutlined />} onClick={onShowRejectModal} className="rounded-md">
              Reject
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SupplierRequestDetailsModal;