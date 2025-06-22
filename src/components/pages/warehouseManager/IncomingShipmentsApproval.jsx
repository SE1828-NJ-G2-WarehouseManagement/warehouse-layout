import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, Space, Typography, Tag,
  Tooltip, message, Popconfirm, Descriptions, Divider
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, InboxOutlined, ArrowRightOutlined // InboxOutlined for shipments
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// --- Mock Data ---
const initialShipmentRequests = [
  {
    id: 'ship-req-001',
    submittedBy: 'Warehouse Staff A',
    dateSubmitted: '2025-06-21',
    status: 'Pending', // Request Status: Pending, Approved, Rejected
    shipmentDetails: {
      supplierName: 'Global Logistics Inc.',
      trackingNumber: 'GLI-TRK-78901',
      expectedDeliveryDate: '2025-06-25',
      items: [
        { productName: 'Smart Watch Pro', quantity: 50, unit: 'pcs' },
        { productName: 'Bluetooth Headphones', quantity: 100, unit: 'pcs' },
        { productName: 'USB-C Cables', quantity: 200, unit: 'pcs' },
        { productName: 'Portable Chargers', quantity: 75, unit: 'pcs' },
        { productName: 'Gaming Mouse', quantity: 30, unit: 'pcs' },
      ],
    },
    rejectionReason: '',
  },
  {
    id: 'ship-req-002',
    submittedBy: 'Warehouse Staff B',
    dateSubmitted: '2025-06-20',
    status: 'Pending',
    shipmentDetails: {
      supplierName: 'Farm Fresh Produce',
      trackingNumber: 'FFP-TRK-12345',
      expectedDeliveryDate: '2025-06-23',
      items: [
        { productName: 'Organic Apples', quantity: 200, unit: 'kg' },
        { productName: 'Fresh Oranges', quantity: 150, unit: 'kg' },
        { productName: 'Bananas', quantity: 100, unit: 'kg' },
        { productName: 'Grapes', quantity: 50, unit: 'kg' },
        { productName: 'Potatoes', quantity: 300, unit: 'kg' },
      ],
    },
    rejectionReason: '',
  },
  {
    id: 'ship-req-003',
    submittedBy: 'Warehouse Staff C',
    dateSubmitted: '2025-06-19',
    status: 'Approved', // Example of an already approved one
    shipmentDetails: {
      supplierName: 'Packaging Solutions Ltd.',
      trackingNumber: 'PSL-TRK-67890',
      expectedDeliveryDate: '2025-06-22',
      items: [
        { productName: 'Cardboard Boxes (Small)', quantity: 500, unit: 'pcs' },
        { productName: 'Bubble Wrap Rolls', quantity: 50, unit: 'rolls' },
      ],
    },
    rejectionReason: '',
  },
  {
    id: 'ship-req-004',
    submittedBy: 'Warehouse Staff A',
    dateSubmitted: '2025-06-18',
    status: 'Rejected', // Example of an already rejected one
    shipmentDetails: {
      supplierName: 'ElectroParts Co.',
      trackingNumber: 'EPC-TRK-54321',
      expectedDeliveryDate: '2025-06-21',
      items: [
        { productName: 'Circuit Boards - Model X', quantity: 50, unit: 'pcs' },
      ],
    },
    rejectionReason: 'Missing critical safety certifications for imported components.',
  },
  {
    id: 'ship-req-005',
    submittedBy: 'Warehouse Staff D',
    dateSubmitted: '2025-06-17',
    status: 'Pending',
    shipmentDetails: {
      supplierName: 'Office Supplies Inc.',
      trackingNumber: 'OSI-TRK-98765',
      expectedDeliveryDate: '2025-06-24',
      items: [
        { productName: 'A4 Printer Paper', quantity: 20, unit: 'reams' },
        { productName: 'Gel Pens (Blue)', quantity: 100, unit: 'pcs' },
        { productName: 'Staplers', quantity: 10, unit: 'pcs' },
      ],
    },
    rejectionReason: '',
  },
];

