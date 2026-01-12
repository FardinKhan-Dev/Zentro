import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const SalesChart = ({ data, timeRange, onTimeRangeChange }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                    <button
                        onClick={() => onTimeRangeChange('weekly')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${timeRange === 'weekly'
                            ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => onTimeRangeChange('monthly')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${timeRange === 'monthly'
                            ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.1} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                            labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
