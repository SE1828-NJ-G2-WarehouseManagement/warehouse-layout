import React from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, ArrowRight, Package } from 'lucide-react'; 

const ZoneList = () => {
  const zones = [
    { id: 'zone_a', name: 'Zone A (Electronics)', description: 'Contains electronic devices, computers, and components.', totalProducts: 500 },
    { id: 'zone_b', name: 'Zone B (Home Appliances)', description: 'Contains household appliances and kitchenware.', totalProducts: 320 },
    { id: 'zone_c', name: 'Zone C (Food)', description: 'Contains packaged food and beverages.', totalProducts: 800 },
    { id: 'zone_d', name: 'Zone D (Clothing)', description: 'Contains clothing and fashion accessories.', totalProducts: 450 },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg font-sans">
      <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-200">
        <Warehouse className="text-blue-600 size-8" />
        <h2 className="text-3xl font-bold text-gray-800">Warehouse Zone List</h2>
      </div>

      <p className="text-gray-600 mb-6">Select a zone to view the list of products inside.</p>

      {zones.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No zones are currently defined.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map(zone => (
            <Link
              to={`/zone/${zone.id}`}
              key={zone.id}
              className="block bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                  <Warehouse size={24} /> {zone.name}
                </h3>
                <ArrowRight className="text-blue-600 size-6" />
              </div>
              <p className="text-gray-700 text-sm mb-3">
                {zone.description}
              </p>
              <div className="flex items-center text-gray-600 text-sm">
                <Package size={16} className="mr-2" />
                <span>Total products: <span className="font-bold">{zone.totalProducts}</span></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZoneList;
