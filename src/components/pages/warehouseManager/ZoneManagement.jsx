import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag,
    Tooltip, message, Popconfirm, Switch // Added Switch component
} from 'antd';
import {
    PlusOutlined, EditOutlined, EyeOutlined, SettingOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Import dayjs for date handling

const { Title, Text } = Typography;
const { Option } = Select;


// --- Placeholder Data ---
const initialZoneData = [
    {
        id: 'zone-001',
        name: 'Dry Goods A',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: 15,
        storageTemperatureMax: 25,
        totalCapacity: 500,
        currentCapacity: 120, // Has goods
        status: 'Active',
        goods: [
            { id: 'g001', name: 'Rice Bag', quantity: 50, unit: 'kg', imageUrl: 'https://placehold.co/60x60/FF5733/FFFFFF?text=Rice', expiryDate: '2025-12-31' },
            { id: 'g002', name: 'Pasta Box', quantity: 70, unit: 'pcs', imageUrl: 'https://placehold.co/60x60/33FF57/FFFFFF?text=Pasta', expiryDate: '2026-06-15' },
            { id: 'g007', name: 'Flour Bag', quantity: 100, unit: 'kg', imageUrl: 'https://placehold.co/60x60/ADD8E6/000000?text=Flour', expiryDate: '2025-10-01' },
        ],
    },
    {
        id: 'zone-002',
        name: 'Frozen B',
        warehouseId: 'wh-001',
        warehouseName: 'Main Warehouse',
        storageTemperatureMin: -18,
        storageTemperatureMax: -10,
        totalCapacity: 300,
        currentCapacity: 0, // No goods
        status: 'Inactive', // Inactive initially
        goods: [],
    },
    {
        id: 'zone-003',
        name: 'Hazardous C',
        warehouseId: 'wh-002',
        warehouseName: 'Secondary Warehouse',
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
        warehouseId: 'wh-002',
        warehouseName: 'Secondary Warehouse',
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
        warehouseId: 'wh-002',
        warehouseName: 'Secondary Warehouse',
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
        warehouseId: 'wh-002',
        warehouseName: 'Secondary Warehouse',
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
    { id: 'wh-002', name: 'Secondary Warehouse', status: 'Active' },
    { id: 'wh-003', name: 'Old Warehouse', status: 'Inactive' },
    { id: 'wh-004', name: 'New Distribution Center', status: 'Active' },
];

const ZoneManagement = () => {
    const [zones, setZones] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [filteredZones, setFilteredZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // For API calls
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViewGoodsModalVisible, setIsViewGoodsModalVisible] = useState(false);
    const [currentZone, setCurrentZone] = useState(null); // For edit/view goods
    const [goodsSearchTerm, setGoodsSearchTerm] = useState(''); // State for goods search in modal
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // --- Fetch Data (Placeholder for API calls) ---
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Filter zones by active status by default (BR38)
            setZones(initialZoneData.filter(zone => zone.status === 'Active'));
            // Only active warehouses
            setWarehouses(initialWarehouseData.filter(wh => wh.status === 'Active'));
            setLoading(false);
        }, 500);
    }, []);

    // --- Zone Filtering Logic (BR39) ---
    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = zones.filter(zone =>
            zone.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            zone.warehouseName.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredZones(filtered);
    }, [searchTerm, zones]);

    // --- Modal Handlers ---
    const showCreateModal = () => {
        createForm.resetFields();
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
            // Backend validation for BR34 (Unique zone name)
            if (zones.some(z => z.name === values.name && z.warehouseId === values.warehouseId)) {
                message.error('Zone name must be unique within the same warehouse.');
                setLoading(false);
                return;
            }
            // Ant Design Form rules handle required fields and numeric/range validations (BR36, BR41, BR42)

            // Simulate success
            const newZone = {
                id: `zone-${Date.now()}`, // temporary ID
                ...values,
                currentCapacity: 0, // New zone starts with 0 current capacity
                status: 'Active', // New zones are typically active by default
                warehouseName: warehouses.find(wh => wh.id === values.warehouseId)?.name || 'N/A',
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
            warehouseId: zone.warehouseId,
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
            // Backend validation for BR34 (Unique zone name)
            if (zones.some(z => z.id !== currentZone.id && z.name === values.name && z.warehouseId === values.warehouseId)) {
                message.error('Zone name must be unique within the same warehouse.');
                setLoading(false);
                return;
            }
            // Ant Design Form rules handle required fields and numeric/range validations (BR41, BR42)

            // Simulate update
            setZones(prev => prev.map(zone =>
                zone.id === currentZone.id
                    ? { ...zone, ...values, warehouseName: warehouses.find(wh => wh.id === values.warehouseId)?.name || 'N/A' }
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

            // BR43: Prevent inactivation with active inventory
            if (newStatus === 'Inactive' && zone.currentCapacity > 0) {
                message.error('Cannot set zone to Inactive: Active goods still exist in this zone.');
                setLoading(false);
                // Important: Revert the switch state visually if the action is blocked
                setZones(prev => prev.map(z =>
                    z.id === zone.id ? { ...z, status: 'Active' } : z // Revert to Active
                ));
                return;
            }

            // Simulate API call
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
        setGoodsSearchTerm(''); // Reset search term when opening modal
        setIsViewGoodsModalVisible(true);
    };

    const handleViewGoodsCancel = () => {
        setIsViewGoodsModalVisible(false);
        setCurrentZone(null);
        setGoodsSearchTerm(''); // Ensure search term is reset on modal close
    };

    // --- Goods Filtering Logic in modal ---
    const filteredGoods = currentZone?.goods.filter(item =>
        item.name.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(goodsSearchTerm.toLowerCase()) ||
        (item.expiryDate && dayjs(item.expiryDate).format('DD/MM/YYYY').includes(goodsSearchTerm))
    ) || [];

    // --- Main Table Columns ---
    const columns = [
        {
            title: 'No.', // New column for serial number
            key: 'serialNo',
            render: (text, record, index) => index + 1,
            width: '5%',
        },
        {
            title: 'Zone Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name), // BR39
            width: '20%',
        },
        {
            title: 'Warehouse',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            width: '25%',
        },
        {
            title: 'Storage Temp (°C)',
            key: 'temperature',
            render: (_, record) => `${record.storageTemperatureMin}°C - ${record.storageTemperatureMax}°C`,
            width: '15%',
        },
        {
            title: 'Capacity (Total/Current)',
            key: 'capacity',
            render: (_, record) => `${record.currentCapacity}/${record.totalCapacity}`,
            width: '15%',
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
            width: '15%',
            render: (_, record) => (
                <Space size="small"> {/* Use smaller space for better compactness */}
                    <Tooltip title="View Goods Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => showViewGoodsModal(record)}
                            type="text" // Make it an icon-only button
                        />
                    </Tooltip>
                    <Tooltip title="Edit Zone">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                            type="text" // Make it an icon-only button
                        />
                    </Tooltip>

                    {/* Status Toggle (Switch) with Popconfirm for Deactivation */}
                    {record.status === 'Active' ? (
                        <Popconfirm
                            title="Deactivate Zone?"
                            description={record.currentCapacity > 0 ? "Cannot deactivate: Active goods still exist in this zone." : "Are you sure to deactivate this zone?"}
                            onConfirm={() => handleChangeStatus(record, false)} // False for Inactive
                            okText="Yes"
                            cancelText="No"
                            disabled={record.currentCapacity > 0} // Disable if BR43 applies
                        >
                            <Tooltip title={record.currentCapacity > 0 ? "Cannot deactivate with active inventory" : "Click to Deactivate Zone"}>
                                <Switch
                                    checked={record.status === 'Active'}
                                    disabled={record.currentCapacity > 0}
                                    // Removed checkedChildren and unCheckedChildren for icon-only toggle
                                    style={{ backgroundColor: record.currentCapacity > 0 ? '#d9d9d9' : 'green' }} // Grey if disabled, green if active
                                />
                            </Tooltip>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Activate Zone?"
                            description="Are you sure to activate this zone?"
                            onConfirm={() => handleChangeStatus(record, true)} // True for Active
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Click to Activate Zone">
                                <Switch
                                    checked={record.status === 'Active'}
                                    // Removed checkedChildren and unCheckedChildren for icon-only toggle
                                    style={{ backgroundColor: 'red' }} // Red if inactive
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
            title: 'No.', // New column for serial number
            key: 'serialNo',
            render: (text, record, index) => index + 1,
            width: '5%',
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (text) => <img src={text} alt="Product" style={{ width: 50, height: 50, borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/cccccc/ffffff?text=No+Img"; }} />,
            width: '10%',
        },
        { title: 'Item Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), width: '25%' }, // Added width
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: '15%' }, // Added width
        { title: 'Unit', dataIndex: 'unit', key: 'unit', width: '15%' }, // Added width
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
            <Title level={2} style={{ marginBottom: 30 }}>Zone Management</Title>
            <Card
                className="shadow-xl rounded-lg border border-gray-100 mb-8"
                styles={{ body: { padding: '24px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Input
                            placeholder="Search by Zone Name or Warehouse"
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
                        storageTemperatureMin: 0,
                        storageTemperatureMax: 10,
                        totalCapacity: 100,
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item
                            label={<Text strong>Zone Name</Text>}
                            name="name"
                            rules={[
                                { required: true, message: 'Required.' },
                                { min: 3, message: 'Min 3 chars.' }
                            ]}
                            className="mb-4"
                        >
                            <Input placeholder="Enter zone name" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Select Warehouse</Text>}
                            name="warehouseId"
                            rules={[{ required: true, message: 'Required.' }]}
                            className="mb-4"
                        >
                            <Select placeholder="Select a warehouse" className="rounded-md">
                                {warehouses.map(wh => (
                                    <Option key={wh.id} value={wh.id}>{wh.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Storage Temperature (Min °C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Required.' },
                                { type: 'number', message: 'Number only.' },
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
                                { required: true, message: 'Required.' },
                                { type: 'number', message: 'Number only.' },
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
                                        return Promise.reject(new Error('Max ≥ Min.'));
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
                                { required: true, message: 'Required.' },
                                { type: 'number', min: 0, message: 'Non-negative number only.' },
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
                                { required: true, message: 'Required.' },
                                { min: 3, message: 'Min 3 chars.' }
                            ]}
                            className="mb-4"
                        >
                            <Input placeholder="Enter zone name" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Select Warehouse</Text>}
                            name="warehouseId"
                            rules={[{ required: true, message: 'Required.' }]}
                            className="mb-4"
                        >
                            <Select placeholder="Select a warehouse" className="rounded-md">
                                {warehouses.map(wh => (
                                    <Option key={wh.id} value={wh.id}>{wh.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Storage Temperature (Min °C)</Text>}
                            name="storageTemperatureMin"
                            rules={[
                                { required: true, message: 'Required.' },
                                { type: 'number', message: 'Number only.' },
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
                                { required: true, message: 'Required.' },
                                { type: 'number', message: 'Number only.' },
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
                                        return Promise.reject(new Error('Max ≥ Min.'));
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
                                { required: true, message: 'Required.' },
                                { type: 'number', min: 0, message: 'Non-negative number only.' },
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

            {/* View Goods in Zone Modal */}
            <Modal
                title={<Title level={4} className="text-center mb-6">Goods in Zone: {currentZone?.name || ''}</Title>}
                visible={isViewGoodsModalVisible}
                onCancel={handleViewGoodsCancel}
                footer={null}
                width={900}
                className="rounded-lg"
            >
                {currentZone && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2"> {/* Responsive grid for info */}
                            <div><Text strong>Total Capacity:</Text> {currentZone.totalCapacity} unit(s)</div>
                            <div><Text strong>Currently Stored:</Text> {currentZone.currentCapacity} unit(s)</div>
                            <div><Text strong>Storage Temperature:</Text> {currentZone.storageTemperatureMin}°C - {currentZone.storageTemperatureMax}°C</div>
                        </div>
                    </div>
                )}
                <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Input
                        placeholder="Search by Item Name, Unit, or Expiry Date (DD/MM/YYYY)"
                        value={goodsSearchTerm}
                        onChange={(e) => setGoodsSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                        className="rounded-md"
                    />
                </Space>
                {currentZone && currentZone.goods && currentZone.goods.length > 0 ? (
                    <Table
                        columns={goodsColumns}
                        dataSource={filteredGoods}
                        rowKey="id"
                        pagination={{ pageSize: 5, showSizeChanger: false }}
                        bordered
                        size="small"
                        className="rounded-lg"
                    />
                ) : (
                    <Text type="secondary" className="block text-center mt-4">No goods found in this zone.</Text>
                )}
            </Modal>
        </div>
    );
};

export default ZoneManagement;
