import React, { useEffect, useState } from "react";
import {
    Table, Modal, Input, Typography, Spin,
} from 'antd';
const { Title, Text } = Typography;
import {
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useZoneItem } from "../../../../context/ZoneItemContext";

const ModalDetailZone = ({ isViewGoodsModalOpen, handleViewGoodsCancel, currentZone }) => {
    const {
        zoneItems,
        loading: zoneItemsLoading,
        getItemByZoneId, 
        zoneItemsTotal,
        zoneItemsPage,
        zoneItemsPageSize,
    } = useZoneItem();

    const [localGoodsSearchTerm, setLocalGoodsSearchTerm] = useState('');
    const [localFilteredGoods, setLocalFilteredGoods] = useState([]);

    useEffect(() => {
        if (isViewGoodsModalOpen && currentZone?._id) {
            getItemByZoneId(currentZone._id, zoneItemsPage, zoneItemsPageSize);
        }
        if (!isViewGoodsModalOpen) {
            setLocalGoodsSearchTerm('');
            setLocalFilteredGoods([]);
        }
    }, [isViewGoodsModalOpen, currentZone?._id, zoneItemsPage, zoneItemsPageSize]);

    useEffect(() => {
        let tempFiltered = [...zoneItems]; 
        if (localGoodsSearchTerm) {
            const lowerCaseSearchTerm = localGoodsSearchTerm.toLowerCase();
            tempFiltered = tempFiltered.filter(item =>
                item.itemId?.productId?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
                (item.itemId?.expiredDate && dayjs(item.itemId.expiredDate).format('DD/MM/YYYY').includes(lowerCaseSearchTerm)) ||
                item.quantity?.toString().includes(lowerCaseSearchTerm)
            );
        }
        setLocalFilteredGoods(tempFiltered);
    }, [zoneItems, localGoodsSearchTerm]);


    const goodsColumns = [
        {
            title: 'No.',
            key: 'serialNo',
            width: '5%',
            render: (text, record, index) => ((zoneItemsPage || 1) - 1) * (zoneItemsPageSize || 10) + index + 1,
        },
        {
            title: 'Product Name',
            dataIndex: ['itemId', 'productId', 'name'],
            key: 'productName',
            width: '25%',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity', 
            key: 'quantity',
            width: '10%',
            render: (text) => text !== undefined ? text : 'N/A'
        },
        {
            title: 'Weight',
            dataIndex: ['itemId', 'weights'], 
            key: 'weights',
            width: '10%',
            render: (text) => text !== undefined ? `${text} kg` : 'N/A'
        },
        {
            title: 'Expiry Date',
            dataIndex: ['itemId', 'expiredDate'],
            key: 'expiryDate',
            width: '20%',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
        },
        {
            title: 'Image',
            dataIndex: ['itemId', 'productId', 'image'],
            key: 'image',
            width: '10%',
            render: (imageUrl) => (
                imageUrl ?
                    <img src={imageUrl} alt="Product" className="w-12 h-12 object-cover rounded-md" onError={(e) => e.target.src = 'https://placehold.co/48x48/e0e0e0/000000?text=No+Img'} />
                    : <img src="https://placehold.co/48x48/e0e0e0/000000?text=No+Img" alt="No Image" className="w-12 h-12 object-cover rounded-md" />
            )
        },
    ];

    const handlePaginationChange = (page, pageSize) => {
        getItemByZoneId(currentZone._id, page, pageSize);
    };

    return (
        <Modal
            title={<Title level={4} className="text-center mb-6">Goods Details in Zone: {currentZone?.name || 'N/A'}</Title>}
            open={isViewGoodsModalOpen}
            onCancel={handleViewGoodsCancel}
            footer={null}
            destroyOnClose
            width={1000} 
            className="rounded-lg"
            centered
        >
            {zoneItemsLoading ? (
                <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
                    <Spin size="large" tip="Loading goods..." />
                </div>
            ) : (
                <div className="space-y-4">
                    <Input
                        placeholder="Search goods by Product Name, Expiry Date or Quantity"
                        value={localGoodsSearchTerm}
                        onChange={(e) => setLocalGoodsSearchTerm(e.target.value)}
                        prefix={<SearchOutlined />}
                        className="rounded-md mb-4"
                    />
                    {localFilteredGoods.length > 0 ? (
                        <Table
                            columns={goodsColumns}
                            dataSource={localFilteredGoods}
                            rowKey="_id" 
                            bordered
                            pagination={{
                                current: zoneItemsPage,
                                pageSize: zoneItemsPageSize,
                                total: zoneItemsTotal,
                                onChange: handlePaginationChange,
                                key: `${zoneItemsPage}-${zoneItemsPageSize}`
                            }}
                            scroll={{ y: 'calc(100vh - 400px)' }} 
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
    );
};

export default ModalDetailZone;
