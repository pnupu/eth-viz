import React from 'react';

interface TransactionInfoPanelProps {
  transaction: any | null;
  onClose: () => void;
}

const TransactionInfoPanel: React.FC<TransactionInfoPanelProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-100 max-h-[calc(100%-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Transaction Details</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
      </div>
      <p><strong>Hash:</strong> {transaction.hash}</p>
      <p><strong>From:</strong> {transaction.from?.hash}</p>
      <p><strong>To:</strong> {transaction.to?.hash}</p>
      <p><strong>Value:</strong> {Number(transaction.value) / 1e18} ETH</p>
      <p><strong>Gas Used:</strong> {transaction.gas_used}</p>
      <p><strong>Status:</strong> {transaction.status}</p>
    </div>
  );
};

export default TransactionInfoPanel;
