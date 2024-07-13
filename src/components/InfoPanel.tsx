import React from 'react';
import { Node } from './types';
import { blacklist } from '@/app/data/banned';

interface InfoPanelProps {
  node: Node | null;
  onFetchTransactions: (address: string) => void;
  onDeleteNode: (address: string) => void;
  blockscoutData: any | null;
  transactions: any[] | null;
  isLoading: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  node, 
  onFetchTransactions, 
  blockscoutData, 
  onDeleteNode, 
  isLoading,
  onClose 
}) => {
  if (!node) return null;

  const isBlackListed = blacklist.map(wallet => wallet.address).includes(node.address);
  const isAssosiatedWithBlackListedAddress = node.color === 'red';
  const information = blacklist.find(wallet => wallet.address === node.address);

  return (
    <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg w-100 max-h-[calc(100%-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Address Details</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
      </div>
      <p><strong>Address:</strong> <a target="_blank" href={`https://eth.blockscout.com/address/${node.address}`}>{node.address}</a></p>
      
      {isBlackListed && (
        <p className="text-red-600"><strong>Status:</strong> This address is blacklisted.</p>
      )}
      {isAssosiatedWithBlackListedAddress && !isBlackListed && (
        <p className="text-yellow-600"><strong>Status:</strong> This address is associated with a blacklisted address.</p>
      )}
      {information && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">Blacklist Information</h3>
          <p><strong>Name:</strong> {information.name}</p>
          <p><strong>Date Added:</strong> {information.date_added}</p>
        </div>
      )}

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
      <button 
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => onDeleteNode(node.address)}
        disabled={isLoading}
      >
        Delete Node
      </button>
    </div>
  );
};

export default InfoPanel;
