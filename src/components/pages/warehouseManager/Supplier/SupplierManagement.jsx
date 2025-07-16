import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Form, Input, Space, Typography, Tag,
  Tooltip, message, Select, Pagination
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined, AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import SupplierRequestDetailsModal from './SupplierRequestDetailsModal.jsx';
import SupplierRejectionReasonModal from './SupplierRejectionReasonModal.jsx';

import { useSupplier } from '../../../../hooks/useSupplier.js';

const { Title } = Typography;
const { Option } = Select;

const SupplierManagement = () => {
  const {
    allSuppliers,
    loading: contextLoading,
    approveSupplier,
    rejectSupplier,
    fetchAllSuppliers,
    pageIndex,
    setPageIndex,
    totalItem
  } = useSupplier();

  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentDisplaySupplier, setCurrentDisplaySupplier] = useState(null);
  const [rejectionForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  useEffect(() => {
    applyFiltersAndSort(allSuppliers, searchTerm, selectedStatusFilter, selectedTypeFilter);
  }, [allSuppliers, searchTerm, selectedStatusFilter, selectedTypeFilter]);

  useEffect(() => {
    fetchAllSuppliers(pageIndex);
  }, [pageIndex]);

  const applyFiltersAndSort = (data, term, statusFilter, typeFilter) => {
    let currentProcessedSuppliers = Array.isArray(data) ? [...data] : [];

    if (term) {
      const lowerCaseSearchTerm = term.toLowerCase();
      currentProcessedSuppliers = currentProcessedSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        (supplier.email && supplier.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (supplier.phone && supplier.phone.includes(lowerCaseSearchTerm)) ||
        (supplier.taxId && supplier.taxId.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (supplier.createdBy?.email && supplier.createdBy.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (supplier.createdBy?.firstName && supplier.createdBy.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (supplier.createdBy?.lastName && supplier.createdBy.lastName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (statusFilter !== 'All') {
      currentProcessedSuppliers = currentProcessedSuppliers.filter(supplier =>
        supplier.status.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (typeFilter !== 'All') {
      currentProcessedSuppliers = currentProcessedSuppliers.filter(supplier => {
        const type = getSupplierRequestType(supplier);
        return type.toUpperCase() === typeFilter.toUpperCase();
      });
    }

    currentProcessedSuppliers.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return dayjs(b.updatedAt).diff(dayjs(a.updatedAt));
    });

    setFilteredSuppliers(currentProcessedSuppliers);
  };

  const getSupplierRequestType = (supplier) => {
    if (supplier.requestType) { 
      return supplier.requestType;
    }

    const createdAt = dayjs(supplier.createdAt);
    const updatedAt = dayjs(supplier.updatedAt);

    if (supplier.action && ['INACTIVE', 'ACTIVE'].includes(supplier.action.toUpperCase())) {
      if (!createdAt.isSame(updatedAt)) {
        return 'Status Change';
      }
    }

    if (createdAt.isSame(updatedAt)) {
      return 'Create';
    } else {
      return 'Update';
    }
  };

  const onChangePage = (page) => {
    setPageIndex(page);
  };

  const mapApiSupplierToDisplay = (apiSupplier) => {
    const requestType = getSupplierRequestType(apiSupplier);
    // Lấy createdBy từ apiSupplier (có sẵn trong response /suppliers/all)
    const createdBy = apiSupplier.createdBy ?
      `${apiSupplier.createdBy.firstName || ''} ${apiSupplier.createdBy.lastName || ''}`.trim() || apiSupplier.createdBy.email :
      'N/A';

    let supplierDetails;

    if (requestType === 'Create') {
      supplierDetails = {
        name: apiSupplier.name,
        contactPerson: apiSupplier.contactPerson || 'N/A',
        email: apiSupplier.email,
        phone: apiSupplier.phone,
        address: apiSupplier.address,
        products: apiSupplier.products || [],
        taxId: apiSupplier.taxId,
        status: apiSupplier.status,
      };
    } else if (requestType === 'Update') {
      supplierDetails = {
        old: { // Giả định backend có thể gửi các trường này nếu là Update request
          name: apiSupplier.oldName || 'N/A',
          contactPerson: apiSupplier.oldContactPerson || 'N/A',
          email: apiSupplier.oldEmail || 'N/A',
          phone: apiSupplier.oldPhone || 'N/A',
          address: apiSupplier.oldAddress || 'N/A',
          products: apiSupplier.oldProducts || [],
          taxId: apiSupplier.oldTaxId || 'N/A',
        },
        new: {
          name: apiSupplier.name,
          contactPerson: apiSupplier.contactPerson || 'N/A',
          email: apiSupplier.email,
          phone: apiSupplier.phone,
          address: apiSupplier.address,
          products: apiSupplier.products || [],
          taxId: apiSupplier.taxId,
        }
      };
    } else if (requestType === 'Status Change') {
      supplierDetails = {
        name: apiSupplier.name,
        oldStatus: apiSupplier.previousStatus || 'N/A',
        newStatus: apiSupplier.action || apiSupplier.status, // Có thể là action hoặc status cuối cùng
      };
    } else { // Fallback cho các trường hợp không xác định hoặc 'Create' mặc định
      supplierDetails = {
        name: apiSupplier.name,
        contactPerson: apiSupplier.contactPerson || 'N/A',
        email: apiSupplier.email,
        phone: apiSupplier.phone,
        address: apiSupplier.address,
        products: apiSupplier.products || [],
        taxId: apiSupplier.taxId,
        status: apiSupplier.status,
      };
    }

    return {
      id: apiSupplier._id,
      type: requestType,
      submittedBy: createdBy,
      dateSubmitted: apiSupplier.updatedAt,
      status: apiSupplier.status,
      supplierDetails: supplierDetails,
      rejectionReason: apiSupplier.rejectedNote,
      createdAt: apiSupplier.createdAt, // Bổ sung để hiển thị trong modal
      updatedAt: apiSupplier.updatedAt, // Bổ sung để hiển thị trong modal
    };
  };

  const showDetailsModal = (supplier) => {
    const mappedSupplier = mapApiSupplierToDisplay(supplier);
    setCurrentDisplaySupplier(mappedSupplier);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setCurrentDisplaySupplier(null);
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
    if (!currentDisplaySupplier) return;
    setActionLoading(true);
    try {
      await approveSupplier(currentDisplaySupplier.id);
      message.success(`Supplier request ${currentDisplaySupplier.id} approved successfully!`);
      handleDetailsModalCancel();
    } catch (error) {
      console.error('Failed to approve request:', error);
      message.error('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (values) => {
    if (!currentDisplaySupplier) return;
    setActionLoading(true);
    try {
      await rejectSupplier(currentDisplaySupplier.id, values.reason);
      message.success(`Supplier request ${currentDisplaySupplier.id} rejected.`);
      handleRejectModalCancel();
      handleDetailsModalCancel();
    } catch (error) {
      console.error('Failed to reject request:', error);
      message.error('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'No.',
      key: 'serialNo',
      render: (text, record, index) => (pageIndex - 1) * 10 + index + 1,
      width: '5%',
    },
    {
      title: 'Supplier Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Type',
      key: 'typeDisplay',
      width: '10%',
      render: (_, record) => {
        const type = getSupplierRequestType(record);
        let color = 'blue';
        if (type === 'UPDATE') color = 'orange';
        if (type === 'STATUS CHANGE') color = 'purple';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Submitted By',
      key: 'createdBy',
      width: '15%',
      render: (_, record) => {
        if (!record.createdBy) return 'N/A';
        const { firstName, lastName, email } = record.createdBy;
        const fullName = `${firstName || ''} ${lastName || ''}`.trim();
        return fullName || email || 'N/A';
      },
    },
    {
      title: 'Date Submitted',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => {
        let color = 'default';
        if (status === 'PENDING') color = 'gold';
        if (status === 'APPROVED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'PENDING' && (
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
          {record.status !== 'PENDING' && (
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
      <Title level={2} style={{ marginBottom: 30 }}><AuditOutlined /> Supplier Management</Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search by Name, Tax ID, Phone, Email, or Created By"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 350 }}
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
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
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
              <Option value="CREATE">Create</Option>
              <Option value="UPDATE">Update</Option>
              <Option value="STATUS CHANGE">Status Change</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            rowKey="_id"
            loading={contextLoading || actionLoading}
            pagination={false}
            bordered
          />
          <Pagination current={pageIndex} onChange={onChangePage} pageSize={10} total={totalItem} align="end" />
        </Space>
      </Card>

      <SupplierRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentDisplaySupplier}
        onCancel={handleDetailsModalCancel}
        onApprove={handleApproveRequest}
        onShowRejectModal={showRejectModal}
        loading={actionLoading}
      />

      <SupplierRejectionReasonModal
        visible={isRejectModalVisible}
        onCancel={handleRejectModalCancel}
        onSubmit={handleRejectRequest}
        loading={actionLoading}
        form={rejectionForm}
      />
    </div>
  );
};

export default SupplierManagement;