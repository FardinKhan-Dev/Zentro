import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiGlobe, FiMapPin, FiPhone, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Validation Schema
const schema = yup.object().shape({
    phoneNumber: yup
        .string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
    zipCode: yup
        .string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Must be a valid 6-digit pincode'),
    country: yup.string().required('Country is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    street: yup.string().required('Street address is required'),
    isDefault: yup.boolean(),
});

const AddressForm = ({ initialData = {}, onSubmit, isSaving = false, submitLabel = 'Deliver Here' }) => {
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            phoneNumber: initialData.phone || initialData.phoneNumber || '',
            zipCode: initialData.zipCode || '',
            country: initialData.country || 'India',
            city: initialData.city || '',
            state: initialData.state || '',
            street: initialData.street || '',
            isDefault: initialData.isDefault || false,
        },
    });

    const zipCode = watch('zipCode');
    const country = watch('country');

    // Auto-fill address from ZipCode
    useEffect(() => {
        if (zipCode?.length === 6 && country === 'India') {
            const fetchPincodeDetails = async () => {
                setIsPincodeLoading(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${zipCode}`);
                    const data = await response.json();

                    if (data[0].Status === 'Success') {
                        const { District, State } = data[0].PostOffice[0];
                        setValue('city', District, { shouldValidate: true });
                        setValue('state', State, { shouldValidate: true });
                        toast.success(`Found ${District}, ${State}`);
                    } else {
                        toast.error('Invalid Pincode');
                        // Optional: Reset city/state or set error manually
                    }
                } catch (error) {
                    console.error('Failed to fetch pincode:', error);
                } finally {
                    setIsPincodeLoading(false);
                }
            };
            fetchPincodeDetails();
        }
    }, [zipCode, country, setValue]);

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    const inputClass = (error) =>
        `w-full px-4 py-3 bg-white dark:bg-zinc-900 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'} rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`;

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Phone Number */}
                <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FiPhone className="text-gray-400 dark:text-gray-500" /> Mobile Number
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">+91</span>
                        <input
                            type="tel"
                            maxLength={10}
                            {...register('phoneNumber')}
                            className={`${inputClass(errors.phoneNumber)} pl-12`}
                            placeholder="9999999999"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            }}
                        />
                    </div>
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>}
                </div>

                {/* ZIP Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP / Pincode</label>
                    <div className="relative">
                        <input
                            type="text"
                            maxLength={6}
                            {...register('zipCode')}
                            className={inputClass(errors.zipCode)}
                            placeholder="110001"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            }}
                        />
                        {isPincodeLoading && (
                            <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                        )}
                    </div>
                    {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>}
                </div>

                {/* Country */}
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FiGlobe className="text-gray-400 dark:text-gray-500" /> Country
                    </label>
                    <select
                        {...register('country')}
                        className={inputClass(errors.country)}
                    >
                        <option value="India">India</option>
                    </select>
                    {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>}
                </div>

                {/* City & State (Auto-filled) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                    <input
                        type="text"
                        {...register('city')}
                        className={`${inputClass(errors.city)} bg-gray-50 dark:bg-zinc-800`}
                        placeholder="New Delhi"
                        readOnly // Auto-filled from pincode
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                    <input
                        type="text"
                        {...register('state')}
                        className={`${inputClass(errors.state)} bg-gray-50 dark:bg-zinc-800`}
                        placeholder="Delhi"
                        readOnly
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
                </div>

                {/* Street Address */}
                <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FiMapPin className="text-gray-400 dark:text-gray-500" /> Street Address
                    </label>
                    <textarea
                        {...register('street')}
                        rows="3"
                        className={inputClass(errors.street)}
                        placeholder="Flat No, Building, Street, Area"
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street.message}</p>}
                </div>

                {/* Save Address Option */}
                <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <input
                            type="checkbox"
                            {...register('isDefault')}
                            className="w-5 h-5 rounded border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-black dark:focus:ring-white transition duration-150 ease-in-out"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Save this address for future checkout</span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <FiLoader className="animate-spin" /> Saving...
                    </>
                ) : (
                    submitLabel
                )}
            </button>
        </form>
    );
};

export default AddressForm;
