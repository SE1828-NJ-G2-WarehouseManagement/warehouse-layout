import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Form, Input, Space, Typography, Tag,
  Tooltip, message, Popconfirm, Descriptions, Divider
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, FolderOpenOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import CategoryRequestDetailsModal from './CategoryRequestDetailsModal.jsx'; 
import CategoryRejectionReasonModal from './CategoryRejectionReasonModal.jsx'; 

const { Title, Text } = Typography;

// --- Placeholder Data ---
const initialCategoryRequests = [
  {
    id: 'cat-req-001',
    type: 'Create',
    submittedBy: 'Warehouse Staff D',
    dateSubmitted: '2025-06-21',
    status: 'Pending',
    categoryDetails: {
      name: 'New Electronics',
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
        name: 'Smart Home Appliances',
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
      console.log(`Rejecting request: ${currentRequest.id} with reason: ${values.reason}`);
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Rejected', rejectionReason: values.reason } : req
      ));
      message.success(`Category request ${currentRequest.id} rejected.`);
      handleRejectModalCancel();
      handleDetailsModalCancel();
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
      title: 'No.',
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
      <CategoryRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentRequest}
        onCancel={handleDetailsModalCancel}
        onApprove={handleApproveRequest}
        onShowRejectModal={showRejectModal}
        loading={loading}
      />

      {/* Rejection Reason Modal */}
      <CategoryRejectionReasonModal
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        onSubmit={handleRejectRequest}
        loading={loading}
        form={rejectionForm}
      />
    </div>
  );
};

export default CategoryManagement;