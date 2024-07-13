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
  },
  clearData: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
  removeWallet: (address: string) => {
    const storedData: StoredData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{"nodes":{},"links":[],"wallets":[]}');
    
    // Remove the wallet from the wallets array
    storedData.wallets = storedData.wallets.filter(wallet => wallet !== address);

    // Remove the node associated with this wallet
    delete storedData.nodes[address];

    // Remove all links connected to this node
    storedData.links = storedData.links.filter(link => 
      link.source !== address && link.target !== address
    );

    // Check for any nodes with no connections and remove them
    const connectedNodes = new Set<string>();
    storedData.links.forEach(link => {
      connectedNodes.add(link.source);
      connectedNodes.add(link.target);
    });

    Object.keys(storedData.nodes).forEach(nodeId => {
      if (!connectedNodes.has(nodeId)) {
        delete storedData.nodes[nodeId];
      }
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
  },
};
