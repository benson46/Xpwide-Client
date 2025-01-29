import { Pencil, Check, X } from 'lucide-react';
import AddressForm from './AddressForm';

export default function AddressCard({ 
  address, 
  isSelected, 
  onSelect, 
  onEdit,
  isEditing,
  onCancelEdit,
  onSubmit
}) {
  return (
    <div className="border rounded-lg">
      <div
        className={`p-4 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{address.name}</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                {address.addressType}
              </span>
            </div>
            <p className="text-sm text-gray-600">{address.phoneNumber}</p>
            <p className="mt-1 text-sm text-gray-600">
              {address.address}
              {address.landmark && `, ${address.landmark}`}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
          <div className="flex items-start gap-2">
            {isSelected && <Check className="h-5 w-5 text-blue-500" />}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  onCancelEdit();
                } else {
                  onEdit(address);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isEditing ? (
                <X className="h-4 w-4 text-gray-500" />
              ) : (
                <Pencil className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit form appears directly under the address */}
      {isEditing && (
        <div className="border-t p-4">
          <AddressForm
            address={address}
            onSubmit={onSubmit}
            onCancel={onCancelEdit}
            className="mt-0"
          />
        </div>
      )}
    </div>
  );
}
