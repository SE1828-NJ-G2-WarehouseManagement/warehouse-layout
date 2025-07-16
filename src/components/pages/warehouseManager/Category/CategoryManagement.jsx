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
    dataParams, setDataParams
  } = useCategory();

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentRequestForModal, setCurrentRequestForModal] = useState(null);
  const [rejectionForm] = Form.useForm();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');

  useEffect(() => {
    let tempFiltered = [...allCategories];

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
    await fetchAllCategories(dataParams); 
    handleDetailsModalCancel(); 
    handleRejectModalCancel(); 
  };

  const onChangePage = (page, size) => {
    setPageIndex(page);
    setDataParams({ ...dataParams, page })
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
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setDataParams({ ...dataParams, name: e.target.value })
              }}
              style={{ width: 400 }}
              prefix={<SearchOutlined />}
              className="rounded-md"
            />
            <Select
              style={{ width: 150 }}
              onChange={(value) => {
                setSelectedStatusFilter(value)
                setDataParams({...dataParams,status:value || ""})
              }}
              className="rounded-md"
              placeholder="Filter by Status"
              value={selectedStatusFilter}
            >
              <Option value="">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
            <Select
              style={{ width: 180 }}
              onChange={(value) => {
                setSelectedTypeFilter(value)
                  setDataParams({...dataParams,type:value || ""})
              }}
              className="rounded-md"
              placeholder="Filter by Request Type"
              value={selectedTypeFilter}
            >
              <Option value="">All Types</Option>
              <Option value="CREATE">Create</Option>
              <Option value="UPDATE">Update</Option>
              <Option value="STATUS_CHANGE">Status Change</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="_id"
            loading={loading} 
            pagination={false}
            bordered
          />
          <Pagination current={pageIndex} onChange={onChangePage} pageSize={pageSize} total={totalItem} align="end" />
        </Space>
      </Card>

      <CategoryRequestDetailsModal
        visible={isDetailsModalVisible}
        currentRequest={currentRequestForModal}
        onCancel={handleDetailsModalCancel}
        onApprove={handleActionSuccess}
        onShowRejectModal={handleShowRejectModal}
      />

      <CategoryRejectionReasonModal
        visible={isRejectModalVisible}
        currentRequest={currentRequestForModal}
        onCancel={handleRejectModalCancel}
        onSuccess={handleActionSuccess}
        form={rejectionForm}
      />
    </div>
  );
};

export default CategoryManagement;