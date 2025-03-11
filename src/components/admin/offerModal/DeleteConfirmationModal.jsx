import React from "react";
import Modal from "../../Modal";
import PropTypes from "prop-types";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  offerName,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Offer">
      <div className="space-y-4">
        <p className="text-white">
          {`Are you sure you want to delete the offer "${offerName}"?`}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  offerName: PropTypes.string,
};
