import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    // These icons are now inline SVGs, no longer imported from lucide-react
} from 'antd'; // Keeping Ant Design imports for Table, Card, Button, Modal, etc., if needed elsewhere, though not used in this specific Dashboard component.
import ReportService from '../../../services/reportService';


function formatDateToDDMMYYYY(dateString, date) {
  if (!dateString && !date) return "";
  if (!dateString) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
  }
  const [year, month, day] = dateString.split('-') || '';
  return `${day}/${month}/${year}`;
}

// Inline SVG Icons (equivalent to lucide-react icons)
const PackageIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8.03V19l-8 4-8-4V8.03l8-4 8 4Z" />
    <path d="m3.27 6.13 8 4 8-4" />
    <path d="M12 22V12" />
  </svg>
);

const ShoppingCartIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
    <path d="M2 2h3.28l2.58 12.18A2 2 0 0 0 9.86 16h8.28a2 2 0 0 0 1.93-1.46L22 6H5" />
  </svg>
);

const FileTextIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const AlertTriangleIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

const CalendarDaysIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const LayoutGridIcon = ({ size = 24, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);


const MonthlyBarChart = ({ data, dataKey, name, color, title }) => (
  
  <div className="bg-white p-6 rounded-2xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} />
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
        <Bar dataKey={dataKey} name={name} fill={color} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [filteredStats, setFilteredStats] = useState({
    products: 0,
    imports: 0,
    exports: 0,
    expired: 0,
    zones: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const reportService = new ReportService();

  const getReports = async () => {
    const date = formatDateToDDMMYYYY(selectedDate, new Date());
    const data = await reportService.getReports(date);
    setFilteredStats(data.totalAnalysis);
    setMonthlyStats(data.monthlyAnalysis);
  }

  useEffect(() => {
    getReports();
  }, [selectedDate]);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center space-x-3">
        <label htmlFor="date" className="font-medium text-gray-700 text-base flex items-center gap-2">
          <CalendarDaysIcon size={20} className="text-blue-500" />
          Select date:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Products" value={filteredStats.products} colorClass="from-green-500 to-green-600" icon={<PackageIcon size={32} />} />
        <StatCard title="Imports" value={filteredStats.imports} colorClass="from-blue-500 to-blue-600" icon={<ShoppingCartIcon size={32} />} />
        <StatCard title="Exports" value={filteredStats.exports} colorClass="from-orange-500 to-orange-600" icon={<FileTextIcon size={32} />} />
        <StatCard title="Expired" value={filteredStats.expired} colorClass="from-red-500 to-red-600" icon={<AlertTriangleIcon size={32} />} />
        <StatCard title="Total Zones" value={filteredStats.zones} colorClass="from-purple-500 to-purple-600" icon={<LayoutGridIcon size={32} />} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Monthly Warehouse Statistics Chart</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MonthlyBarChart
            data={monthlyStats}
            dataKey="products"
            name="Total Products"
            color="#4CAF50"
            title="Total Products by Month"
          />
          <MonthlyBarChart
            data={monthlyStats}
            dataKey="imports"
            name="Imports"
            color="#2196F3"
            title="Imports by Month"
          />
          <MonthlyBarChart
            data={monthlyStats}
            dataKey="exports"
            name="Exports"
            color="#FF9800"
            title="Exports by Month"
          />
          <MonthlyBarChart
            data={monthlyStats}
            dataKey="expired"
            name="Expired"
            color="#F44336"
            title="Expired Products by Month"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, colorClass }) => (
  <div
    className={`bg-gradient-to-br ${colorClass} text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform duration-200`}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-white/90 text-sm mt-1">{title}</div>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

export default Dashboard;
