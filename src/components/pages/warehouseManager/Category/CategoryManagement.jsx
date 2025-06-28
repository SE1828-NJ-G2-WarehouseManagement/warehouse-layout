import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Input, Space, Typography, Tag,
  Tooltip, Pagination, Select, Form
} from 'antd';
import {
  EyeOutlined, SearchOutlined, FolderOpenOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useCategory } from '../../../../hooks/useCategory';
import CategoryRequestDetailsModal from './CategoryRequestDetailsModal.jsx';
import CategoryRejectionReasonModal from './CategoryRejectionReasonModal.jsx';

const { Title } = Typography;
const { Option } = Select;

const CategoryManagement = () => {
  const {
    allCategories,
    loading,
    pageIndex,
    pageSize,
    totalItem,
    fetchAllCategories,
    setPageIndex,
    setPageSize,
  } = useCategory();

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentRequestForModal, setCurrentRequestForModal] = useState(null); 
  const [rejectionForm] = Form.useForm();
  // eslint-disable-next-line no-unused-vars
  const [actionLoading, setActionLoading] = useState(false); 
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  useEffect(() => {
    let tempFiltered = [...allCategories];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(category =>
        category._id?.toLowerCase().includes(lowerCaseSearchTerm) ||
        category.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        (category.createdBy?.firstName && category.createdBy.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (category.createdBy?.lastName && category.createdBy.lastName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (category.status && category.status.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (selectedStatusFilter !== 'All') {
      tempFiltered = tempFiltered.filter(category =>
        (category.status && category.status.toUpperCase() === selectedStatusFilter.toUpperCase())
      );
    }

    if (selectedTypeFilter !== 'All') {
      tempFiltered = tempFiltered.filter(category =>
        (category.requestType && category.requestType.toUpperCase() === selectedTypeFilter.toUpperCase())
      );
    }

    tempFiltered.sort((a, b) => {
      const statusOrder = { 'PENDING': 1, 'APPROVED': 2, 'ACTIVE': 2, 'REJECTED': 3, 'INACTIVE': 3 };
      const statusA = statusOrder[a.status?.toUpperCase()] || 99;
      const statusB = statusOrder[b.status?.toUpperCase()] || 99;

      if (statusA !== statusB) {
        return statusA - statusB;
      }
      return dayjs(b.createdAt).diff(dayjs(a.createdAt));
    });

    setFilteredCategories(tempFiltered);
  }, [allCategories, searchTerm, selectedStatusFilter, selectedTypeFilter]);

  const showDetailsModal = (record) => {
    setCurrentRequestForModal(record);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setCurrentRequestForModal(null);
  };

  const handleShowRejectModal = (record) => {
    rejectionForm.resetFields();
    setCurrentRequestForModal(record);
    setIsRejectModalVisible(true);
  };

  const handleRejectModalCancel = () => {
    setIsRejectModalVisible(false);
    rejectionForm.resetFields();
  };

  const handleActionSuccess = async () => {
    await fetchAllCategories(pageIndex, pageSize);
    handleDetailsModalCancel();
    handleRejectModalCancel(); 
  };

  const onChangePage = (page, size) => {
    setPageIndex(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  const columns = [
    {
      title: 'No.',
      key: 'serialNo',
      render: (text, record, index) => (pageIndex - 1) * pageSize + index + 1,
      width: '5%',
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (name, record) => {
        if (record.requestType === 'UPDATE' && record.pendingChanges?.name) {
          return record.pendingChanges.name;
        }
        return name;
      },
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType',
      width: '10%',
      render: (requestType) => {
        let color = 'blue';
        if (requestType === 'UPDATE') color = 'orange';
        if (requestType === 'STATUS_CHANGE') color = 'purple';
        if (requestType === 'CREATE') color = 'blue';
        return requestType ? <Tag color={color}>{requestType.toUpperCase()}</Tag> : <Tag>N/A</Tag>;
      },
    },
    {
      title: 'Submitted By',
      dataIndex: 'createdBy',
      key: 'submittedBy',
      width: '15%',
      render: (createdBy) => {
        return createdBy ? `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() : 'N/A';
      },
    },
    {
      title: 'Date Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A', 
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
        if (status === 'APPROVED' || status === 'ACTIVE') color = 'green';
        if (status === 'REJECTED' || status === 'INACTIVE') color = 'red';
        return status ? <Tag color={color}>{status.toUpperCase()}</Tag> : <Tag>N/A</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={record.status === 'PENDING' ? "Review Request" : "View Details"}>
            <Button
              icon={<EyeOutlined />}
              onClick={() => showDetailsModal(record)}
              className="rounded-md"
              type={record.status === 'PENDING' ? 'primary' : 'default'}
            >
              {record.status === 'PENDING' ? 'Review' : 'View'}
            </Button>
          </Tooltip>
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
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search by Name, Submitted By, or Status"
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
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
            <Select
              defaultValue="All"
              style={{ width: 180 }}
              onChange={setSelectedTypeFilter}
              className="rounded-md"
              placeholder="Filter by Request Type"
              value={selectedTypeFilter}
            >
              <Option value="All">All Types</Option>
              <Option value="CREATE">Create</Option>
              <Option value="UPDATE">Update</Option>
              <Option value="STATUS_CHANGE">Status Change</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="_id"
            loading={loading || actionLoading}
            pagination={false}
            bordered
          />
           <Pagination current={pageIndex} onChange={onChangePage} pageSize={10} total={totalItem} align="end" />
        </Space>
      </Card>

      <CategoryRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentRequestForModal}
        onCancel={handleDetailsModalCancel}
        onApprove={handleActionSuccess}
        onShowRejectModal={handleShowRejectModal}
        loading={actionLoading}
      />

      <CategoryRejectionReasonModal
        visible={isRejectModalVisible}
        currentRequest={currentRequestForModal}
        onCancel={handleRejectModalCancel}
        onSubmit={handleActionSuccess}
        loading={actionLoading}
        form={rejectionForm}
      />
    </div>
  );
};

export default CategoryManagement;