import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Modal, Form, Input, InputNumber, Space, Typography, Tag, Select,
    Tooltip, message, Popconfirm, Switch, Spin, Pagination, Row, Col, Progress, Statistic
} from 'antd';
import {
    PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ClusterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useZones } from '../../../../hooks/useZones.js';
import ModalDetailZone from './ModalDetailZone.jsx';
import ModalCreateZone from './ModalCreateZone.jsx';
import ModalEditZone from './ModalEditZone.jsx';
import { ZoneItemProvider } from '../../../../context/ZoneItemContext.jsx';
import { useWarehouse } from '../../../../context/WarehouseContext.jsx';

const { Title, Text } = Typography;
const { Option } = Select;

const ZoneManagement = () => {
    const { zones, loading, fetchZones, createZone, updateZone, pageIndex, setPageIndex, totalItem, allZonesTotalCapacity, changeZoneStatus, setDataParams, dataParams, pageSize, setPageSize } = useZones();
    const { warehouses, getCapacityByWarehouse } = useWarehouse(); 

    const [filteredZones, setFilteredZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewGoodsModalOpen, setIsViewGoodsModalOpen] = useState(false);
    const [currentZone, setCurrentZone] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [goodsSearchTerm, setGoodsSearchTerm] = useState('');
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [statusFilter, setStatusFilter] = useState('All Status');
    
    const totalWarehouseCapacity = warehouses?.[0]?.totalCapacity || 0; 

    const usedWarehouseCapacity = allZonesTotalCapacity || 0;
    const remainingWarehouseCapacity = totalWarehouseCapacity - usedWarehouseCapacity;
    const warehouseUsagePercentage = totalWarehouseCapacity > 0 ? parseFloat(((usedWarehouseCapacity / totalWarehouseCapacity) * 100)?.toFixed(2)) : 0;
    
    console.log("Total Warehouse Capacity (from useWarehouse):", totalWarehouseCapacity);
    console.log("Warehouses state from context:", warehouses);

    let warehouseProgressStatus = 'normal';
    let warehouseProgressColor = '#52c41a';
    if (warehouseUsagePercentage > 90) {
        warehouseProgressStatus = 'exception';
        warehouseProgressColor = '#ff4d4f';
    } else if (warehouseUsagePercentage > 70) {
        warehouseProgressStatus = 'active';
        warehouseProgressColor = '#faad14';
    }

    useEffect(() => {
        getCapacityByWarehouse(); 
    }, []); 

    useEffect(() => {
        let tempFiltered = [...zones]
        tempFiltered.sort((a, b) => {
            const statusOrder = { 'ACTIVE': 1, 'INACTIVE': 2 };
            const statusA = statusOrder[a.status?.toUpperCase()] || 99;
            const statusB = statusOrder[b.status?.toUpperCase()] || 99;

            if (statusA !== statusB) {
                return statusA - statusB;
            }
            return dayjs(b.createdAt).diff(dayjs(a.createdAt));
        })
        setFilteredZones(tempFiltered);
    }, [searchTerm, zones, statusFilter]);

    useEffect(() => {
        if (isEditModalOpen && currentZone) {
            editForm.setFieldsValue({
                name: currentZone?.name,
                storageTemperatureMin: typeof currentZone.storageTemperature?.min === 'number' ? currentZone?.storageTemperature.min : null,
                storageTemperatureMax: typeof currentZone.storageTemperature?.max === 'number' ? currentZone?.storageTemperature.max : null,
                totalCapacity: typeof currentZone.totalCapacity === 'number' ? currentZone.totalCapacity : null,
            });
        }
    }, [currentZone, isEditModalOpen, editForm]);


    const showCreateModal = () => {
        createForm.resetFields();
        setIsCreateModalOpen(true);
    };

    const handleCreateCancel = () => {
        setIsCreateModalOpen(false);
        createForm.resetFields();
    };

    const handleCreateSubmit = async (values) => {
        console.log("handleCreateSubmit called with values:", values);
        try {
            await createForm.validateFields();
            console.log("Create Form validation successful!");

            if (zones.some(z => z.name.toLowerCase() === values.name.toLowerCase())) {
                message.error('Zone name must be unique.');
                console.warn("Validation failed: Zone name is not unique.");
                return;
            }
            const payload = {
                name: values.name,
                storageTemperature: {
                    min: values?.storageTemperatureMin,
                    max: values?.storageTemperatureMax,
                },
                totalCapacity: values.totalCapacity,
            };
            const result = await createZone(payload);
            console.log("createZone API result:", result);
            if(result?.success){
            await fetchZones();
            setIsCreateModalOpen(false);
            createForm.resetFields();
            }

        } catch (error) {
            console.error('Failed to create zone in component (catch block):', error);
        }
    };

    const showEditModal = (record) => {
        setCurrentZone(record);
        setIsEditModalOpen(true);
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setCurrentZone(null);
        editForm.resetFields();
    };

    const handleEditSubmit = async (values) => {
        try {
            await editForm.validateFields();
            if (zones?.some(z => z?._id !== currentZone?._id && z?.name === values?.name)) {
                message.error('Zone name must be unique.');
                return;
            }
            console.log("Current Warehouse Total Capacity (from state - edit):", totalWarehouseCapacity);
            if (totalWarehouseCapacity === 0 && !loading) { 
                message.error("Unable to verify warehouse capacity. Please try again.");
                return;
            }
            const payload = {
                name: values.name,
                storageTemperature: {
                    min: values?.storageTemperatureMin,
                    max: values?.storageTemperatureMax,
                },
                totalCapacity: values.totalCapacity,
            };
            const result = await updateZone(currentZone._id, payload);

            if (result.success) {
                message.success("Zone updated successfully!");
                await fetchZones();
                setIsEditModalOpen(false);
                setCurrentZone(null);
                editForm.resetFields();
            } else {
                message.error(result.message || "Failed to update zone. Please try again.");
            }
        } catch (error) {
            console.error('Failed to edit zone in component (catch block):', error);
            if (error.errorFields) {
                message.error('Please check the validation errors.');
            } else if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error(error.message || 'An unexpected error occurred while updating zone.');
            }
        }
    };


    const handleChangeStatus = async (record, checked) => {
        const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
        if (newStatus.toLowerCase() === 'inactive' && record.currentCapacity > 0) {
            message.error('Cannot set zone to inactive: There are still active goods in this zone.');
            return;
        }

        try {
            const result = await changeZoneStatus(record._id, newStatus);
            await fetchZones();
            if (result.success) {
                message.success(`Zone status changed to ${newStatus}.`);
            } else {
                message.error(result.message || 'Failed to change zone status.');
            }
        } catch (error) {
            console.error('Failed to change zone status in component:', error);
            message.error('An unexpected error occurred while changing zone status.');
        }
    };

    const showViewGoodsModal = (zone) => {
        setCurrentZone(zone);
        setGoodsSearchTerm('');
        setIsViewGoodsModalOpen(true);
    };

    const handleViewGoodsCancel = () => {
        setIsViewGoodsModalOpen(false);
        setCurrentZone(null);
        setGoodsSearchTerm('');
    };

    const columns = [
        {
            title: 'No.',
            key: 'serialNo',
            render: (text, record, index) => (pageIndex - 1) * pageSize + index + 1,
            width: '5%',
        },
        {
            title: 'Zone Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: '20%',
        },
        {
            title: 'Storage Temp (°C)',
            key: 'temperature',
            render: (_, record) => `${record?.storageTemperature?.min}°C - ${record?.storageTemperature?.max}°C`,
            width: '15%',
        },
        {
            title: 'Capacity (Current/Total)',
            key: 'capacity',
            render: (_, record) => {
                const current = Math.round(record?.currentCapacity || 0);
                const total = Math.round(record?.totalCapacity || 0);
                return `${current}/${total}`;
            },
            width: '20%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status && status.toLowerCase() === 'active' ? 'green' : 'red'}>
                    {status ? status.toUpperCase() : 'N/A'}
                </Tag>
            ),
            width: '10%',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_, record) => {
                const isZoneActive = record?.status && record?.status?.toLowerCase() === 'active';
                const hasGoods = record?.currentCapacity > 0;

                return (
                    <Space size="small">
                        <Tooltip title="View Goods Details">
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => showViewGoodsModal(record)}
                                type="text"
                            />
                        </Tooltip>
                        <Tooltip title="Edit Zone">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => showEditModal(record)}
                                type="text"
                            />
                        </Tooltip>

                        {isZoneActive ? (
                            <Popconfirm
                                title="Deactivate Zone?"
                                description={hasGoods ? "Cannot deactivate: There are still active goods in this zone." : "Are you sure you want to deactivate this zone?"}
                                onConfirm={() => handleChangeStatus(record, false)}
                                okText="Yes"
                                cancelText="No"
                                disabled={hasGoods}
                            >
                                <Tooltip
                                    title={hasGoods ? "Cannot deactivate when active inventory exists" : "Click to deactivate zone"}
                                >
                                    <Switch
                                        checked={isZoneActive}
                                        disabled={hasGoods}
                                        style={{ backgroundColor: isZoneActive && !hasGoods ? 'green' : undefined }}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="Activate Zone?"
                                description="Are you sure you want to activate this zone?"
                                onConfirm={() => handleChangeStatus(record, true)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Tooltip title="Click to activate zone">
                                    <Switch
                                        checked={isZoneActive}
                                        style={{ backgroundColor: 'red' }}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    const onChangePage = (page, size) => {
        setPageIndex(page);
        setDataParams({ ...dataParams, page })
        if (size !== pageSize) {
            setPageSize(size);
        }
    };

    return (
        <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
            {/* <Title level={2} style={{ marginBottom: 30 }}><ClusterOutlined /> Zone Management</Title>  */}
            <Card
                className="shadow-xl rounded-lg border border-gray-100 mb-8"
                styles={{ body: { padding: '24px' } }}
            >
                <Card className="mb-6 rounded-lg shadow-sm" style={{ border: '1px solid #f0f0f0' }}>
                    <Title level={5} className="mb-4 text-center">Warehouse Capacity Overview</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title={<Text strong>Total Warehouse Capacity</Text>}
                                value={totalWarehouseCapacity} 
                                suffix="units"
                                className="text-center"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title={<Text strong>Used Capacity (All Zones)</Text>}
                                value={usedWarehouseCapacity}
                                suffix="units"
                                className="text-center"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title={<Text strong>Remaining Capacity</Text>}
                                value={remainingWarehouseCapacity}
                                suffix="units"
                                className="text-center"
                                valueStyle={{ color: remainingWarehouseCapacity <= 0 ? '#ff4d4f' : '#3f8600' }}
                            />
                        </Col>
                        <Col xs={24}>
                            <div className="mt-4 text-center">
                                <Text strong className="block mb-2">Warehouse Usage:</Text>
                                <Progress
                                    percent={warehouseUsagePercentage}
                                    status={warehouseProgressStatus}
                                    strokeColor={warehouseProgressColor}
                                    size="large"
                                    format={(percent) => `${percent}% Used`}
                                />
                                {warehouseUsagePercentage >= 100 && (
                                    <Text type="danger">Warehouse is at full capacity!</Text>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Input
                            placeholder="Search by zone name"
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setDataParams({ ...dataParams, name: e.target.value })
                            }}
                            style={{ width: 300 }}
                        />
                        <Select
                            placeholder="Filter by status"
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value)
                                setDataParams({ ...dataParams, status: value || "" })
                            }}
                            style={{ width: 200 }}
                            allowClear
                        >
                            <Option value="">All Status</Option>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={showCreateModal}
                            disabled={totalItem > 0 && remainingWarehouseCapacity <= 0}
                        >
                            Create New Zone
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredZones}
                        rowKey="_id"
                        loading={loading}
                        pagination={false}
                        bordered
                        locale={{
                            emptyText: (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                    {loading && (
                                        <>
                                            <img src="https://placehold.co/50x50/cccccc/ffffff?text=Spinner" alt="Loading Spinner" style={{ width: 50, height: 50 }} />
                                        </>
                                    )}
                                    {!loading && (
                                        <p style={{ marginTop: 20, color: '#555' }}>No data</p>
                                    )}
                                </div>
                            )
                        }}
                    />

                    <Pagination current={pageIndex} onChange={onChangePage} pageSize={pageSize} total={totalItem} align="end" />
                </Space>
            </Card>

            <ModalCreateZone currentZone={currentZone} loading={loading} allZonesTotalCapacity={allZonesTotalCapacity} handleCreateCancel={handleCreateCancel} isCreateModalOpen={isCreateModalOpen} createForm={createForm} handleCreateSubmit={handleCreateSubmit} currentWarehouseTotalCapacity={totalWarehouseCapacity} totalItem={totalItem} zones={zones} />
            <ModalEditZone isEditModalOpen={isEditModalOpen} handleEditCancel={handleEditCancel} editForm={editForm} handleEditSubmit={handleEditSubmit} currentWarehouseTotalCapacity={totalWarehouseCapacity} loading={loading} allZonesTotalCapacity={allZonesTotalCapacity} currentZone={currentZone} zones={zones} />
            <ZoneItemProvider>
                <ModalDetailZone isViewGoodsModalOpen={isViewGoodsModalOpen} handleViewGoodsCancel={handleViewGoodsCancel} currentZone={currentZone} />
            </ZoneItemProvider>

        </div>
    );
};

export default ZoneManagement;
