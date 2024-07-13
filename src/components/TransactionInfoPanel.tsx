
import React from 'react';

interface TokenTransfer {
  from: { hash: string };
  to: { hash: string };
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  total: {
    value: string;
  };
}

interface TransactionInfoPanelProps {
  transaction: any | null;
  onClose: () => void;
}

const TransactionInfoPanel: React.FC<TransactionInfoPanelProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatValue = (value: string, decimals: string) => {
    const numValue = Number(value) / Math.pow(10, Number(decimals));
    return numValue.toFixed(6);
  };

  // <p><strong>Hash:</strong> <a target="_blank" href={`https://eth.blockscout.com/tx/${transaction.hash}` }>{transaction.hash}</a></p>
  // <p><strong>From:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${transaction.from?.hash}` }>{transaction.from?.hash}</a></p>
  // <p><strong>To:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${transaction.to?.hash}` }>{transaction.to?.hash}</a></p>

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-100 max-h-[calc(100%-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-bold mb-2">Transaction Details</h2>
      <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
      </div>
      <p><strong>Hash:</strong> <a target="_blank" href={`https://eth.blockscout.com/tx/${transaction.hash}` }>{transaction.hash}</a></p>
      <p><strong>Status:</strong> {transaction.status}</p>
      <p><strong>Block:</strong> {transaction.block}</p>
      <p><strong>From:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${transaction.from.hash}` }>{formatAddress(transaction.from.hash)}</a></p>
      <p><strong>To:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${transaction.to.hash}` }>{formatAddress(transaction.to.hash)}</a></p>
      <p><strong>Value:</strong> {Number(transaction.value) / 1e18} ETH</p>
      <p><strong>Gas Used:</strong> {transaction.gas_used}</p>
      <p><strong>Gas Price:</strong> {Number(transaction.gas_price) / 1e9} Gwei</p>
      <p><strong>Total Fee:</strong> {Number(transaction.fee.value) / 1e18} ETH</p>

      {transaction.to.is_contract && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Contract Information</h3>
          <p><strong>Name:</strong> {transaction.to.name || 'Unknown'}</p>
          <p><strong>Is Verified:</strong> {transaction.to.is_verified ? 'Yes' : 'No'}</p>
          {transaction.to.metadata?.tags && (
            <p><strong>Tags:</strong> {transaction.to.metadata.tags.map((tag: any) => tag.name).join(', ')}</p>
          )}
        </div>
      )}

      {transaction.token_transfers && transaction.token_transfers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Token Transfers</h3>
          {transaction.token_transfers.map((transfer: TokenTransfer, index: number) => (
            <div key={index} className="mb-2">
              <p><strong>Token:</strong> {transfer.token.name} ({transfer.token.symbol})</p>
              <p><strong>From:</strong> {formatAddress(transfer.from.hash)}</p>
              <p><strong>To:</strong> {formatAddress(transfer.to.hash)}</p>
              <p><strong>Amount:</strong> {formatValue(transfer.total.value, transfer.token.decimals)} {transfer.token.symbol}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TransactionInfoPanel;