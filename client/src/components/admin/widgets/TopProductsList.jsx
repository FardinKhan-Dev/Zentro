import React from 'react';

const TopProductsList = ({ products }) => {
    // Mock percentages for visualization if not provided
    const getPercentage = (sold) => {
        // Safety check for undefined/null values
        if (!sold || !products || products.length === 0) return 0;

        const max = products[0]?.soldQuantity || products[0]?.sales || 100;
        return Math.min(Math.round((sold / max) * 100), 100);
    };

    const colors = ['bg-[#6C5DD3]', 'bg-[#FF9F43]', 'bg-[#FF5B5B]', 'bg-[#00B074]', 'bg-[#2D9CDB]'];

    return (
        <div className="space-y-6">
            {products?.slice(0, 5).map((item, index) => {
                // Use soldQuantity or sales as fallback
                const soldQuantity = item.soldQuantity || item.sales || 0;
                const percentage = getPercentage(soldQuantity);
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
