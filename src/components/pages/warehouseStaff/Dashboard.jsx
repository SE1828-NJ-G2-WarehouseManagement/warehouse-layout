import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  FileText,
  AlertTriangle,
  CalendarDays,
  LayoutGrid
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardStats } from "../../../config/mockData";

const generateMonthlyData = () => {
  const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
  return months.map(month => ({
    month,
    products: Math.floor(Math.random() * 500) + 100,
    imports: Math.floor(Math.random() * 100) + 20,
    exports: Math.floor(Math.random() * 80) + 10,
    expired: Math.floor(Math.random() * 20) + 1,
  }));
};

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
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredStats, setFilteredStats] = useState({
    products: 0,
    imports: 0,
    exports: 0,
    expired: 0,
    zones: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => {
    const stats = dashboardStats.filterByDate
      ? dashboardStats.filterByDate(selectedDate)
      : {
          products: 100,
          imports: 20,
          exports: 10,
          expired: 5,
          zones: 8,
        };
    setFilteredStats(stats);
  }, [selectedDate]);

  useEffect(() => {
    setMonthlyStats(generateMonthlyData());
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center space-x-3">
        <label htmlFor="date" className="font-medium text-gray-700 text-base flex items-center gap-2">
          <CalendarDays size={20} className="text-blue-500" />
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
        <StatCard title="Total Products" value={filteredStats.products} colorClass="from-green-500 to-green-600" icon={<Package size={32} />} />
        <StatCard title="Imports" value={filteredStats.imports} colorClass="from-blue-500 to-blue-600" icon={<ShoppingCart size={32} />} />
        <StatCard title="Exports" value={filteredStats.exports} colorClass="from-orange-500 to-orange-600" icon={<FileText size={32} />} />
        <StatCard title="Expired" value={filteredStats.expired} colorClass="from-red-500 to-red-600" icon={<AlertTriangle size={32} />} />
        <StatCard title="Total Zones" value={filteredStats.zones} colorClass="from-purple-500 to-purple-600" icon={<LayoutGrid size={32} />} />
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
