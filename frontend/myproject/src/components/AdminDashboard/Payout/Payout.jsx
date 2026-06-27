import React, { useState, useEffect } from 'react';
import api from '../../../api'; // Adjust the path to your api.js file

const Payout = () => {
    const [formData, setFormData] = useState({
        payout_name: '',
        loan_type: '',
        category_name: '',
        vendor_bank: '',
        payout: ''
    });
    const [payouts, setPayouts] = useState([]);
    const [filteredPayouts, setFilteredPayouts] = useState([]);
    const [vendorBanks, setVendorBanks] = useState([]);
    const [loanTypes, setLoanTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [payoutTypes, setPayoutTypes] = useState([]);
    const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
    const [selectedPayoutTypeFilter, setSelectedPayoutTypeFilter] = useState('');
    const [selectedLoanTypeFilter, setSelectedLoanTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        payout_name: '',
        loan_type: '',
        category_name: '',
        vendor_bank: '',
        payout: ''
    });

    // Helper function to get display name from object
    const getDisplayName = (item) => {
        if (!item) return 'N/A';
        
        // Try common field names
        if (item.name !== undefined) return item.name;
        if (item.loan_type_name !== undefined) return item.loan_type_name;
        if (item.category_name !== undefined) return item.category_name;
        if (item.payout_name !== undefined) return item.payout_name;
        if (item.bank_name !== undefined) return item.bank_name;
        if (item.vendor_name !== undefined) return item.vendor_name;
        if (item.payout_type_name !== undefined) return item.payout_type_name;
        if (item.loan_type !== undefined) return item.loan_type;
        if (item.category !== undefined) return item.category;
        if (item.payout_type !== undefined) return item.payout_type;
        
        // If none of the above, return ID or a default
        return item.id ? `Item ${item.id}` : 'N/A';
    };

    // Helper to find object by ID
    const findObjectById = (array, id) => {
        return array.find(item => item.id == id);
    };

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setError('');
                const [
                    payoutRes,
                    vendorRes,
                    loanRes,
                    categoryRes,
                    payoutTypeRes
                ] = await Promise.all([
                    api.get('payout/'),
                    api.get('vendor-banks/'),
                    api.get('loan-types/'),
                    api.get('category/'),
                    api.get('payout-type/')
                ]);

                console.log('Loan Types Data:', loanRes.data);
                console.log('Vendor Banks Data:', vendorRes.data);
                console.log('Categories Data:', categoryRes.data);
                console.log('Payout Types Data:', payoutTypeRes.data);

                setPayouts(payoutRes.data);
                setFilteredPayouts(payoutRes.data);
                setVendorBanks(vendorRes.data);
                setLoanTypes(loanRes.data);
                setCategories(categoryRes.data);
                setPayoutTypes(payoutTypeRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please check your authentication or try again.');
                if (error.response?.status === 401) {
                    console.log('Unauthorized - please log in');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle edit form input changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('payout/', formData);
            const updatedPayouts = [...payouts, response.data];
            setPayouts(updatedPayouts);
            setFilteredPayouts(updatedPayouts);
            // Reset form
            setFormData({
                payout_name: '',
                loan_type: '',
                category_name: '',
                vendor_bank: '',
                payout: ''
            });
            alert('Payout added successfully!');
        } catch (error) {
            console.error('Error adding payout:', error);
            alert('Failed to add payout');
        }
    };

    // Handle edit
    const handleEdit = (payout) => {
        setEditingId(payout.id);
        setEditFormData({
            payout_name: payout.payout_name,
            loan_type: payout.loan_type,
            category_name: payout.category_name,
            vendor_bank: payout.vendor_bank,
            payout: payout.payout
        });
    };

    // Handle update
    const handleUpdate = async () => {
        try {
            const response = await api.put(`payout/${editingId}/`, editFormData);
            const updatedPayouts = payouts.map(p => 
                p.id === editingId ? response.data : p
            );
            setPayouts(updatedPayouts);
            setFilteredPayouts(updatedPayouts);
            setEditingId(null);
            alert('Payout updated successfully!');
        } catch (error) {
            console.error('Error updating payout:', error);
            alert('Failed to update payout');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payout?')) {
            return;
        }
        
        try {
            await api.delete(`payout/${id}/`);
            const updatedPayouts = payouts.filter(p => p.id !== id);
            setPayouts(updatedPayouts);
            setFilteredPayouts(updatedPayouts);
            alert('Payout deleted successfully!');
        } catch (error) {
            console.error('Error deleting payout:', error);
            alert('Failed to delete payout');
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({
            payout_name: '',
            loan_type: '',
            category_name: '',
            vendor_bank: '',
            payout: ''
        });
    };

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...payouts];
        
        // Apply Vendor Bank filter
        if (selectedVendorFilter) {
            filtered = filtered.filter(p => p.vendor_bank == selectedVendorFilter);
        }
        
        // Apply Payout Type filter
        if (selectedPayoutTypeFilter) {
            filtered = filtered.filter(p => p.payout_name == selectedPayoutTypeFilter);
        }
        
        // Apply Loan Type filter
        if (selectedLoanTypeFilter) {
            filtered = filtered.filter(p => p.loan_type == selectedLoanTypeFilter);
        }
        
        setFilteredPayouts(filtered);
    };

    // Filter button handler
    const handleFilter = () => {
        applyFilters();
    };

    // Reset all filters
    const handleResetFilter = () => {
        setSelectedVendorFilter('');
        setSelectedPayoutTypeFilter('');
        setSelectedLoanTypeFilter('');
        setFilteredPayouts(payouts);
    };

    if (loading) return <div className="p-4">Loading payouts...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Payout Management</h1>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Add Payout Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Add Payout</h2>
                <form onSubmit={handleSubmit}>
                    {/* Payout Type */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Payout Type *
                        </label>
                        <select
                            name="payout_name"
                            value={formData.payout_name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Payout Type</option>
                            {payoutTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {getDisplayName(type)}
                                </option>
                            ))}
                        </select>
                        {payoutTypes.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">No payout types available</p>
                        )}
                    </div>

                    {/* Loan Type */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Loan Type *
                        </label>
                        <select
                            name="loan_type"
                            value={formData.loan_type}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Loan Type</option>
                            {loanTypes.map(loan => (
                                <option key={loan.id} value={loan.id}>
                                    {getDisplayName(loan)}
                                </option>
                            ))}
                        </select>
                        {loanTypes.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">No loan types available</p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Category *
                        </label>
                        <select
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {getDisplayName(cat)}
                                </option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">No categories available</p>
                        )}
                    </div>

                    {/* Vendor Bank */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Vendor Bank *
                        </label>
                        <select
                            name="vendor_bank"
                            value={formData.vendor_bank}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Vendor Bank</option>
                            {vendorBanks.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                    {getDisplayName(vendor)}
                                </option>
                            ))}
                        </select>
                        {vendorBanks.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">No vendor banks available</p>
                        )}
                    </div>

                    {/* Payout Value */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Payout Amount *
                        </label>
                        <input
                            type="text"
                            name="payout"
                            value={formData.payout}
                            onChange={handleChange}
                            placeholder="Enter payout amount"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </form>
            </div>

            {/* Payout List Section - Bootstrap Styling */}
            <div className="container-fluid p-0 mt-8">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom py-3">
                        <h2 className="h4 mb-0 text-dark">Payout List</h2>
                    </div>
                    
                    <div className="card-body">
                        {/* Filter Controls - All in one row */}
                        <div className="row mb-4 align-items-center">
                            <div className="col-md-8">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    {/* Filter by Vendor Bank */}
                                    <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                                        <select
                                            value={selectedVendorFilter}
                                            onChange={(e) => setSelectedVendorFilter(e.target.value)}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">All Vendor Banks</option>
                                            {vendorBanks.map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>
                                                    {getDisplayName(vendor)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filter by Payout Type */}
                                    <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                                        <select
                                            value={selectedPayoutTypeFilter}
                                            onChange={(e) => setSelectedPayoutTypeFilter(e.target.value)}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">All Payout Types</option>
                                            {payoutTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {getDisplayName(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filter by Loan Type */}
                                    <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                                        <select
                                            value={selectedLoanTypeFilter}
                                            onChange={(e) => setSelectedLoanTypeFilter(e.target.value)}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">All Loan Types</option>
                                            {loanTypes.map(loan => (
                                                <option key={loan.id} value={loan.id}>
                                                    {getDisplayName(loan)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-4 mt-2 mt-md-0">
                                <div className="d-flex gap-2 justify-content-md-end">
                                    <button
                                        onClick={handleFilter}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <i className="bi bi-funnel me-1"></i> Filter
                                    </button>
                                    <button
                                        onClick={handleResetFilter}
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(selectedVendorFilter || selectedPayoutTypeFilter || selectedLoanTypeFilter) && (
                            <div className="mb-3">
                                <div className="d-flex align-items-center flex-wrap">
                                    <small className="text-muted me-2">Active filters:</small>
                                    <div className="d-flex flex-wrap gap-1">
                                        {selectedVendorFilter && (
                                            <span className="badge bg-primary d-flex align-items-center">
                                                Vendor: {getDisplayName(findObjectById(vendorBanks, selectedVendorFilter))}
                                                <button 
                                                    className="ms-1 btn-close btn-close-white" 
                                                    style={{fontSize: '0.5rem', padding: '0'}}
                                                    onClick={() => setSelectedVendorFilter('')}
                                                ></button>
                                            </span>
                                        )}
                                        {selectedPayoutTypeFilter && (
                                            <span className="badge bg-info text-dark d-flex align-items-center">
                                                Payout: {getDisplayName(findObjectById(payoutTypes, selectedPayoutTypeFilter))}
                                                <button 
                                                    className="ms-1 btn-close" 
                                                    style={{fontSize: '0.5rem', padding: '0'}}
                                                    onClick={() => setSelectedPayoutTypeFilter('')}
                                                ></button>
                                            </span>
                                        )}
                                        {selectedLoanTypeFilter && (
                                            <span className="badge bg-warning text-dark d-flex align-items-center">
                                                Loan: {getDisplayName(findObjectById(loanTypes, selectedLoanTypeFilter))}
                                                <button 
                                                    className="ms-1 btn-close" 
                                                    style={{fontSize: '0.5rem', padding: '0'}}
                                                    onClick={() => setSelectedLoanTypeFilter('')}
                                                ></button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Summary */}
                        <div className="mb-3">
                            <small className="text-muted">
                                Showing {filteredPayouts.length} of {payouts.length} payout(s)
                            </small>
                        </div>

                        {/* Table - Bootstrap */}
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered table-striped mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">PAYOUT TYPE</th>
                                        <th scope="col">VENDOR BANK</th>
                                        <th scope="col">LOAN TYPE</th>
                                        <th scope="col">CATEGORY</th>
                                        <th scope="col">PAYOUT</th>
                                        <th scope="col">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayouts.length > 0 ? (
                                        filteredPayouts.map(payout => {
                                            const payoutTypeObj = findObjectById(payoutTypes, payout.payout_name);
                                            const vendorBankObj = findObjectById(vendorBanks, payout.vendor_bank);
                                            const loanTypeObj = findObjectById(loanTypes, payout.loan_type);
                                            const categoryObj = findObjectById(categories, payout.category_name);

                                            return editingId === payout.id ? (
                                                // Edit Row
                                                <tr key={payout.id} className="bg-light">
                                                    <td className="align-middle">
                                                        <select
                                                            name="payout_name"
                                                            value={editFormData.payout_name}
                                                            onChange={handleEditChange}
                                                            className="form-select form-select-sm"
                                                        >
                                                            <option value="">Select Payout Type</option>
                                                            {payoutTypes.map(type => (
                                                                <option key={type.id} value={type.id}>
                                                                    {getDisplayName(type)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="align-middle">
                                                        <select
                                                            name="vendor_bank"
                                                            value={editFormData.vendor_bank}
                                                            onChange={handleEditChange}
                                                            className="form-select form-select-sm"
                                                        >
                                                            <option value="">Select Vendor Bank</option>
                                                            {vendorBanks.map(vendor => (
                                                                <option key={vendor.id} value={vendor.id}>
                                                                    {getDisplayName(vendor)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="align-middle">
                                                        <select
                                                            name="loan_type"
                                                            value={editFormData.loan_type}
                                                            onChange={handleEditChange}
                                                            className="form-select form-select-sm"
                                                        >
                                                            <option value="">Select Loan Type</option>
                                                            {loanTypes.map(loan => (
                                                                <option key={loan.id} value={loan.id}>
                                                                    {getDisplayName(loan)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="align-middle">
                                                        <select
                                                            name="category_name"
                                                            value={editFormData.category_name}
                                                            onChange={handleEditChange}
                                                            className="form-select form-select-sm"
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map(cat => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {getDisplayName(cat)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="align-middle">
                                                        <input
                                                            type="text"
                                                            name="payout"
                                                            value={editFormData.payout}
                                                            onChange={handleEditChange}
                                                            className="form-control form-control-sm"
                                                        />
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                onClick={handleUpdate}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                <i className="bi bi-check-lg me-1"></i> Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                <i className="bi bi-x-lg me-1"></i> Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                // Display Row
                                                <tr key={payout.id}>
                                                    <td className="align-middle">
                                                        {getDisplayName(payoutTypeObj)}
                                                    </td>
                                                    <td className="align-middle">
                                                        {getDisplayName(vendorBankObj)}
                                                    </td>
                                                    <td className="align-middle">
                                                        {getDisplayName(loanTypeObj)}
                                                    </td>
                                                    <td className="align-middle">
                                                        {getDisplayName(categoryObj)}
                                                    </td>
                                                    <td className="align-middle">{payout.payout}</td>
                                                    <td className="align-middle">
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                onClick={() => handleEdit(payout)}
                                                                className="btn btn-warning btn-sm"
                                                            >
                                                                <i className="bi bi-pencil me-1"></i> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(payout.id)}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                <i className="bi bi-trash me-1"></i> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <div className="text-muted">
                                                    <i className="bi bi-inbox display-6 d-block mb-2"></i>
                                                    {payouts.length === 0 ? 'No payouts found' : 'No matching payouts for the selected filters'}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payout;