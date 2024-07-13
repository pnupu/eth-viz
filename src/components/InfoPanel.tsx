import React from 'react';
import { Node } from './types';

interface InfoPanelProps {
  node: Node | null;
  onFetchTransactions: (address: string) => void;
  blockscoutData: any | null;
  transactions: any[] | null;
  isLoading: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  node, 
  onFetchTransactions, 
  blockscoutData, 
  transactions, 
  isLoading,
  onClose 
}) => {
  if (!node) return null;

  console.log(blockscoutData)
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-100 max-h-[calc(100%-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Node Details</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
      </div>
      <p><strong>Address:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${node.address}` }>{node.address}</a> </p>
      <p><strong>Transactions:</strong> {node.transactions}</p>
      
      {blockscoutData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Blockscout Data</h3>
          <p><strong>Balance:</strong> {Number(blockscoutData.coin_balance) / 1e18} ETH</p>
          <p><strong>USD Value:</strong> ${(Number(blockscoutData.coin_balance) / 1e18 * Number(blockscoutData.exchange_rate)).toFixed(2)}</p>
          <p><strong>Is Contract:</strong> {blockscoutData.is_contract ? 'Yes' : 'No'}</p>
        </div>
      )}

      <button 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => onFetchTransactions(node.address)}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Fetch Transactions'}
      </button>

      {transactions && transactions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <ul className="list-disc pl-5">
            {transactions.slice(0, 5).map((tx: any, index: number) => (
              <li key={index}>
                {tx.type === 0 ? 'Sent to' : 'Received from'}: {tx.type === 0 ? tx.details.toAddress : tx.details.fromAddress}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
