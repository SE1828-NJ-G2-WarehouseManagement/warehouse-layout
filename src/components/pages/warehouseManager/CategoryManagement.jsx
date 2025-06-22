import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, Space, Typography, Tag,
  Tooltip, message, Popconfirm, Descriptions, Divider
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, FolderOpenOutlined, ArrowRightOutlined // Added ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// --- Placeholder Data ---
const initialCategoryRequests = [
  {
    id: 'cat-req-001',
    type: 'Create', // Request Type: Create, Update, Status Change
    submittedBy: 'Warehouse Staff D',
    dateSubmitted: '2025-06-21',
    status: 'Pending', // Request Status: Pending, Approved, Rejected
    categoryDetails: {
      name: 'New Electronics',
      // Removed parentCategory for 'Create' type requests as per user request
    },
    rejectionReason: '',
  },
  {
    id: 'cat-req-002',
    type: 'Update',
    submittedBy: 'Warehouse Staff E',
    dateSubmitted: '2025-06-20',
    status: 'Pending',
    categoryDetails: {
      old: {
        name: 'Home Appliances',
      },
      new: {
        name: 'Smart Home Appliances', // Category name changed
      }
    },
    rejectionReason: '',
  },
  {
    id: 'cat-req-003',
    type: 'Status Change',
    submittedBy: 'Warehouse Staff F',
    dateSubmitted: '2025-06-19',
    status: 'Pending',
    categoryDetails: {
      name: 'Construction Materials',
      oldStatus: 'Active',
      newStatus: 'Inactive'
    },
    rejectionReason: '',
  },
  {
    id: 'cat-req-004',
    type: 'Create',
    submittedBy: 'Warehouse Staff D',
    dateSubmitted: '2025-06-18',
    status: 'Approved',
    categoryDetails: {
      name: 'Hand Tools',
      // Removed parentCategory for 'Create' type requests as per user request
    },
    rejectionReason: '',
  },
  {
    id: 'cat-req-005',
    type: 'Update',
    submittedBy: 'Warehouse Staff E',
    dateSubmitted: '2025-06-17',
    status: 'Rejected',
    categoryDetails: {
      old: { name: 'Dry Foods' },
      new: { name: 'Dry Foods' }
    },
    rejectionReason: 'Update description too short and does not provide enough detail.',
  },
];

const CategoryManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [rejectionForm] = Form.useForm();

  // --- Fetch Data (Simulated API Call) ---
  useEffect(() => {
    setLoading(true);
    // Simulate API call to fetch pending requests
    setTimeout(() => {
      setRequests(initialCategoryRequests);
      setLoading(false);
    }, 500);
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = requests.filter(request =>
      request.id.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.type.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.submittedBy.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.status.toLowerCase().includes(lowerCaseSearchTerm) ||
      (request.categoryDetails.name && request.categoryDetails.name.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // --- Modal Handlers ---
  const showDetailsModal = (request) => {
    setCurrentRequest(request);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setCurrentRequest(null);
  };

  const showRejectModal = () => {
    rejectionForm.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleRejectModalCancel = () => {
    setIsRejectModalVisible(false);
    rejectionForm.resetFields();
  };

  const handleApproveRequest = async () => {
    if (!currentRequest) return;

    setLoading(true);
    try {
      // Simulate API call to approve request
      console.log(`Approving request: ${currentRequest.id}`);
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Approved' } : req
      ));
      message.success(`Category request ${currentRequest.id} approved successfully!`);
      handleDetailsModalCancel();
    } catch (error) {
      console.error('Failed to approve request:', error);
      message.error('Failed to approve request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (values) => {
    if (!currentRequest) return;

    setLoading(true);
    try {
      // Simulate API call to reject request
      console.log(`Rejecting request: ${currentRequest.id} with reason: ${values.reason}`);
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Rejected', rejectionReason: values.reason } : req
      ));
      message.success(`Category request ${currentRequest.id} rejected.`);
      handleRejectModalCancel();
      handleDetailsModalCancel(); // Close details modal after rejection
    } catch (error) {
      console.error('Failed to reject request:', error);
      message.error('Failed to reject request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Table Columns ---
  const columns = [
    {
      title: 'No.', // Serial Number
      key: 'serialNo',
      render: (text, record, index) => index + 1,
      width: '5%',
    },
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type) => {
        let color = 'blue';
        if (type === 'Update') color = 'orange';
        if (type === 'Status Change') color = 'purple';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: '20%',
    },
    {
      title: 'Date Submitted',
      dataIndex: 'dateSubmitted',
      key: 'dateSubmitted',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = 'default';
        if (status === 'Pending') color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'Pending' && (
            <Tooltip title="Review Request">
              <Button
                icon={<EyeOutlined />}
                onClick={() => showDetailsModal(record)}
                type="primary"
                className="rounded-md"
              >
                Review
              </Button>
            </Tooltip>
          )}
          {record.status !== 'Pending' && (
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined />}
                onClick={() => showDetailsModal(record)}
                className="rounded-md"
              >
                View
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
      <Title level={2} style={{ marginBottom: 30 }}><FolderOpenOutlined /> Category Approval</Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Search by Request ID, Type, Submitted By, or Status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
          />

          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            bordered
          />
        </Space>
      </Card>

      {/* Request Details Modal */}
      <Modal
        title={<Title level={4} className="text-center mb-6">Review Category Request</Title>}
        visible={isDetailsModalVisible}
        onCancel={handleDetailsModalCancel}
        footer={null} // Custom footer for actions
        destroyOnClose
        width={900} // Increased width for better layout of side-by-side data
        className="rounded-lg"
        centered // Center the modal
      >
        {currentRequest && (
          <div className="flex flex-col h-full"> {/* Use flexbox for layout */}
            <div className="p-4 bg-white rounded-lg flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}> {/* Scrollable content area */}
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

              {/* Category Details Section */}
              <Divider orientation="left" className="my-6">Category Information</Divider>
              <div className="mt-4">
                {currentRequest.type === 'Create' && (
                  <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                     <Title level={5} className="mb-4">New Category Details</Title>
                    <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                      <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.categoryDetails.name}</Descriptions.Item>
                      {/* Removed description and parentCategory for 'Create' as per user request */}
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
                        <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.categoryDetails.old?.name}</Descriptions.Item>
                        {/* Removed Description as per user request */}
                      </Descriptions>
                    </Card>
                    <Card
                      title={<Title level={5} className="text-green-600 mb-0">New Data</Title>}
                      className="shadow-sm border border-green-200 p-4 rounded-lg"
                    >
                      <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed">
                        <Descriptions.Item label={<Text strong>Name</Text>}>{currentRequest.categoryDetails.new?.name}</Descriptions.Item>
                        {/* Removed Description as per user request */}
                      </Descriptions>
                    </Card>
                  </div>
                )}
                {currentRequest.type === 'Status Change' && (
                  <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                    <Title level={5} className="mb-4">Status Change Details</Title>
                    <Descriptions column={1} bordered size="small" className="ant-descriptions-condensed"> {/* Changed to 1 column for clearer flow */}
                      <Descriptions.Item label={<Text strong>Category Name</Text>}>
                        {currentRequest.categoryDetails.name}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Transition</Text>}> {/* New label for transition */}
                        <Space>
                          <Tag color={currentRequest.categoryDetails.oldStatus === 'Active' ? 'green' : 'red'}>
                            {currentRequest.categoryDetails.oldStatus}
                          </Tag>
                          <ArrowRightOutlined style={{ color: '#999' }} /> {/* Arrow icon */}
                          <Tag color={currentRequest.categoryDetails.newStatus === 'Active' ? 'green' : 'red'}>
                            {currentRequest.categoryDetails.newStatus}
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
              <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200"> {/* Added padding, background, and top border for fixed footer look */}
                <Popconfirm
                  title="Approve Request?"
                  description="Are you sure you want to approve this category request?"
                  onConfirm={handleApproveRequest}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" icon={<CheckCircleOutlined />} loading={loading} className="rounded-md">
                    Approve
                  </Button>
                </Popconfirm>
                <Button danger icon={<CloseCircleOutlined />} onClick={showRejectModal} className="rounded-md">
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        title={<Title level={4} className="text-center mb-6">Enter Rejection Reason</Title>}
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        footer={null}
        destroyOnClose
        width={500}
        className="rounded-lg"
      >
        <Form
          form={rejectionForm}
          layout="vertical"
          name="rejection_reason_form"
          onFinish={handleRejectRequest}
        >
          <Form.Item
            label={<Text strong>Reason for Rejection</Text>}
            name="reason"
            rules={[
              { required: true, message: 'Please enter a reason for rejection.' },
              { min: 10, message: 'Reason must be at least 10 characters.' } // BR69
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter reason for rejecting this request (min 10 characters)" className="rounded-md" />
          </Form.Item>
          <Form.Item className="flex justify-end mt-4">
            <Space>
              <Button onClick={handleRejectModalCancel} className="rounded-md">Cancel</Button>
              <Button type="primary" danger htmlType="submit" loading={loading} className="rounded-md">
                Submit Rejection
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
