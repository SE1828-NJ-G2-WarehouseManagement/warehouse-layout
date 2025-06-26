import React from 'react';
import {
  Modal, Card, Button, Space, Typography, Tag,
  Descriptions, Divider, Popconfirm
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
  if (!currentRequest) return null; // Đảm bảo currentRequest tồn tại trước khi render

  return (
    <Modal
      title={<Title level={4} className="text-center mb-6">Review Supplier Request</Title>}
      open={visible} // Sử dụng 'open' thay vì 'visible' cho Ant Design v5+
      onCancel={onCancel}
      footer={null} // Custom footer cho các nút hành động
      destroyOnClose
      width={900} // Tăng chiều rộng để hiển thị dữ liệu tốt hơn
      className="rounded-lg"
      centered // Căn giữa modal trên màn hình
    >
      {/* Container chính sử dụng flexbox */}
      <div className="flex flex-col h-full">
        {/* Khu vực nội dung có thể cuộn */}
        <div className="p-4 bg-white rounded-lg flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          {/* Phần Tóm tắt Yêu cầu */}
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

          {/* Phần Chi tiết Nhà cung cấp */}
          <Divider orientation="left" className="my-6">Supplier Information</Divider>
          <div className="mt-4">
            {currentRequest.type === 'Create' && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">New Supplier Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.name}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Contact Person</Text>}>{currentRequest.supplierDetails.contactPerson}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.email}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.phone}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Address</Text>} span={2}>{currentRequest.supplierDetails.address}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Products</Text>} span={2}>{currentRequest.supplierDetails.products?.join(', ')}</Descriptions.Item>
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
                    <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.old?.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Contact Person</Text>}>{currentRequest.supplierDetails.old?.contactPerson || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.old?.email || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.old?.phone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Address</Text>}>{currentRequest.supplierDetails.old?.address || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Products</Text>}>{currentRequest.supplierDetails.old?.products?.join(', ') || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </Card>
                <Card
                  title={<Title level={5} className="text-green-600 mb-0">New Data</Title>}
                  className="shadow-sm border border-green-200 p-4 rounded-lg"
                >
                  <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                    <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.supplierDetails.new?.name}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Contact Person</Text>}>{currentRequest.supplierDetails.new?.contactPerson || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Email</Text>}>{currentRequest.supplierDetails.new?.email || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Phone</Text>}>{currentRequest.supplierDetails.new?.phone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Address</Text>}>{currentRequest.supplierDetails.new?.address || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Products</Text>}>{currentRequest.supplierDetails.new?.products?.join(', ') || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
            {currentRequest.type === 'Status Change' && (
              <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">Status Change Details</Title>
                <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Supplier Name</Text>}>
                    {currentRequest.supplierDetails.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Transition</Text>}>
                    <Space>
                      <Tag color={currentRequest.supplierDetails.oldStatus === 'Active' ? 'green' : 'red'}>
                        {currentRequest.supplierDetails.oldStatus}
                      </Tag>
                      <ArrowRightOutlined style={{ color: '#999' }} />
                      <Tag color={currentRequest.supplierDetails.newStatus === 'Active' ? 'green' : 'red'}>
                        {currentRequest.supplierDetails.newStatus}
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

        {/* Các nút hành động cho Yêu cầu đang Chờ xử lý */}
        {currentRequest.status === 'Pending' && (
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