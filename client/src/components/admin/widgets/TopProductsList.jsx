import React from 'react';

const TopProductsList = ({ products }) => {
    // Mock percentages for visualization if not provided
    const getPercentage = (sold) => {
        const max = products?.[0]?.soldQuantity || 100;
        return Math.min(Math.round((sold / max) * 100), 100);
    };

    const colors = ['bg-[#6C5DD3]', 'bg-[#FF9F43]', 'bg-[#FF5B5B]', 'bg-[#00B074]', 'bg-[#2D9CDB]'];

    return (
        <div className="space-y-6">
            {products?.slice(0, 5).map((item, index) => {
                const percentage = getPercentage(item.soldQuantity);
                const color = colors[index % colors.length];

                return (
                    <div key={item.product._id}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{item.product.name}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${color}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}

            {(!products || products.length === 0) && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No top products data.</p>
            )}
        </div>
    );
};

export default TopProductsList;
