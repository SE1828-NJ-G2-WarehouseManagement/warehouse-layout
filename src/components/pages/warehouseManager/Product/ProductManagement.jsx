import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Space, Typography, Tag,
  Tooltip, message, Select, Pagination,
  Form
} from 'antd';
import {
  EyeOutlined, SearchOutlined, BoxPlotOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import các component con đã tách
import ProductRequestDetailsModal from './ProductRequestDetailsModal.jsx';
import ProductRejectionReasonModal from './ProductRejectionReasonModal.jsx';

const { Title } = Typography;
const { Option } = Select;

// --- Mock Data (giữ nguyên trong file chính) ---
const initialProductRequests = [
  {
    id: 'prod-req-001',
    type: 'Create', // Request Type: Create, Update, Status Change
    submittedBy: 'Warehouse Staff X',
    dateSubmitted: '2025-06-22',
    status: 'Pending', // Request Status: Pending, Approved, Rejected
    productDetails: {
      image: 'https://placehold.co/100x100/A2D9CE/000?text=Product+Img+1',
      name: 'Smart Watch Pro',
      category: 'Electronics',
      storageTemp: '5-25',
      density: '1.2 g/cm³',
    },
    rejectionReason: '',
  },
  {
    id: 'prod-req-002',
    type: 'Update',
    submittedBy: 'Warehouse Staff Y',
    dateSubmitted: '2025-06-21',
    status: 'Pending',
    productDetails: {
      old: {
        image: 'https://placehold.co/100x100/FAD02E/000?text=Old+Img',
        name: 'Organic Coffee Beans',
        category: 'Food & Beverage',
        storageTemp: '10-20',
        density: '0.4 g/cm³',
      },
      new: {
        image: 'https://placehold.co/100x100/98C1D9/000?text=New+Img',
        name: 'Organic Coffee Beans (New Harvest)',
        category: 'Food & Beverage',
        storageTemp: '10-20',
        density: '0.45 g/cm³',
      }
    },
    rejectionReason: '',
  },
  {
    id: 'prod-req-003',
    type: 'Status Change',
    submittedBy: 'Warehouse Staff Z',
    dateSubmitted: '2025-06-20',
    status: 'Pending',
    productDetails: {
      name: 'Ergonomic Office Chair',
      oldStatus: 'Available',
      newStatus: 'Discontinued'
    },
    rejectionReason: '',
  },
  {
    id: 'prod-req-004',
    type: 'Create',
    submittedBy: 'Warehouse Staff X',
    dateSubmitted: '2025-06-19',
    status: 'Approved',
    productDetails: {
      image: 'https://placehold.co/100x100/D0A2ED/000?text=Product+Img+4',
      name: 'Bluetooth Headphones',
      category: 'Audio',
      storageTemp: '0-40',
      density: '0.1 kg/m³',
    },
    rejectionReason: '',
  },
  {
    id: 'prod-req-005',
    type: 'Update',
    submittedBy: 'Warehouse Staff Y',
    dateSubmitted: '2025-06-18',
    status: 'Rejected',
    productDetails: {
      old: {
        image: 'https://placehold.co/100x100/FFD700/000?text=BottleOld',
        name: 'Stainless Steel Water Bottle',
        category: 'Kitchenware',
        storageTemp: 'ambient',
        density: '0.8 g/cm³'
      },
      new: {
        image: 'https://placehold.co/100x100/FFD700/000?text=BottleNew',
        name: 'Stainless Steel Water Bottle',
        category: 'Kitchenware',
        storageTemp: 'ambient',
        density: '0.8 g/cm³'
      }
    },
    rejectionReason: 'Stock update to zero without proper justification for discontinuation.',
  },
];

const ProductManagement = () => {
  const [requests, setRequests] = useState([]); // All requests, for filtering/sorting
  const [filteredRequests, setFilteredRequests] = useState([]); // Requests after filter/sort applied
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // For overall table loading
  const [actionLoading, setActionLoading] = useState(false); // For approve/reject actions
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentDisplayRequest, setCurrentDisplayRequest] = useState(null);
  const [rejectionForm] = Form.useForm();

  // Pagination state (client-side for mock data)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // --- Fetch Data (Simulated API Call) ---
  useEffect(() => {
    setLoading(true);
    // Simulate API call to fetch product requests
    setTimeout(() => {
      setRequests(initialProductRequests); // Set all initial data
      setTotalItems(initialProductRequests.length);
      setLoading(false);
    }, 500);
  }, []); // Run once on component mount

  // Helper function to get the display type
  const getProductRequestDisplayType = useCallback((request) => {
    // In a real API, `request.type` would likely be directly provided.
    // For mock data, we infer it.
    if (request.type) {
        return request.type;
    }
    // Fallback for mock data if `type` isn't explicit
    if (request.productDetails && (request.productDetails.oldStatus || request.productDetails.newStatus)) {
        return 'Status Change';
    }
    if (request.productDetails && (request.productDetails.old && request.productDetails.new)) {
        return 'Update';
    }
    return 'Create'; // Default
  }, []);

  // --- Filtering and Sorting Logic ---
  const applyFiltersAndSort = useCallback(() => {
    let currentProcessedRequests = [...requests]; // Start with all requests

    // Apply Search Term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProcessedRequests = currentProcessedRequests.filter(request =>
        request.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        getProductRequestDisplayType(request).toLowerCase().includes(lowerCaseSearchTerm) ||
        request.submittedBy.toLowerCase().includes(lowerCaseSearchTerm) ||
        request.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        (request.productDetails.name && request.productDetails.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.productDetails.category && request.productDetails.category.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // Apply Status Filter
    if (selectedStatusFilter !== 'All') {
      currentProcessedRequests = currentProcessedRequests.filter(request =>
        request.status.toUpperCase() === selectedStatusFilter.toUpperCase()
      );
    }

    // Apply Type Filter
    if (selectedTypeFilter !== 'All') {
      currentProcessedRequests = currentProcessedRequests.filter(request => {
        const type = getProductRequestDisplayType(request);
        return type.toUpperCase() === selectedTypeFilter.toUpperCase();
      });
    }

    // Sorting Logic: PENDING first, then APPROVED, then REJECTED.
    // Within each group, sort by dateSubmitted (most recent first).
    currentProcessedRequests.sort((a, b) => {
        const statusOrder = { 'PENDING': 1, 'APPROVED': 2, 'REJECTED': 3 };
        const statusA = statusOrder[a.status.toUpperCase()] || 99; // Default high priority for unknown statuses
        const statusB = statusOrder[b.status.toUpperCase()] || 99;

        if (statusA !== statusB) {
            return statusA - statusB; // Sort by status priority
        }
        // If statuses are the same, sort by dateSubmitted descending
        return dayjs(b.dateSubmitted).diff(dayjs(a.dateSubmitted));
    });

    setTotalItems(currentProcessedRequests.length); // Update total items for pagination after filters/sort

    // Apply Pagination (client-side for mock data)
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = currentProcessedRequests.slice(startIndex, endIndex);

    setFilteredRequests(paginatedData);
  }, [
    requests, // Dependency on raw data
    searchTerm,
    selectedStatusFilter,
    selectedTypeFilter,
    currentPage, // Dependency for pagination
    pageSize, // Dependency for pagination
    getProductRequestDisplayType // Helper function dependency
  ]);

  // Re-apply filters and sort whenever relevant state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [
    requests,
    searchTerm,
    selectedStatusFilter,
    selectedTypeFilter,
    currentPage,
    pageSize,
    applyFiltersAndSort
  ]);

  // --- Modal Handlers ---
  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setCurrentDisplayRequest(null);
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
    if (!currentDisplayRequest) return;

    setActionLoading(true);
    try {
      // Simulate API call to approve request
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setRequests(prev => { // Update the main 'requests' state
        const updated = prev.map(req =>
          req.id === currentDisplayRequest.id ? { ...req, status: 'Approved' } : req
        );
        return updated;
      });
      message.success(`Product request ${currentDisplayRequest.id} approved successfully!`);
      handleDetailsModalCancel();
      // Re-trigger filtering and sorting via useEffect after state update
    } catch (error) {
      console.error('Failed to approve request:', error);
      message.error('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (values) => {
    if (!currentDisplayRequest) return;

    setActionLoading(true);
    try {
      // Simulate API call to reject request
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setRequests(prev => { // Update the main 'requests' state
        const updated = prev.map(req =>
          req.id === currentDisplayRequest.id ? { ...req, status: 'Rejected', rejectionReason: values.reason } : req
        );
        return updated;
      });
      message.success(`Product request ${currentDisplayRequest.id} rejected.`);
      handleRejectModalCancel();
      handleDetailsModalCancel(); // Close details modal after rejection
      // Re-trigger filtering and sorting via useEffect after state update
    } catch (error) {
      console.error('Failed to reject request:', error);
      message.error('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Table Columns ---
  const columns = [
    {
      title: 'No.', // Serial Number
      key: 'serialNo',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
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
      dataIndex: 'type', // This will now directly use the `type` property from mock data
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
                onClick={() => { setCurrentDisplayRequest(record); setIsDetailsModalVisible(true); }}
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
                onClick={() => { setCurrentDisplayRequest(record); setIsDetailsModalVisible(true); }}
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
      <Title level={2} style={{ marginBottom: 30 }}><BoxPlotOutlined /> Product Approval</Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search by Request ID, Type, Submitted By, Status, Product Name or Category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 400 }}
              prefix={<SearchOutlined />}
              className="rounded-md"
            />
            <Select
              defaultValue="All"
              style={{ width: 150 }}
              onChange={setSelectedStatusFilter}
              className="rounded-md"
              placeholder="Filter by Status"
              value={selectedStatusFilter}
            >
              <Option value="All">All Statuses</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <Select
              defaultValue="All"
              style={{ width: 180 }}
              onChange={setSelectedTypeFilter}
              className="rounded-md"
              placeholder="Filter by Type"
              value={selectedTypeFilter}
            >
              <Option value="All">All Types</Option>
              <Option value="Create">Create</Option>
              <Option value="Update">Update</Option>
              <Option value="Status Change">Status Change</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            loading={loading || actionLoading}
            pagination={false} // Tắt pagination mặc định của Ant Design
            bordered
          />
          {/* Custom Pagination */}
          <Pagination
            current={currentPage}
            onChange={(page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize); // if showSizeChanger is true
            }}
            pageSize={pageSize}
            total={totalItems}
            align="end"
            showSizeChanger={false} // Optionally allow changing page size
          />
        </Space>
      </Card>

      {/* Request Details Modal */}
      <ProductRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentDisplayRequest}
        onCancel={handleDetailsModalCancel}
        onApprove={handleApproveRequest}
        onShowRejectModal={showRejectModal}
        loading={actionLoading}
      />

      {/* Rejection Reason Modal */}
      <ProductRejectionReasonModal
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        onSubmit={handleRejectRequest}
        loading={actionLoading}
        form={rejectionForm}
      />
    </div>
  );
};

export default ProductManagement;