import React from 'react';

const StatsCard = ({ title, value, icon, color = 'purple' }) => {
    // Map color names to specific pastel hex codes/classes matching the design
    const colorStyles = {
        purple: { bg: 'bg-[#F4F0FF]', text: 'text-[#6C5DD3]' },
        orange: { bg: 'bg-[#FFF4E5]', text: 'text-[#FF9F43]' },
        pink: { bg: 'bg-[#FFE2E5]', text: 'text-[#FF5B5B]' },
        green: { bg: 'bg-[#E5FBF0]', text: 'text-[#00B074]' },
        blue: { bg: 'bg-[#E5F4FF]', text: 'text-[#2D9CDB]' },
    };

    const style = colorStyles[color] || colorStyles.purple;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
            <div className={`w-16 h-16 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-2xl mr-5 shrink-0`}>
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
        </div>
    );
};

export default StatsCard;
