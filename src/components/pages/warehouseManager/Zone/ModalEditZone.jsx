import React from "react";
import {
    Table, Card, Button, Modal, Form, Input, InputNumber, Space, Typography, Tag, Select,
    Tooltip, Popconfirm, Switch, Spin, Pagination, Row, Col, Progress, Statistic
} from 'antd';
const { Title, Text } = Typography;
import {
    PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ClusterOutlined
} from '@ant-design/icons';


const ModalEditZone = ({ isEditModalOpen, handleEditCancel, editForm, handleEditSubmit, currentWarehouseTotalCapacity, loading, currentZone, allZonesTotalCapacity, zones }) => {
    return (
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
                            { min: 3, message: 'Zone name must be at least 3 characters.' },
                            // eslint-disable-next-line no-unused-vars
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise?.resolve(); 
                                    }
                                    const isDuplicate = zones?.some(
                                        (zone) => zone?.name?.toLowerCase() === value?.toLowerCase()
                                    );
                                    if (isDuplicate) {
                                        return Promise?.reject(new Error('Zone name must be unique.'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
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
    )
}

export default ModalEditZone