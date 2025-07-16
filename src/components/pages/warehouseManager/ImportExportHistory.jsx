import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, Space, Typography, Tag,
  Tooltip, message, DatePicker, Select
} from 'antd';
import {
  SearchOutlined, HistoryOutlined, FilterOutlined, SyncOutlined // HistoryOutlined for history
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// --- Mock Data ---
const initialTransactionHistory = [
  {
    id: 'TXN-001',
    type: 'Import',
    date: '2025-06-20',
    productName: 'Smart Watch Pro',
    quantity: 50,
    unit: 'pcs',
    staff: 'Warehouse Staff A',
    approvedByManager: true,
  },
  {
    id: 'TXN-002',
    type: 'Export',
    date: '2025-06-19',
    productName: 'Organic Coffee Beans',
    quantity: 100,
    unit: 'kg',
    staff: 'Warehouse Staff B',
    approvedByManager: true,
  },
  {
    id: 'TXN-003',
    type: 'Import',
    date: '2025-06-18',
    productName: 'Bluetooth Headphones',
    quantity: 75,
    unit: 'pcs',
    staff: 'Warehouse Staff A',
    approvedByManager: true,
  },
  {
    id: 'TXN-004',
    type: 'Export',
    date: '2025-05-15',
    productName: 'Ergonomic Office Chair',
    quantity: 10,
    unit: 'pcs',
    staff: 'Warehouse Staff C',
    approvedByManager: true,
  },
  {
    id: 'TXN-005',
    type: 'Import',
    date: '2025-05-10',
    productName: 'Stainless Steel Water Bottle',
    quantity: 200,
    unit: 'pcs',
    staff: 'Warehouse Staff B',
    approvedByManager: true,
  },
  {
    id: 'TXN-006',
    type: 'Export',
    date: '2025-04-25',
    productName: 'A4 Printer Paper',
    quantity: 50,
    unit: 'reams',
    staff: 'Warehouse Staff A',
    approvedByManager: true,
  },
  {
    id: 'TXN-007',
    type: 'Import',
    date: '2025-04-01',
    productName: 'Gaming Mouse',
    quantity: 25,
    unit: 'pcs',
    staff: 'Warehouse Staff C',
    approvedByManager: true,
  },
  {
    id: 'TXN-008',
    type: 'Export',
    date: '2025-03-10',
    productName: 'Gel Pens (Blue)',
    quantity: 150,
    unit: 'pcs',
    staff: 'Warehouse Staff B',
    approvedByManager: true,
  },
];

const ImportExportHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all'); // 'all', 'Import', 'Export'
  const [dateRangeFilter, setDateRangeFilter] = useState(null); // [dayjs, dayjs]
  const [loading, setLoading] = useState(false);
  const [noHistoryMessage, setNoHistoryMessage] = useState('');

  // --- Fetch Data (Simulated API Call) ---
  useEffect(() => {
    setLoading(true);
    setNoHistoryMessage(''); // Clear previous message
    // Simulate API call to fetch transaction history
    setTimeout(() => {
      // Simulate an error occasionally for testing purposes
      const simulateError = Math.random() < 0.1;
      if (simulateError) {
        setLoading(false);
        message.error('Unable to load transaction history. Please try again later.'); // Exception handling
        setNoHistoryMessage('Unable to load transaction history. Please try again later.');
        setTransactions([]); // Clear data on error
      } else {
        setTransactions(initialTransactionHistory);
        setLoading(false);
        if (initialTransactionHistory.length === 0) {
          setNoHistoryMessage('No transaction history available.'); // Alternative flow for no data
        }
      }
    }, 800);
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    let currentFiltered = transactions;

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(tx =>
        tx.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        tx.productName.toLowerCase().includes(lowerCaseSearchTerm) ||
        tx.staff.toLowerCase().includes(lowerCaseSearchTerm) ||
        tx.type.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by transaction type
    if (transactionTypeFilter !== 'all') {
      currentFiltered = currentFiltered.filter(tx => tx.type === transactionTypeFilter);
    }

    // Filter by date range (BR103)
    if (dateRangeFilter && dateRangeFilter.length === 2 && dateRangeFilter[0] && dateRangeFilter[1]) {
      const startDate = dateRangeFilter[0].startOf('day');
      const endDate = dateRangeFilter[1].endOf('day');
      currentFiltered = currentFiltered.filter(tx => {
        const txDate = dayjs(tx.date);
        return txDate.isSameOrAfter(startDate) && txDate.isSameOrBefore(endDate);
      });
    }

    setFilteredTransactions(currentFiltered);

    // Update no data message if filters result in no data
    if (currentFiltered.length === 0 && !loading) {
      if (transactions.length > 0) { // If there's data but filters block it
        setNoHistoryMessage('No transactions found matching your filter criteria.');
      } else if (!noHistoryMessage) { // Only set if initial fetch didn't set an error message
        setNoHistoryMessage('No transaction history available.');
      }
    } else {
      setNoHistoryMessage(''); // Clear message if data is found
    }
  }, [searchTerm, transactionTypeFilter, dateRangeFilter, transactions, loading]); // Added 'transactions' to dependency array

  // --- Reset Filters ---
  const handleResetFilters = () => {
    setSearchTerm('');
    setTransactionTypeFilter('all');
    setDateRangeFilter(null);
    setNoHistoryMessage(''); // Clear message
  };

  // --- Table Columns ---
  const columns = [
    {
      title: 'No.',
      key: 'serialNo',
      render: (text, record, index) => index + 1,
      width: '5%',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type) => {
        let color = type === 'Import' ? 'blue' : 'orange';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: '15%',
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      width: '25%',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (quantity, record) => `${quantity} ${record.unit}`,
    },
    {
      title: 'Warehouse Staff',
      dataIndex: 'staff',
      key: 'staff',
      width: '15%',
    },
    // BR102: Data Integrity Protection - No edit/delete actions
    // BR104: Filter Access Based on Role - This is assumed to be handled by backend.
    // For UI, we show all data mock here.
  ];

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
      <Title level={2} style={{ marginBottom: 30 }}><HistoryOutlined /> Import/Export History</Title>

      <Card
        className="shadow-xl rounded-lg border border-gray-100 mb-8"
        styles={{ body: { padding: '24px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full items-end">
            <Input
              placeholder="Search by ID, Product, or Staff"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              className="rounded-md"
            />
            <Select
              value={transactionTypeFilter}
              onChange={setTransactionTypeFilter}
              style={{ width: '100%' }}
              className="rounded-md"
            >
              <Option value="all">All Types</Option>
              <Option value="Import">Import</Option>
              <Option value="Export">Export</Option>
            </Select>
            <RangePicker
              value={dateRangeFilter}
              onChange={setDateRangeFilter}
              style={{ width: '100%' }}
              className="rounded-md"
              format="DD/MM/YYYY"
            />
            <Button
              type="default"
              onClick={handleResetFilters}
              icon={<SyncOutlined />}
              className="rounded-md md:col-span-1" // Adjusted for alignment
            >
              Reset Filters
            </Button>
          </div>

          {/* Table or No History Message */}
          {noHistoryMessage ? (
            <div className="text-center py-10">
              <Text type="secondary" className="text-lg">{noHistoryMessage}</Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredTransactions}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              bordered
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ImportExportHistory;
