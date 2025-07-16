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

const { Title, Text } = Typography;
const { Option } = Select;

const ZoneManagement = () => {
    const { zones, loading, fetchZones, createZone, updateZone, pageIndex, setPageIndex, totalItem, allZonesTotalCapacity, changeZoneStatus } = useZones();
    const [filteredZones, setFilteredZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewGoodsModalOpen, setIsViewGoodsModalOpen] = useState(false);
    const [currentZone, setCurrentZone] = useState(null);
    const [goodsSearchTerm, setGoodsSearchTerm] = useState('');
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [statusFilter, setStatusFilter] = useState('');

    const [currentWarehouseTotalCapacity, setCurrentWarehouseTotalCapacity] = useState(0);
    const totalWarehouseCapacity = currentWarehouseTotalCapacity || 0;
    const usedWarehouseCapacity = allZonesTotalCapacity || 0;
    const remainingWarehouseCapacity = totalWarehouseCapacity - usedWarehouseCapacity;
    const warehouseUsagePercentage = totalWarehouseCapacity > 0 ? parseFloat(((usedWarehouseCapacity / totalWarehouseCapacity) * 100).toFixed(2)) : 0;

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
        fetchZones();
    }, []);

    useEffect(() => {
        if (zones && zones.length > 0 && zones[0]?.warehouseId) {
            const warehouseInfo = zones[0].warehouseId;
            if (warehouseInfo && typeof warehouseInfo.totalCapacity === 'number') {
                setCurrentWarehouseTotalCapacity(warehouseInfo.totalCapacity);
            } else {
                setCurrentWarehouseTotalCapacity(0);
            }
        } else {
            setCurrentWarehouseTotalCapacity(0);
        }
    }, [zones]);

    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = zones.filter(zone =>
            zone?.name?.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredZones(filtered);
    }, [searchTerm, zones]); useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = zones.filter(zone => {
            const matchesSearch = zone?.name?.toLowerCase().includes(lowerCaseSearchTerm);
            const matchesStatus = statusFilter === '' || (zone.status && zone.status.toLowerCase() === statusFilter.toLowerCase());
            return matchesSearch && matchesStatus;
        });
        setFilteredZones(filtered);
        // setPageIndex(1);
    }, [searchTerm, statusFilter, zones, setPageIndex]);


    useEffect(() => {
        if (isEditModalOpen && currentZone) {
            editForm.setFieldsValue({
                name: currentZone?.name,
                storageTemperatureMin: typeof currentZone.storageTemperature?.min === 'number' ? currentZone.storageTemperature.min : null,
                storageTemperatureMax: typeof currentZone.storageTemperature?.max === 'number' ? currentZone.storageTemperature.max : null,
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
                    min: values.storageTemperatureMin,
                    max: values.storageTemperatureMax,
                },
                totalCapacity: values.totalCapacity,
            };
            const result = await createZone(payload);
            await fetchZones();
            console.log("createZone API result:", result);
                setIsCreateModalOpen(false);
                createForm.resetFields();
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
            console.log("Current Warehouse Total Capacity (from state - edit):", currentWarehouseTotalCapacity);
            if (currentWarehouseTotalCapacity === 0 && !loading) {
                message.error("Unable to verify warehouse capacity. Please try again.");
                return;
            }
            const payload = {
                name: values.name,
                storageTemperature: {
                    min: values.storageTemperatureMin,
                    max: values.storageTemperatureMax,
                },
                totalCapacity: values.totalCapacity,
            };
            const result = await updateZone(currentZone._id, payload);
            await fetchZones();
            if (result.success) {
                message.success("Zone updated successfully!");
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

    const filteredGoods = currentZone?.goods?.filter(item =>
        item.name.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        (item.expiryDate && dayjs(item.expiryDate).format('DD/MM/YYYY').includes(goodsSearchTerm))
    ) || [];

    const columns = [
        {
            title: 'No.',
            key: 'serialNo',
            render: (text, record, index) => index + 1,
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
            render: (_, record) => `${record.storageTemperature?.min}°C - ${record.storageTemperature?.max}°C`,
            width: '15%',
        },
        {
            title: 'Capacity (Current/Total)',
            key: 'capacity',
            render: (_, record) => `${record.currentCapacity}/${record.totalCapacity}`,
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
                const isZoneActive = record.status && record.status.toLowerCase() === 'active';
                const hasGoods = record.currentCapacity > 0;

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


    const goodsColumns = [
        {
            title: 'No.',
            key: 'serialNo',
            render: (text, record, index) => index + 1,
            width: '5%',
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (text) => <img src={text} alt="Product" style={{ width: 50, height: 50, borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/cccccc/ffffff?text=No+Image"; }} />,
            width: '10%',
        },
        { title: 'Item Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), width: '25%' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: '15%' },
        { title: 'Unit', dataIndex: 'unit', key: 'unit', width: '15%' },
        {
            title: 'Expiry Date',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'),
            sorter: (a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
            width: '20%'
        },
    ];

    const onChangePage = (page) => {
        setPageIndex(page)
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            placeholder="Filter by status"
                            value={statusFilter}
                            onChange={setStatusFilter}
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
                            disabled={remainingWarehouseCapacity <= 0}
                        >
                            Create New Zone
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredZones}
                        rowKey="_id"
                        // scroll={{ y: 230 }} 
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

                    <Pagination current={pageIndex} onChange={onChangePage} pageSize={10} total={totalItem} align="end" />
                </Space>
            </Card>

            {/* Create New Zone  */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Create New Zone</Title>}
                open={isCreateModalOpen}
                onCancel={handleCreateCancel}
                footer={null}
                destroyOnClose
                width={600}
                className="rounded-lg"
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    name="create_zone_form"
                    onFinish={handleCreateSubmit}
                    initialValues={{}}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item
                            label={<Text strong>Zone Name</Text>}
                            name="name"
                            rules={[
                                { required: true, message: 'Zone name is required.' },
                                { min: 3, message: 'Zone name must be at least 3 characters.' }
                            ]}
                            className="mb-4 md:col-span-2"
                        >
                            <Input placeholder="Enter zone name" className="rounded-md" />
                        </Form.Item>



                        <Form.Item
                            label={<Text strong>Min Storage Temperature (°C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Min temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter min temperature" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Max Storage Temperature (°C)</Text>}
                            name="storageTemperatureMax"
                            rules={[
                                { required: true, message: 'Max temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined || getFieldValue('storageTemperatureMin') === undefined) {
                                            return Promise.resolve();
                                        }
                                        if (value > getFieldValue('storageTemperatureMin')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Max temperature must be greater than or equal to min temperature.'));
                                    },
                                }),
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter max temperature" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Total Capacity</Text>}
                            name="totalCapacity"
                            rules={[
                                { required: true, message: 'Total capacity is required.' },
                                {
                                    type: 'number',
                                    min: 0,
                                    message: 'Please enter a non-negative number.',
                                    transform: (value) => value === '' ? null : Number(value)
                                },
                                // eslint-disable-next-line no-unused-vars
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === null || value === undefined || isNaN(value) || typeof value !== 'number') {
                                            return Promise.resolve();
                                        }
                                        if (value <= 0) {
                                            return Promise.reject(new Error('Capacity must be a positive number (greater than 0).'));
                                        }

                                        if (currentWarehouseTotalCapacity === 0 && !loading) {
                                            return Promise.reject(new Error("Unable to verify warehouse capacity. Please refresh the page and try again."));
                                        }

                                        const capacityOfCurrentZoneBeforeEdit = currentZone?.totalCapacity || 0;
                                        const totalCapacityOfOtherZones = allZonesTotalCapacity - capacityOfCurrentZoneBeforeEdit;

                                        const remainingWarehouseCapacityForThisZone = currentWarehouseTotalCapacity - totalCapacityOfOtherZones;

                                        if (value > remainingWarehouseCapacityForThisZone) {
                                            return Promise.reject(new Error(`Zone capacity (${value}) cannot exceed available capacity (${remainingWarehouseCapacityForThisZone}).`));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                            className="col-span-2 mb-6"
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="Enter total capacity"
                                className="rounded-md"
                                parser={value => value === '' ? null : Number(value)}
                                formatter={value => `${value}`}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className="flex justify-end mt-4">
                        <Space>
                            <Button onClick={handleCreateCancel} className="rounded-md">Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading} className="rounded-md">
                                Create Zone
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Zone  */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Edit Zone</Title>}
                open={isEditModalOpen}
                onCancel={handleEditCancel}
                footer={null}
                destroyOnClose
                width={600}
                className="rounded-lg"
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    name="edit_zone_form"
                    onFinish={handleEditSubmit}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item
                            label={<Text strong>Zone Name</Text>}
                            name="name"
                            rules={[
                                { required: true, message: 'Zone name is required.' },
                                { min: 3, message: 'Zone name must be at least 3 characters.' }
                            ]}
                            className="mb-4 md:col-span-2"
                        >
                            <Input placeholder="Enter zone name" className="rounded-md" />
                        </Form.Item>

                        <Form.Item name="warehouseId" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Min Storage Temperature (°C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Min temperature is required.' },
                                {
                                    validator: (_, value) => {
                                        if (value === null || value === undefined) {
                                            return Promise.resolve();
                                        }
                                        if (typeof value !== 'number' || isNaN(value)) {
                                            return Promise.reject(new Error('Please enter a valid number.'));
                                        }
                                        if (value < -100) return Promise.reject(new Error('Min temperature cannot be less than -100°C.'));
                                        if (value > 100) return Promise.reject(new Error('Min temperature cannot be greater than 100°C.'));
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            className="mb-4"
                        >
                            <InputNumber
                                min={-100}
                                max={100}
                                style={{ width: '100%' }}
                                placeholder="Enter min temperature"
                                className="rounded-md"
                                parser={value => value === '' ? null : Number(value)}
                                formatter={value => `${value}`}
                                onChange={() => editForm.validateFields(['storageTemperatureMax'])}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Max Storage Temperature (°C)</Text>}
                            name="storageTemperatureMax"
                            rules={[
                                { required: true, message: 'Max temperature is required.' },
                                {
                                    validator: (_, value) => {
                                        if (value === null || value === undefined) {
                                            return Promise.resolve();
                                        }
                                        if (typeof value !== 'number' || isNaN(value)) {
                                            return Promise.reject(new Error('Please enter a valid number.'));
                                        }
                                        if (value < -100) return Promise.reject(new Error('Max temperature cannot be less than -100°C.'));
                                        if (value > 100) return Promise.reject(new Error('Max temperature cannot be greater than 100°C.'));

                                        const minVal = editForm.getFieldValue('storageTemperatureMin');
                                        if (typeof minVal === 'number' && !isNaN(minVal) && value <= minVal) {
                                            return Promise.reject(new Error('Max temperature must be strictly greater than min temperature.'));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            className="mb-4"
                        >
                            <InputNumber
                                min={-100}
                                max={100}
                                style={{ width: '100%' }}
                                placeholder="Enter max temperature"
                                className="rounded-md"
                                parser={value => value === '' ? null : Number(value)}
                                formatter={value => `${value}`}
                                onChange={() => editForm.validateFields(['storageTemperatureMin'])}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Total Capacity</Text>}
                            name="totalCapacity"
                            rules={[
                                { required: true, message: 'Total capacity is required.' },
                                {
                                    type: 'number',
                                    min: 0,
                                    message: 'Please enter a non-negative number.',
                                    transform: (value) => value === '' ? null : Number(value)
                                },
                                // eslint-disable-next-line no-unused-vars
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === null || value === undefined || isNaN(value) || typeof value !== 'number') {
                                            return Promise.resolve();
                                        }
                                        if (value <= 0) {
                                            return Promise.reject(new Error('Capacity must be a positive number (greater than 0).'));
                                        }

                                        if (currentWarehouseTotalCapacity === 0 && !loading) {
                                            return Promise.reject(new Error("Unable to verify warehouse capacity. Please refresh the page and try again."));
                                        }

                                        const capacityOfCurrentZoneBeforeEdit = currentZone?.totalCapacity || 0;
                                        const totalCapacityOfOtherZones = allZonesTotalCapacity - capacityOfCurrentZoneBeforeEdit;

                                        const remainingWarehouseCapacityForThisZone = currentWarehouseTotalCapacity - totalCapacityOfOtherZones;

                                        if (value > remainingWarehouseCapacityForThisZone) {
                                            return Promise.reject(new Error(`Zone capacity (${value}) cannot exceed available capacity (${remainingWarehouseCapacityForThisZone}).`));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                            className="col-span-2 mb-6"
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="Enter total capacity"
                                className="rounded-md"
                                parser={value => value === '' ? null : Number(value)}
                                formatter={value => `${value}`}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className="flex justify-end mt-4">
                        <Space>
                            <Button onClick={handleEditCancel} className="rounded-md">Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading} className="rounded-md">
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

<ModalDetailZone isViewGoodsModalOpen={isViewGoodsModalOpen} handleViewGoodsCancel={handleViewGoodsCancel} currentZone={currentZone} goodsSearchTerm={goodsSearchTerm} setGoodsSearchTerm={setGoodsSearchTerm} filteredGoods={filteredGoods} goodsColumns={goodsColumns} />
            {/* View Goods in Zone Modal */}
   
        </div>
    );
};

export default ZoneManagement;

