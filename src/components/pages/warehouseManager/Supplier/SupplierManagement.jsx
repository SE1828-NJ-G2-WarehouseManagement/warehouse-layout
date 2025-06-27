import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Form, Input, Space, Typography, Tag,
  Tooltip, message, Popconfirm, Select
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, AuditOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import SupplierRequestDetailsModal from './SupplierRequestDetailsModal.jsx'; 
import SupplierRejectionReasonModal from './SupplierRejectionReasonModal.jsx'; 

const { Title, Text } = Typography;
const { Option } = Select; 

const initialSupplierRequests = [
  {
    id: 'req-001',
    type: 'Create',
    submittedBy: 'Warehouse Staff A',
    dateSubmitted: '2025-06-20',
    status: 'Pending',
    supplierDetails: {
      name: 'New Foods Inc.',
      contactPerson: 'Alice Smith',
      email: 'alice@newfoods.com',
      phone: '123-456-7890',
      address: '123 Food St, Culinary City',
      products: ['Organic Vegetables', 'Fresh Fruits']
    },
    rejectionReason: '',
  },
  {
    id: 'req-002',
    type: 'Update',
    submittedBy: 'Warehouse Staff B',
    dateSubmitted: '2025-06-19',
    status: 'Pending',
    supplierDetails: {
      old: {
        name: 'Global Supply Co.',
        contactPerson: 'Bob Johnson',
        email: 'bob@globalsupply.com',
        phone: '987-654-3210',
        address: '456 Supply Rd, Logistics Town',
        products: ['Packaging Materials']
      },
      new: {
        name: 'Global Supply Co.',
        contactPerson: 'Bob Johnson',
        email: 'bob.j@globalsupply.com',
        phone: '987-654-3210',
        address: '456 Supply Rd, Logistics Town, Unit A',
        products: ['Packaging Materials', 'Cleaning Supplies']
      }
    },
    rejectionReason: '',
  },
  {
    id: 'req-003',
    type: 'Status Change',
    submittedBy: 'Warehouse Staff C',
    dateSubmitted: '2025-06-18',
    status: 'Pending',
    supplierDetails: {
      name: 'Eco-Friendly Packing',
      oldStatus: 'Active',
      newStatus: 'Inactive'
    },
    rejectionReason: '',
  },
  {
    id: 'req-004',
    type: 'Create',
    submittedBy: 'Warehouse Staff A',
    dateSubmitted: '2025-06-17',
    status: 'Approved',
    supplierDetails: {
      name: 'Local Farm Produce',
      contactPerson: 'Charlie Brown',
      email: 'charlie@localfarm.com',
      phone: '111-222-3333',
      address: '789 Farm Lane, Green Valley',
      products: ['Seasonal Fruits']
    },
    rejectionReason: '',
  },
  {
    id: 'req-005',
    type: 'Update',
    submittedBy: 'Warehouse Staff B',
    dateSubmitted: '2025-06-16',
    status: 'Rejected',
    supplierDetails: {
      old: { name: 'Tech Gadgets Ltd.' },
      new: { name: 'Tech Gadgets Ltd.', contactPerson: 'David Lee' }
    },
    rejectionReason: 'Contact person update insufficient without full contact details.',
  },
];

const SupplierManagement = () => {
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
      setRequests(initialSupplierRequests);
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
      (request.supplierDetails.name && request.supplierDetails.name.toLowerCase().includes(lowerCaseSearchTerm))
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
    rejectionForm.resetFields(); // Reset form khi mở modal từ chối
    setIsRejectModalVisible(true);
  };

  const handleRejectModalCancel = () => {
    setIsRejectModalVisible(false);
    rejectionForm.resetFields(); // Reset form khi đóng modal từ chối
  };

  const handleApproveRequest = async () => {
    if (!currentRequest) return;

    setLoading(true);
    try {
      console.log(`Approving request: ${currentRequest.id}`);
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Approved' } : req
      ));
      message.success(`Supplier request ${currentRequest.id} approved successfully!`);
      handleDetailsModalCancel(); // Đóng modal chi tiết sau khi duyệt
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
      message.success(`Supplier request ${currentRequest.id} rejected.`);
      handleRejectModalCancel(); // Đóng modal từ chối
      handleDetailsModalCancel(); // Đóng modal chi tiết sau khi từ chối
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

      {/* Supplier Request Details Modal */}
      <SupplierRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentRequest}
        onCancel={handleDetailsModalCancel}
        onApprove={handleApproveRequest}
        onShowRejectModal={showRejectModal}
        loading={loading}
      />

      {/* Supplier Rejection Reason Modal */}
      <SupplierRejectionReasonModal
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        onSubmit={handleRejectRequest}
        loading={loading}
        form={rejectionForm}
      />
    </div>
  );
};

export default SupplierManagement;