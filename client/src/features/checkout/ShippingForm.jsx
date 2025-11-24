import React, { useState } from 'react';

/**
 * ShippingForm Component
 */
const ShippingForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || 'US',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const inputClass = (fieldName) =>
        `w-full px-4 py-3 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`;

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>

            <div className="space-y-4">
                {/* Street Address */}
                <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                    </label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={inputClass('street')}
                        placeholder="123 Main St"
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={inputClass('city')}
                            placeholder="New York"
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={inputClass('state')}
                            placeholder="NY"
                        />
                        {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                    </div>
                </div>

                {/* ZIP and Country */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code *
                        </label>
                        <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className={inputClass('zipCode')}
                            placeholder="10001"
                        />
                        {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={inputClass('country')}
                        >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="IN">India</option>
                        </select>
                        {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold transition-colors"
                >
                    Continue to Review
                </button>
            </div>
        </form>
    );
};

export default ShippingForm;
