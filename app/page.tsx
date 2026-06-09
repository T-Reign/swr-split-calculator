'use client'; 
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

// Data defined outside the component
const splitData = [
  { location: 'Clapham Junction', fare: '', saving: '', type: 'positive' },
  { location: 'Wimbledon', fare: '', saving: '', type: 'positive' },
  { location: 'Surbiton', fare: '', saving: '', type: 'positive' },
  { location: 'Woking', fare: '£39.30', saving: '- £0.40', type: 'positive' },
  { location: 'Basingstoke', fare: '£39.70', saving: '- £0.80', type: 'positive' },
  { location: 'Winchester', fare: '£35.20', saving: '+ £3.70', type: 'negative' },
  { location: 'Shawford', fare: '£33.20', saving: '+ £5.70', type: 'negative' },
  { location: 'Eastleigh', fare: '£55.40', saving: '- £16.50', type: 'positive' },
  { location: 'Southampton Airport Parkway', fare: '£62.10', saving: '- £0.40', type: 'positive' },
  { location: 'St Denys', fare: '£60.80', saving: '- £21.90', type: 'positive' },
];

const chartData = [
  { name: 'Clapham Junction', fare: 0 },
  { name: 'Wimbledon', fare: 0 },
  { name: 'Surbiton', fare: 0 },
  { name: 'Woking', fare: 39.30 },
  { name: 'Basingstoke', fare: 39.70 },
  { name: 'Winchester', fare: 35.20 },
  { name: 'Shawford', fare: 33.20 },
  { name: 'Eastleigh', fare: 55.40 },
  { name: 'SOA', fare: 62.10 },
  { name: 'St Denys', fare: 60.80 },
];

const filteredChartData = chartData.filter((entry) => entry.fare > 0);
const maxFare = Math.max(...filteredChartData.map((entry) => entry.fare));
const yMin = 10;
const yMax = Math.max(yMin, Math.ceil((maxFare + 1) / 10) * 10);
const yTicks = Array.from({ length: (yMax - yMin) / 10 + 1 }, (_, i) => yMin + i * 10);

export default function Home() {
  const [origin, setOrigin] = useState('London Waterloo');
  const [destination, setDestination] = useState('Southampton Central');
  const [fareType, setFareType] = useState('S3B'); // New State
  const odGroups = [
    { name: 'LONG', type: 'S1B' },
    { name: 'MID', type: 'S3B' },
    { name: 'WIN', type: 'S9A' },
    { name: 'Non-London', type: 'S1B' },
    { name: 'Non-AP', type: 'SDS' },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      
      {/* 1. Header Banner */}
      <header className="bg-[#001f3f] shadow-lg mb-6">
        <img src="/swr-banner.jpg" alt="SWR Split Calculator" className="w-full h-auto" />
      </header>

      {/* 2. Header Information (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
  
        {/* Origin/Destination Card with Integrated Filters */}
        <div className="bg-white p-6 rounded-b-lg shadow-md border-t-4 border-gray-300 text-center md:col-span-2">
          <div className="flex justify-between gap-4">
      
            {/* Origin Filter */}
            <div className="w-1/2">
              <p className="text-s text-gray-500 mb-1">Origin</p>
              <select 
                className="w-full text-lg font-bold text-black text-center border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <option value="London Waterloo">London Waterloo</option>
                <option value="Clapham Junction">Clapham Junction</option>
                <option value="Woking">Woking</option>
              </select>
            </div>

            {/* Destination Filter */}
            <div className="w-1/2">
              <p className="text-s text-gray-500 mb-1">Destination</p>
              <select 
                className="w-full text-lg font-bold text-black text-center border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="Southampton Central">Southampton Central</option>
                <option value="Winchester">Winchester</option>
                <option value="Basingstoke">Basingstoke</option>
              </select>
            </div>
          </div>
      </div>

        {/* Advance OD Group Card */}
        <div className="bg-white p-6 rounded-b-lg shadow-md border-t-4 border-gray-300 text-center">
          <div className="flex justify-between">
            <div>
              <p className="text-s text-gray-500">Advance OD Group</p>
              <p className="text-2xl font-bold text-black">MID</p>
            </div>
            <div>
              <p className="text-s text-gray-500">Advance Fare Type</p>
              <p className="text-2xl font-bold text-black">S3B</p>
             </div>
            </div>
          </div>

        {/* Through Fare Card */}
        <div className="bg-sky-100 p-6 rounded-b-lg shadow-md border-t-4 border-sky-500 text-center">
          <p className="text-s text-black">Through Fare</p>
          <p className="text-3xl font-bold text-sky-900">£38.90</p>
        </div>

        {/* Cheapest Split Destination Card */}
        <div className="bg-yellow-50 p-6 rounded-b-lg shadow-md border-t-4 border-yellow-500 text-center">
          <p className="text-s text-black">Cheapest Split Destination</p>
          <p className="text-3xl font-bold text-red-600">Shawford</p>
        </div>

        {/* Cheapest Split Card */}
        <div className="bg-yellow-50 p-6 rounded-b-lg shadow-md border-t-4 border-yellow-500 text-center">
          <p className="text-s text-black">Cheapest Split Saving</p>
          <p className="text-3xl font-bold text-red-600">+ £5.70</p>
        </div>

      </div>

      {/* 3. Main Content Grid (Left, Middle, Right) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 text-center">
        
        {/* Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-[#07396e] text-white p-4 font-bold rounded-t-lg text-lg">OD Group Information</div>
          <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
            <table className="w-full text-center text-lg">
              <thead className="bg-[#607c99]">
                <tr>
                  <th className="p-4">OD Group</th>
                  <th className="p-4">Fare Type</th>
                </tr>
              </thead>
              <tbody>
                {odGroups.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="text-black">{item.name}</td>
                    <td className="text-gray-500 font-bold">{item.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-4">
          <div className="bg-[#001f3f] text-white p-4 font-bold rounded-t-lg text-center">Split Ticketing Analysis</div>
          <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
            <table className="w-full text-center text-lg">
              <thead className="bg-[#607c99]">
                <tr>
                  <th className="p-4">Split Location</th>
                  <th className="p-4">Split Fare</th>
                  <th className="p-4">Split Saving</th>
                </tr>
              </thead>
              <tbody>
                {splitData
                  .filter((row) => row.fare?.trim())
                  .map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="text-black">{row.location}</td>
                      <td className="text-black">{row.fare}</td>
                      <td className={`p-4 font-bold ${row.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {row.saving}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6">
          <div className="bg-[#001f3f] text-white p-4 font-bold rounded-t-lg text-center">Analysis Chart</div>
          <div className="bg-white p-4 shadow-md rounded-b-lg h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData}>
                <CartesianGrid vertical={false} stroke="#f2f2f2" strokeWidth={2} />

                <ReferenceLine
                  y={38.90}
                  stroke="#93c5fd"
                  strokeWidth={6}
                />
                
                <XAxis dataKey="name" />
                <YAxis
                  domain={[yMin, yMax]}
                  ticks={yTicks}
                  tickFormatter={(value) => `£${value}`}
                  label={{ value: '£', angle: -90, position: 'insideLeft', dy: 30, dx: -10, style: { textAnchor: 'middle' } }}
                />
                <Tooltip formatter={(value) => [`£${value}`, 'Fare']} />
                <Bar dataKey="fare" fill="#97d3e9" stroke="#009dff" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