const IncomingShipmentsApproval = () => {
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
    // Simulate API call to fetch incoming shipment requests
    setTimeout(() => {
      setRequests(initialShipmentRequests);
      setLoading(false);
    }, 500);
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = requests.filter(request =>
      request.id.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.submittedBy.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.status.toLowerCase().includes(lowerCaseSearchTerm) ||
      (request.shipmentDetails.supplierName && request.shipmentDetails.supplierName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (request.shipmentDetails.trackingNumber && request.shipmentDetails.trackingNumber.toLowerCase().includes(lowerCaseSearchTerm))
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
      // Simulate API call to approve request (BR114: Inventory Update on Approval)
      console.log(`Approving incoming shipment: ${currentRequest.id}`);
      // In a real application, this would trigger an inventory update
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Approved' } : req
      ));
      message.success(`Incoming shipment ${currentRequest.id} approved successfully! Inventory updated.`);
      handleDetailsModalCancel();
    } catch (error) {
      console.error('Failed to approve request:', error);
      message.error('System error. Please try again later.'); // Exception handling
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (values) => {
    if (!currentRequest) return;

    setLoading(true);
    try {
      // Simulate API call to reject request (BR114: Inventory Update on Approval - not updated on reject)
      console.log(`Rejecting incoming shipment: ${currentRequest.id} with reason: ${values.reason}`);
      setRequests(prev => prev.map(req =>
        req.id === currentRequest.id ? { ...req, status: 'Rejected', rejectionReason: values.reason } : req
      ));
      message.success(`Incoming shipment ${currentRequest.id} rejected.`);
      handleRejectModalCancel();
      handleDetailsModalCancel(); // Close details modal after rejection
    } catch (error) {
      console.error('Failed to reject request:', error);
      message.error('System error. Please try again later.'); // Exception handling
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
            <Tooltip title="Review Shipment">
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
      <Title level={2} style={{ marginBottom: 30 }}><InboxOutlined /> Incoming Shipments Management</Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Search by Request ID, Submitted By, Status, Supplier Name or Tracking Number"
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

      {/* Shipment Details Modal */}
      <Modal
        title={<Title level={4} className="text-center mb-6">Review Incoming Shipment</Title>}
        visible={isDetailsModalVisible}
        onCancel={handleDetailsModalCancel}
        footer={null} // Custom footer for actions
        destroyOnClose
        width={900} // Increased width for better layout of detailed data
        className="rounded-lg"
        centered // Center the modal
      >
        {currentRequest && (
          <div className="flex flex-col h-full">
            <div className="p-4 bg-white rounded-lg flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {/* Request Summary Section */}
              <Card className="mb-6 shadow-sm border border-gray-100 p-6 rounded-lg">
                <Title level={5} className="mb-4">Request Details</Title>
                <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed">
                  <Descriptions.Item label={<Text strong>Request ID</Text>}>{currentRequest.id}</Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Submitted By</Text>}>{currentRequest.submittedBy}</Descriptions.Item>
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

              {/* Shipment Details Section */}
              <Divider orientation="left" className="my-6">Shipment Information</Divider>
              <div className="mt-4">
                <Card className="shadow-sm border border-gray-100 p-6 rounded-lg">
                   <Title level={5} className="mb-4">Shipment Details</Title>
                  <Descriptions column={2} bordered size="small" className="ant-descriptions-condensed mb-6">
                    <Descriptions.Item label={<Text strong>Supplier Name</Text>}>{currentRequest.shipmentDetails.supplierName}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Tracking Number</Text>}>{currentRequest.shipmentDetails.trackingNumber}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Expected Delivery</Text>} span={2}>
                      {dayjs(currentRequest.shipmentDetails.expectedDeliveryDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} className="mb-4 mt-6">Items in Shipment</Title>
                  {currentRequest.shipmentDetails.items && currentRequest.shipmentDetails.items.length > 0 ? (
                    <Table
                      dataSource={currentRequest.shipmentDetails.items}
                      columns={[
                        { title: 'Product Name', dataIndex: 'productName', key: 'productName' },
                        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                        { title: 'Unit', dataIndex: 'unit', key: 'unit' },
                      ]}
                      pagination={false}
                      rowKey={(record, index) => `${record.productName}-${index}`}
                      size="small"
                      bordered
                    />
                  ) : (
                    <Text type="secondary">No items listed for this shipment.</Text>
                  )}
                </Card>
              </div>

              {currentRequest.status === 'Rejected' && currentRequest.rejectionReason && (
                <Card className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <Text strong className="text-red-700">Rejection Reason:</Text> {currentRequest.rejectionReason}
                </Card>
              )}
            </div>

            {/* Actions for Pending Requests */}
            {currentRequest.status === 'Pending' && (
              <div className="flex justify-end mt-8 space-x-4 p-4 bg-white border-t border-gray-200">
                <Popconfirm
                  title="Approve Shipment?"
                  description="Are you sure you want to approve this incoming shipment? Inventory levels will be updated."
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
              { min: 10, message: 'Reason must be at least 10 characters.' } // BR114
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter reason for rejecting this shipment (min 10 characters)" className="rounded-md" />
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

export default IncomingShipmentsApproval;
