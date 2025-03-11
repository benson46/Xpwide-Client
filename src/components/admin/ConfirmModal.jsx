// src/components/ConfirmModal.jsx
import React from "react";
import Modal from "../Modal"; // Your existing Modal component

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
     <div className="p-6" role="dialog" aria-labelledby="confirmModalTitle" aria-describedby="confirmModalMessage">
  <h2 id="confirmModalTitle" className="text-xl font-bold mb-4">{title}</h2>
  <p id="confirmModalMessage" className="mb-6">{message}</p>
  <div className="flex justify-end gap-4">
    <button
      onClick={onCancel}
      className="px-4 py-2 bg-gray-300 text-black rounded"
      aria-label="Cancel"
    >
      {cancelButtonText}
    </button>
    <button
      onClick={onConfirm}
      className="px-4 py-2 bg-red-500 text-white rounded"
      aria-label="Confirm"
    >
      {confirmButtonText}
    </button>
  </div>
</div>

    </Modal>
  );
}
