import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Card, Button, Form, Input, Space, Typography, Tag,
    Tooltip, message, Select, Pagination, Spin, Flex, Empty
} from 'antd';
import {
    EyeOutlined, SearchOutlined, AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import SupplierRequestDetailsModal from './SupplierRequestDetailsModal.jsx';
import SupplierRejectionReasonModal from './SupplierRejectionReasonModal.jsx';

import { useSupplier } from '../../../../hooks/useSupplier.js';

const { Title } = Typography;
const { Option } = Select;
const { Text } = Typography;

const SupplierManagement = () => {
    const {
        allSuppliers,
        loading: contextLoading,
        approveSupplier,
        rejectSupplier,
        fetchAllSuppliers,
        pageIndex,
        pageSize,
        setPageSize,
        setPageIndex,
        totalItem,
        dataParams, setDataParams
    } = useSupplier();

    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(dataParams.name || '');
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [currentDisplaySupplier, setCurrentDisplaySupplier] = useState(null);
    const [rejectionForm] = Form.useForm();
    const [actionLoading, setActionLoading] = useState(false);

    const [selectedStatusFilter, setSelectedStatusFilter] = useState(dataParams.status || 'All');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState(dataParams.type || 'All');

    const getSupplierRequestType = useCallback((supplier) => {
        if (supplier.pendingLog?.requestType) {
            return supplier.pendingLog.requestType.toUpperCase();
        }
        if (supplier.requestType) {
            return supplier.requestType.toUpperCase();
        }
        return 'N/A';
    }, []);

    const mapApiSupplierToDisplay = useCallback((apiSupplier) => {
        const requestType = getSupplierRequestType(apiSupplier);

        const createdByInfo = apiSupplier.pendingLog?.createdBy || apiSupplier.createdBy;
        const submittedBy = createdByInfo ?
            `${createdByInfo.firstName || ''} ${createdByInfo.lastName || ''}`.trim() || createdByInfo.email :
            'N/A';

        let supplierDetails = {};
        if (requestType === 'CREATE') {
            const source = apiSupplier.pendingLog || apiSupplier;
            supplierDetails = {
                name: source.name,
                contactPerson: source.contactPerson || 'N/A',
                email: source.email,
                phone: source.phone,
                address: source.address,
                products: source.products || [],
                taxId: source.taxId,
                status: source.status,
                rejectionReason: apiSupplier?.pendingLog?.rejectedNote
            };
        } else if (requestType === 'UPDATE') {
            supplierDetails = {
                old: {
                    name: apiSupplier.name || 'N/A',
                    contactPerson: apiSupplier.contactPerson || 'N/A',
                    email: apiSupplier.email || 'N/A',
                    phone: apiSupplier.phone || 'N/A',
                    address: apiSupplier.address || 'N/A',
                    products: apiSupplier.products || [],
                    taxId: apiSupplier.taxId || 'N/A',
                    status: apiSupplier.status,
                },
                new: {
                    name: apiSupplier.pendingLog?.name || 'N/A',
                    contactPerson: apiSupplier.pendingLog?.contactPerson || 'N/A',
                    email: apiSupplier.pendingLog?.email || 'N/A',
                    phone: apiSupplier.pendingLog?.phone || 'N/A',
                    address: apiSupplier.pendingLog?.address || 'N/A',
                    products: apiSupplier.pendingLog?.products || [],
                    taxId: apiSupplier.pendingLog?.taxId || 'N/A',
                    status: apiSupplier.pendingLog?.status || 'PENDING',
                },

            };
        } else if (requestType === 'STATUS_CHANGE') {
            supplierDetails = {
                name: apiSupplier.name,
                oldStatus: apiSupplier.pendingLog?.oldAction || 'N/A',
                newStatus: apiSupplier.pendingLog?.newAction || 'N/A',
                rejectionReason: apiSupplier?.pendingLog?.rejectedNote
            };
        } else {
            supplierDetails = {
                name: apiSupplier.name,
                contactPerson: apiSupplier.contactPerson || 'N/A',
                email: apiSupplier.email,
                phone: apiSupplier.phone,
                address: apiSupplier.address,
                products: apiSupplier.products || [],
                taxId: apiSupplier.taxId,
                status: apiSupplier.status,
                rejectionReason: apiSupplier?.pendingLog?.rejectedNote
            };
        }

        return {
            id: apiSupplier._id,
            pendingLog: apiSupplier.pendingLog || null,
            type: requestType,
            submittedBy: submittedBy,
            dateSubmitted: apiSupplier.pendingLog?.createdAt || apiSupplier.updatedAt,
            status: apiSupplier.status,
            supplierDetails: supplierDetails,
            createdAt: apiSupplier.createdAt,
            updatedAt: apiSupplier.updatedAt,
            rejectionReason: apiSupplier?.pendingLog?.rejectedNote
        };
    }, [getSupplierRequestType]);

    useEffect(() => {
        fetchAllSuppliers(dataParams);
    }, [dataParams]);

    useEffect(() => {
        let tempFiltered = [...allSuppliers];

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            tempFiltered = tempFiltered.filter(supplier =>
                supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (supplier.email && supplier.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.phone && supplier.phone.includes(lowerCaseSearchTerm)) ||
                (supplier.taxId && supplier.taxId.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.pendingLog?.createdBy?.email && supplier.pendingLog.createdBy.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.pendingLog?.createdBy?.firstName && supplier.pendingLog.createdBy.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.pendingLog?.createdBy?.lastName && supplier.pendingLog.createdBy.lastName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.createdBy?.email && supplier.createdBy.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.createdBy?.firstName && supplier.createdBy.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (supplier.createdBy?.lastName && supplier.createdBy.lastName.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        if (selectedStatusFilter !== 'All') {
            tempFiltered = tempFiltered.filter(supplier =>
                supplier.status.toUpperCase() === selectedStatusFilter.toUpperCase()
            );
        }

        if (selectedTypeFilter !== 'All') {
            tempFiltered = tempFiltered.filter(supplier => {
                const type = getSupplierRequestType(supplier);
                return type.toUpperCase() === selectedTypeFilter.toUpperCase();
            });
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

        setFilteredSuppliers(tempFiltered);
    }, [allSuppliers, searchTerm, selectedStatusFilter, selectedTypeFilter, getSupplierRequestType]);

    const onChangePage = (page, size) => {
        setPageIndex(page);
        setPageSize(size);
        setDataParams(prevParams => ({ ...prevParams, page, size }));
    };

    const showDetailsModal = (record) => {
        const mappedSupplier = mapApiSupplierToDisplay(record);
        setCurrentDisplaySupplier(mappedSupplier);
        setIsDetailsModalVisible(true);
    };

    const handleDetailsModalCancel = () => {
        setIsDetailsModalVisible(false);
        setCurrentDisplaySupplier(null);
    };

    const showRejectModal = (record) => {
        rejectionForm.resetFields();
        setCurrentDisplaySupplier(record);
        setIsRejectModalVisible(true);
    };

    const handleRejectModalCancel = () => {
        setIsRejectModalVisible(false);
        rejectionForm.resetFields();
    };

    const handleActionSuccess = async () => {
        await fetchAllSuppliers(dataParams);
        handleDetailsModalCancel();
        handleRejectModalCancel();
    };

    const handleApproveRequest = async () => {
        if (!currentDisplaySupplier) return;
        if (!currentDisplaySupplier.pendingLog?._id) {
            message.error('No pending request found for this supplier to approve.');
            return;
        }
        setActionLoading(true);
        try {
            await approveSupplier(currentDisplaySupplier.pendingLog._id);
            message.success(`Supplier request ${currentDisplaySupplier.pendingLog._id} approved successfully!`);
            handleActionSuccess();
        } catch (error) {
            console.error('Failed to approve request:', error);
            message.error('Failed to approve request. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async (values) => {
        if (!currentDisplaySupplier) return;
        if (!currentDisplaySupplier.pendingLog?._id) {
            message.error('No pending request found for this supplier to reject.');
            return;
        }
        setActionLoading(true);
        try {
            await rejectSupplier(currentDisplaySupplier.pendingLog._id, values?.reason);
            message.success(`Supplier request ${currentDisplaySupplier.pendingLog._id} rejected.`);
            handleActionSuccess();
        } catch (error) {
            console.error('Failed to reject request:', error);
            message.error('Failed to reject request. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusTag = (status) => {
        let color = 'default';
        if (status === 'PENDING') color = 'gold';
        if (status === 'APPROVED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        if (status === 'ACTIVE') color = 'blue';
        if (status === 'INACTIVE') color = 'volcano';
        return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
    };

    const getRequestTypeTag = (type) => {
        let color = 'blue';
        if (type === 'UPDATE') color = 'orange';
        if (type === 'STATUS CHANGE') color = 'purple';
        if (type === 'CREATE') color = 'green';
        return <Tag color={color}>{type ? type.toUpperCase() : 'N/A'}</Tag>;
    };

    const columns = [
        {
            title: 'No.',
            key: 'serialNo',
            render: (text, record, index) => (pageIndex - 1) * pageSize + index + 1,
            width: '5%',
        },
        {
            title: 'Supplier Name',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            render: (name, record) => {
                const type = getSupplierRequestType(record);
                if (type === 'UPDATE' && record.status === 'PENDING' && record.pendingLog?.name) {
                    return record.pendingLog.name;
                }
                return name;
            }
        },
        {
            title: 'Type',
            key: 'requestTypeDisplay',
            width: '10%',
            render: (_, record) => {
                const requestType = getSupplierRequestType(record);
                return getRequestTypeTag(requestType);
            },
        },
        {
            title: 'Submitted By',
            key: 'submittedBy',
            width: '15%',
            render: (_, record) => {
                if (record.pendingLog?.createdBy) {
                    const { firstName, lastName, email } = record.pendingLog.createdBy;
                    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
                    return fullName || email || 'N/A';
                }
                if (record.createdBy) {
                    const { firstName, lastName, email } = record.createdBy;
                    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
                    return fullName || email || 'N/A';
                }
                return 'N/A';
            },
        },
        {
            title: 'Date Submitted',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
            width: '15%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'PENDING' ? (
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
                    ) : (
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
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setDataParams(prev => ({ ...prev, name: e.target.value, page: 1 }));
                            }}
                            style={{ width: 350 }}
                            prefix={<SearchOutlined />}
                            className="rounded-md"
                        />
                        <Select
                            defaultValue="All"
                            style={{ width: 150 }}
                            onChange={(value) => {
                                setSelectedStatusFilter(value);
                                setDataParams(prev => ({ ...prev, status: value === 'All' ? '' : value, page: 1 }));
                            }}
                            className="rounded-md"
                            placeholder="Filter by Status"
                            value={selectedStatusFilter}
                        >
                            <Option value="All">All Status</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="APPROVED">Approved</Option>
                            <Option value="REJECTED">Rejected</Option>
                        </Select>
                        <Select
                            defaultValue="All"
                            style={{ width: 180 }}
                            onChange={(value) => {
                                setSelectedTypeFilter(value);
                                setDataParams(prev => ({ ...prev, type: value === 'All' ? '' : value, page: 1 }));
                            }}
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
                        locale={{
                            emptyText: <Empty description="No supplier data" />
                        }}
                    />
                    <Pagination
                        current={pageIndex}
                        onChange={onChangePage}
                        pageSize={pageSize}
                        total={totalItem}
                        align="end"
                    />
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
