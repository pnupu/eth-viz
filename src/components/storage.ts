// storage.ts
import { Node, Link, Data } from './types';

const LOCAL_STORAGE_KEY = 'ethereum_viz_data';

interface StoredData {
  nodes: { [id: string]: Node };
  links: Link[];
  wallets: string[];
}

export const storage = {
  saveData: (data: Data, wallet: string) => {
    const storedData: StoredData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{"nodes":{},"links":[],"wallets":[]}');
    
    // Update nodes
    data.nodes.forEach(node => {
      if (storedData.nodes[node.id]) {
        storedData.nodes[node.id].transactions += node.transactions;
      } else {
        storedData.nodes[node.id] = node;
      }
    });

    // Update links
    data.links.forEach(link => {
      const existingLink = storedData.links.find(l => 
        l.source === link.source && 
        l.target === link.target && 
        l.tokenAddress === link.tokenAddress
      );
      if (existingLink) {
        existingLink.value += link.value;
        existingLink.amount = (BigInt(existingLink.amount) + BigInt(link.amount)).toString();
      } else {
        storedData.links.push(link);
      }
    });

    // Update wallets
    if (!storedData.wallets.includes(wallet)) {
      storedData.wallets.push(wallet);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
  },
  getData: (): Data => {
    const storedData: StoredData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{"nodes":{},"links":[],"wallets":[]}');
    return {
      nodes: Object.values(storedData.nodes),
      links: storedData.links
    };
  },
  getWallets: (): string[] => {
    const storedData: StoredData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{"nodes":{},"links":[],"wallets":[]}');
    return storedData.wallets;
  }
};