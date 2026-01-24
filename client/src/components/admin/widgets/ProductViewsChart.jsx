import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductViewsChart = ({ data = [] }) => {
    // Debug: Log received data
    console.log('📊 ProductViewsChart received data:', data);

    // Transform data for chart if needed, or use directly
    // Assuming data is array of { product: { name: '...' }, views: 123 }
    const chartData = data.slice(0, 7).map(item => {
        const productName = item.product?.name || item.name || 'Unknown Product';
        const truncatedName = productName.length > 10
            ? productName.substring(0, 10) + '...'
            : productName;

        return {
            name: truncatedName,
            views: item.views || 0
        };
    });

    console.log('📊 Transformed chartData:', chartData);

    if (chartData.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No product view data available</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#6C5DD3] mr-2"></span>
                        <span className="text-gray-500 dark:text-gray-400">Views</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.1} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="views" fill="#6C5DD3" radius={[4, 4, 4, 4]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProductViewsChart;
