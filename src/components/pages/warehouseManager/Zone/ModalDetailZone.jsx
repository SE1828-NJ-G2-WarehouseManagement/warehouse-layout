import React from "react";
import {
    Table, Card, Button, Modal, Form, Input, InputNumber, Space, Typography, Tag, Select,
    Tooltip, Popconfirm, Switch, Spin, Pagination, Row, Col, Progress, Statistic
} from 'antd';
const { Title, Text } = Typography;
import {
    PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ClusterOutlined
} from '@ant-design/icons';


const ModalDetailZone = ({ isViewGoodsModalOpen, handleViewGoodsCancel, currentZone, goodsSearchTerm, setGoodsSearchTerm, filteredGoods, goodsColumns }) => {
    return (
        <Modal
            title={<Title level={4} className="text-center mb-6">Goods Details in Zone: {currentZone?.name}</Title>}
            open={isViewGoodsModalOpen}
            onCancel={handleViewGoodsCancel}
            footer={null}
            destroyOnHidden
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
                        <>
                            <Table
                                columns={goodsColumns}
                                dataSource={filteredGoods}
                                rowKey="id"
                                bordered
                                pagination={true}
                                size="small"
                            />
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">No goods in this zone or no matching goods found.</Text>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default ModalDetailZone