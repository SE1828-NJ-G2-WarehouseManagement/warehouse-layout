import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag,
  Tooltip, message, Popconfirm, Switch 
} from 'antd';
import {
  PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ClusterOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs'; 

const { Title, Text } = Typography;
const { Option } = Select;

const initialZoneData = [
    {
        id: 'zone-003',
        name: 'Hazardous C',
        warehouseId: 'wh-001', // Adjusted to belong to the same warehouse
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 10,
        storageTemperatureMax: 30,
        totalCapacity: 200,
        currentCapacity: 150, // Has goods
        status: 'Active',
        goods: [
            { id: 'g003', name: 'Chemical X', quantity: 100, unit: 'L', imageUrl: 'https://placehold.co/60x60/3366FF/FFFFFF?text=Chem', expiryDate: '2024-11-20' },
            { id: 'g004', name: 'Flammable Y', quantity: 50, unit: 'g', imageUrl: 'https://placehold.co/60x60/FF33FF/FFFFFF?text=Flam', expiryDate: '2025-01-01' },
        ],
    },
    {
        id: 'zone-004',
        name: 'Dry Goods B',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 15,
        storageTemperatureMax: 25,
        totalCapacity: 400,
        currentCapacity: 200, // Has goods
        status: 'Active',
        goods: [
            { id: 'g005', name: 'Sugar Bag', quantity: 100, unit: 'kg', imageUrl: 'https://placehold.co/60x60/FFA500/FFFFFF?text=Sugar', expiryDate: '2026-03-01' },
            { id: 'g008', name: 'Salt Pack', quantity: 75, unit: 'g', imageUrl: 'https://placehold.co/60x60/C0C0C0/000000?text=Salt', expiryDate: '2026-09-20' },
        ],
    },
    {
        id: 'zone-005',
        name: 'Chilled D',
        warehouseId: 'wh-001', // Adjusted to belong to the same warehouse
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 0,
        storageTemperatureMax: 5,
        totalCapacity: 100,
        currentCapacity: 80, // Has goods
        status: 'Active',
        goods: [
            { id: 'g006', name: 'Dairy Product', quantity: 80, unit: 'pcs', imageUrl: 'https://placehold.co/60x60/800080/FFFFFF?text=Dairy', expiryDate: '2024-07-20' },
            { id: 'g009', name: 'Fresh Vegetables', quantity: 30, unit: 'kg', imageUrl: 'https://placehold.co/60x60/8FBC8F/FFFFFF?text=Veg', expiryDate: '2025-01-10' },
        ],
    },
    {
        id: 'zone-006',
        name: 'Empty Zone',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 10,
        storageTemperatureMax: 20,
        totalCapacity: 100,
        currentCapacity: 0, // No goods, can be deactivated
        status: 'Active',
        goods: [],
    },
    {
        id: 'zone-007',
        name: 'Temperature Controlled A',
        warehouseId: 'wh-001', // Adjusted to belong to the same warehouse
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 5,
        storageTemperatureMax: 10,
        totalCapacity: 150,
        currentCapacity: 50,
        status: 'Active',
        goods: [
            { id: 'g010', name: 'Chocolate Bars', quantity: 200, unit: 'pcs', imageUrl: 'https://placehold.co/60x60/8B4513/FFFFFF?text=Choco', expiryDate: '2025-05-01' },
        ],
    },
    {
        id: 'zone-008',
        name: 'Oversized Items',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 0,
        storageTemperatureMax: 40,
        totalCapacity: 1000,
        currentCapacity: 0,
        status: 'Active',
        goods: [],
    },
    {
        id: 'zone-009',
        name: 'Fragile Goods',
        warehouseId: 'wh-001', // Adjusted to belong to the same warehouse
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 18,
        storageTemperatureMax: 22,
        totalCapacity: 75,
        currentCapacity: 10,
        status: 'Active',
        goods: [
            { id: 'g011', name: 'Glassware Set', quantity: 10, unit: 'sets', imageUrl: 'https://placehold.co/60x60/B0E0E6/000000?text=Glass', expiryDate: '2027-12-31' },
        ],
    },
    {
        id: 'zone-010',
        name: 'Perishable Goods',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 2,
        storageTemperatureMax: 8,
        totalCapacity: 120,
        currentCapacity: 90,
        status: 'Active',
        goods: [
            { id: 'g012', name: 'Fresh Fruits', quantity: 50, unit: 'kg', imageUrl: 'https://placehold.co/60x60/FFD700/000000?text=Fruits', expiryDate: '2024-07-05' },
            { id: 'g013', name: 'Yogurt Cups', quantity: 40, unit: 'pcs', imageUrl: 'https://placehold.co/60x60/E6E6FA/000000?text=Yogurt', expiryDate: '2024-06-28' }, // Near expiry / Expired for testing
        ],
    },
];

const initialWarehouseData = [
    { id: 'wh-001', name: 'Main Warehouse', status: 'Active' },
];

const ZoneManagement = () => {
    const [zones, setZones] = useState([]);
    const [filteredZones, setFilteredZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // For API call
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViewGoodsModalVisible, setIsViewGoodsModalVisible] = useState(false);
    const [currentZone, setCurrentZone] = useState(null);
    const [goodsSearchTerm, setGoodsSearchTerm] = useState(''); 
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setZones(initialZoneData.filter(zone => zone.status === 'Active'));
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = zones.filter(zone =>
            zone.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredZones(filtered);
    }, [searchTerm, zones]);

    const showCreateModal = () => {
        createForm.resetFields();
        createForm.setFieldsValue({ warehouseId: initialWarehouseData[0].id });
        setIsCreateModalVisible(true);
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    const handleCreateSubmit = async (values) => {
        setLoading(true);
        try {
            console.log('Creating Zone:', values);
            if (zones.some(z => z.name === values.name)) {
                message.error('Zone name must be unique within the warehouse.');
                setLoading(false);
                return;
            }
            const newZone = {
                id: `zone-${Date.now()}`,
                ...values,
                warehouseId: initialWarehouseData[0].id,
                warehouseName: initialWarehouseData[0].name, 
                currentCapacity: 0,
                status: 'Active', 
                goods: [],
            };
            setZones(prev => [...prev, newZone]);
            message.success('Zone created successfully!');
            setIsCreateModalVisible(false);
            createForm.resetFields();
        } catch (error) {
            console.error('Failed to create zone:', error);
            message.error(error.message || 'Failed to create zone. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showEditModal = (zone) => {
        setCurrentZone(zone);
        editForm.setFieldsValue({
            name: zone.name,
            storageTemperatureMin: zone.storageTemperatureMin,
            storageTemperatureMax: zone.storageTemperatureMax,
            totalCapacity: zone.totalCapacity,
        });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setCurrentZone(null);
        editForm.resetFields();
    };

    const handleEditSubmit = async (values) => {
        setLoading(true);
        try {
            console.log('Editing Zone:', currentZone.id, values);
            if (zones.some(z => z.id !== currentZone.id && z.name === values.name)) {
                message.error('Zone name must be unique within the warehouse.');
                setLoading(false);
                return;
            }
            setZones(prev => prev.map(zone =>
                zone.id === currentZone.id
                    ? { ...zone, ...values, warehouseId: currentZone.warehouseId, warehouseName: currentZone.warehouseName } // Keep warehouse ID and name
                    : zone
            ));
            message.success('Zone updated successfully!');
            setIsEditModalVisible(false);
            setCurrentZone(null);
            editForm.resetFields();
        } catch (error) {
            console.error('Failed to edit zone:', error);
            message.error(error.message || 'Failed to update zone. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (zone, checked) => {
        const newStatus = checked ? 'Active' : 'Inactive';
        setLoading(true);
        try {
            console.log(`Changing status of zone ${zone.name} to ${newStatus}`);

            if (newStatus === 'Inactive' && zone.currentCapacity > 0) {
                message.error('Cannot set zone to Inactive: Active goods still exist in this zone.');
                setLoading(false);
               
                setZones(prev => prev.map(z =>
                    z.id === zone.id ? { ...z, status: 'Active' } : z 
                ));
                return;
            }

            setZones(prev => prev.map(z =>
                z.id === zone.id ? { ...z, status: newStatus } : z
            ));
            message.success(`Zone status updated to ${newStatus}!`);
        } catch (error) {
            console.error('Failed to change zone status:', error);
            message.error(error.message || 'Zone status update failed due to a system error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const showViewGoodsModal = (zone) => {
        setCurrentZone(zone);
        setGoodsSearchTerm(''); 
        setIsViewGoodsModalVisible(true);
    };

    const handleViewGoodsCancel = () => {
        setIsViewGoodsModalVisible(false);
        setCurrentZone(null);
        setGoodsSearchTerm(''); 
    };

    const filteredGoods = currentZone?.goods.filter(item =>
        item.name.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        (item.expiryDate && dayjs(item.expiryDate).format('DD/MM/YYYY').includes(goodsSearchTerm))
    ) || [];

    // --- Main Table Columns ---
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
            sorter: (a, b) => a.name.localeCompare(b.name), // BR39
            width: '25%',
        },
        {
            title: 'Storage Temp (°C)',
            key: 'temperature',
            render: (_, record) => `${record.storageTemperatureMin}°C - ${record.storageTemperatureMax}°C`,
            width: '20%',
        },
        {
            title: 'Capacity (Total/Current)',
            key: 'capacity',
            render: (_, record) => `${record.currentCapacity}/${record.totalCapacity}`,
            width: '20%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
            width: '10%',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '20%', 
            render: (_, record) => (
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

                    {/* Status Toggle (Switch) with Popconfirm for Deactivation */}
                    {record.status === 'Active' ? (
                        <Popconfirm
                            title="Deactivate Zone?"
                            description={record.currentCapacity > 0 ? "Cannot deactivate: Active goods still exist in this zone." : "Are you sure to deactivate this zone?"}
                            onConfirm={() => handleChangeStatus(record, false)} 
                            okText="Yes"
                            cancelText="No"
                            disabled={record.currentCapacity > 0} 
                        >
                            <Tooltip title={record.currentCapacity > 0 ? "Cannot deactivate with active inventory" : "Click to Deactivate Zone"}>
                                <Switch
                                    checked={record.status === 'Active'}
                                    disabled={record.currentCapacity > 0}
                                    style={{ backgroundColor: record.currentCapacity > 0 ? '#d9d9d9' : 'green' }} 
                                />
                            </Tooltip>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Activate Zone?"
                            description="Are you sure to activate this zone?"
                            onConfirm={() => handleChangeStatus(record, true)} 
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Click to Activate Zone">
                                <Switch
                                    checked={record.status === 'Active'}
                                    style={{ backgroundColor: 'red' }} 
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    // --- Goods Table Columns (for View Goods Modal) ---
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

    return (
        <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
            <Title level={2} style={{ marginBottom: 30 }}><ClusterOutlined /> Zone Management</Title> 
            <Card
                className="shadow-xl rounded-lg border border-gray-100 mb-8"
                styles={{ body: { padding: '24px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Input
                            placeholder="Search by Zone Name" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={showCreateModal}
                        >
                            Create New Zone
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredZones}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        bordered
                    />
                </Space>
            </Card>

            {/* Create Zone Modal */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Create New Zone</Title>}
                visible={isCreateModalVisible}
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
                    initialValues={{
                        warehouseId: initialWarehouseData[0].id, 
                    }}
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

                        {/* Removed Select Warehouse */}
                        <Form.Item name="warehouseId" hidden>
                            <Input />
                        </Form.Item>


                        <Form.Item
                            label={<Text strong>Storage Temperature (Min °C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Minimum temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                                { min: -100, message: 'Min: -100°C.' },
                                { max: 100, message: 'Max: 100°C.' },
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter min temp" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Storage Temperature (Max °C)</Text>}
                            name="storageTemperatureMax"
                            rules={[
                                { required: true, message: 'Maximum temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                                { min: -100, message: 'Min: -100°C.' },
                                { max: 100, message: 'Max: 100°C.' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined || getFieldValue('storageTemperatureMin') === undefined) {
                                            return Promise.resolve();
                                        }
                                        if (value >= getFieldValue('storageTemperatureMin')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Max temperature must be greater than or equal to min temperature.'));
                                    },
                                }),
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter max temp" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Total Capacity</Text>}
                            name="totalCapacity"
                            rules={[
                                { required: true, message: 'Total capacity is required.' },
                                { type: 'number', min: 0, message: 'Please enter a non-negative number.' },
                            ]}
                            className="col-span-2 mb-6"
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter total capacity" className="rounded-md" />
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

            {/* Edit Zone Modal */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Edit Zone</Title>}
                visible={isEditModalVisible}
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
                    initialValues={currentZone}
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

                        {/* Removed Select Warehouse from Edit Modal */}
                        <Form.Item name="warehouseId" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Storage Temperature (Min °C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Minimum temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                                { min: -100, message: 'Min: -100°C.' },
                                { max: 100, message: 'Max: 100°C.' },
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter min temp" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Storage Temperature (Max °C)</Text>}
                            name="storageTemperatureMax"
                            rules={[
                                { required: true, message: 'Maximum temperature is required.' },
                                { type: 'number', message: 'Please enter a number.' },
                                { min: -100, message: 'Min: -100°C.' },
                                { max: 100, message: 'Max: 100°C.' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined || getFieldValue('storageTemperatureMin') === undefined) {
                                            return Promise.resolve();
                                        }
                                        if (value >= getFieldValue('storageTemperatureMin')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Max temperature must be greater than or equal to min temperature.'));
                                    },
                                }),
                            ]}
                            className="mb-4"
                        >
                            <InputNumber min={-100} max={100} style={{ width: '100%' }} placeholder="Enter max temp" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Total Capacity</Text>}
                            name="totalCapacity"
                            rules={[
                                { required: true, message: 'Total capacity is required.' },
                                { type: 'number', min: 0, message: 'Please enter a non-negative number.' },
                            ]}
                            className="col-span-2 mb-6"
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter total capacity" className="rounded-md" />
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

            {/* View Goods Details Modal */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Goods Details in Zone: {currentZone?.name}</Title>}
                visible={isViewGoodsModalVisible}
                onCancel={handleViewGoodsCancel}
                footer={null}
                destroyOnClose
                width={800}
                className="rounded-lg"
            >
                {currentZone && (
                    <div className="space-y-4">
                        <Input
                            placeholder="Search goods by Name, Unit or Expiry Date"
                            value={goodsSearchTerm}
                            onChange={(e) => setGoodsSearchTerm(e.target.value)}
                            prefix={<SearchOutlined />}
                            className="rounded-md mb-4"
                        />
                        {filteredGoods.length > 0 ? (
                            <Table
                                columns={goodsColumns}
                                dataSource={filteredGoods}
                                rowKey="id"
                                pagination={{ pageSize: 5, showSizeChanger: false }}
                                bordered
                                size="small"
                            />
                        ) : (
                            <div className="text-center py-8">
                                <Text type="secondary">No goods in this zone or no matching goods found.</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ZoneManagement;
