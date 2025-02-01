import React, { useState } from "react";
import PropTypes from "prop-types";

export default function AddressForm({ address, onSubmit, onCancel, className }) {
  const [formValues, setFormValues] = useState({
    name: address?.name || "",
    phoneNumber: address?.phoneNumber || "",
    pincode: address?.pincode || "",
    locality: address?.locality || "",
    address: address?.address || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    addressType: address?.addressType || "Home",
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.name) errors.name = "Name is required"
    if (!formValues.phoneNumber || formValues.phoneNumber.length !== 10)
      errors.phoneNumber = "Phone number must be 10 digits"
    if (!formValues.pincode || formValues.pincode.length !== 6) errors.pincode = "PIN code must be 6 digits"
    if (!formValues.locality) errors.locality = "Locality is required"
    if (!formValues.address) errors.address = "Address is required"
    if (!formValues.city) errors.city = "City is required"
    if (!formValues.state) errors.state = "State is required"
    if (!formValues.addressType) errors.addressType = "Address type is required"

    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formValues)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            placeholder="Name"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            name="phoneNumber"
            type="tel"
            maxLength={10}
            value={formValues.phoneNumber}
            onChange={handleInputChange}
            placeholder="10-digit mobile number"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode</label>
          <input
            name="pincode"
            maxLength={6}
            value={formValues.pincode}
            onChange={handleInputChange}
            placeholder="Pincode"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.pincode ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pincode && <p className="text-sm text-red-600">{errors.pincode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Locality</label>
          <input
            name="locality"
            value={formValues.locality}
            onChange={handleInputChange}
            placeholder="Locality"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.locality ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.locality && <p className="text-sm text-red-600">{errors.locality}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          name="address"
          value={formValues.address}
          onChange={handleInputChange}
          placeholder="Address (Area and Street)"
          className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Landmark</label>
        <input
          name="landmark"
          value={formValues.landmark}
          onChange={handleInputChange}
          placeholder="Landmark (Optional)"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            name="city"
            value={formValues.city}
            onChange={handleInputChange}
            placeholder="City/District/Town"
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <select
            name="state"
            value={formValues.state}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">--Select State--</option>
            <option value="Kerala">Kerala</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
          {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Type</label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center">
            <input
              name="addressType"
              type="radio"
              value="Home"
              checked={formValues.addressType === "Home"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Home
          </label>
          <label className="flex items-center">
            <input
              name="addressType"
              type="radio"
              value="Work"
              checked={formValues.addressType === "Work"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Work
          </label>
        </div>
        {errors.addressType && <p className="text-sm text-red-600">{errors.addressType}</p>}
      </div>

      <div className="flex gap-4">
        <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 p-2 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

AddressForm.propTypes = {
  address: PropTypes.shape({
    name: PropTypes.string,
    phoneNumber: PropTypes.string,
    pincode: PropTypes.string,
    locality: PropTypes.string,
    address: PropTypes.string,
    landmark: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    addressType: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  className: PropTypes.string,
};

AddressForm.defaultProps = {
  address: {},
  className: "",
};