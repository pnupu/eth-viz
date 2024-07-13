"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  address: string;
  transactions: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
  transactionHash: string;
}
interface Data {
  nodes: Node[];
  links: Link[];
}

interface InfoPanelProps {
  node: Node | null;
}

const LOCAL_STORAGE_KEY = 'ethereum_viz_data';
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour in milliseconds

interface CachedData extends Data {
  timestamp: number;
}

const storage = {
  saveData: (data: Data) => {
    const cachedData: CachedData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cachedData));
  },
  getData: (): Data | null => {
    const cachedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cachedDataString) return null;

    const cachedData: CachedData = JSON.parse(cachedDataString);
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }

    const { timestamp, ...data } = cachedData;
    return data;
  }
};

interface InfoPanelProps {
  node: Node | null;
  onFetchTransactions: (address: string) => void;
  blockscoutData: any | null;
  transactions: any[] | null;
  isLoading: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  node, 
  onFetchTransactions, 
  blockscoutData, 
  transactions, 
  isLoading 
}) => {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-106 max-h-[calc(100%-2rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">Node Details</h2>
      <p><strong>Address:</strong> {node.address}</p>
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

interface TransactionInfoPanelProps {
  transaction: any | null;
  onClose: () => void;
}

const TransactionInfoPanel: React.FC<TransactionInfoPanelProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  console.log("hoi")
  return (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg w-96 max-h-[calc(100%-2rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">Transaction Details</h2>
      <p><strong>Hash:</strong> {transaction.hash}</p>
      <p><strong>From:</strong> {transaction.from.hash}</p>
      <p><strong>To:</strong> {transaction.to.hash}</p>
      <p><strong>Value:</strong> {Number(transaction.value) / 1e18} ETH</p>
      <p><strong>Gas Used:</strong> {transaction.gas_used}</p>
      <p><strong>Status:</strong> {transaction.status}</p>
      <button 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

const EthereumViz: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockscoutData, setBlockscoutData] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [isLoadingAdditionalData, setIsLoadingAdditionalData] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [transactionData, setTransactionData] = useState<any | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check for cached data
        const cachedData = storage.getData();
        console.log(cachedData)
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        // If no cached data, fetch from API
        const response = await fetch('/api/data');
        console.log(response)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newData: Data = await response.json();
        
        // Save the new data to cache
        storage.saveData(newData);
        
        setData(newData);
      } catch (e) {
        setError(`Failed to fetch data: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      createVisualization(data);
    }
  }, [data]);

  useEffect(() => {
    if (selectedNode) {
      fetchBlockscoutData(selectedNode.address);
    } else {
      setBlockscoutData(null);
      setTransactions(null);
    }
  }, [selectedNode]);

  const fetchBlockscoutData = async (address: string) => {
    setIsLoadingAdditionalData(true);
    try {
      const response = await fetch(`/api/blockscout?address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch Blockscout data');
      const data = await response.json();
      setBlockscoutData(data);
    } catch (error) {
      console.error('Error fetching Blockscout data:', error);
    } finally {
      setIsLoadingAdditionalData(false);
    }
  };

  const fetchTransactions = async (address: string) => {
    setIsLoadingAdditionalData(true);
    try {
      const response = await fetch(`/api/transactions?address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.items);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingAdditionalData(false);
    }
  };

  const fetchTransactionData = async (transactionHash: string) => {
    setIsLoadingAdditionalData(true);
    try {
      const response = await fetch(`/api/transaction?hash=${transactionHash}`);
      if (!response.ok) throw new Error('Failed to fetch transaction data');
      const data = await response.json();
      setTransactionData(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setIsLoadingAdditionalData(false);
    }
  };

  const createVisualization = (data: Data) => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
  
    // Clear any existing SVG content
    svg.selectAll("*").remove();
  
    // Define arrow markers for edge direction
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");
  
    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
  
    const linkGroup = svg.append("g").attr("class", "links");
  
    // Create wider invisible lines for better click detection
    const linkHitArea = linkGroup.selectAll(".link-hit-area")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link-hit-area")
      .style("stroke", "transparent")
      .style("stroke-width", 20)  // Wide area for clicking
      .on("click", handleLinkClick);
  
    // Create visible links
    const link = linkGroup.selectAll(".link-visible")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link-visible")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("marker-end", "url(#end)");
  
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", d => 10 + Math.sqrt(d.transactions) * 3)
      .attr("fill", "#69b3a2")
      .call(drag(simulation) as any)
      .on("click", handleNodeClick);
  
    // Add labels to nodes
    const label = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(d => d.id.substring(0, 6) + "...")
      .attr("font-size", "10px")
      .attr("fill", "#333");
  
    node.append("title")
      .text(d => `${d.address}\nTransactions: ${d.transactions}`);
  
    simulation.on("tick", () => {
      linkHitArea
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);
  
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);
  
      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);
  
      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });
  

    function handleNodeClick(event: MouseEvent, d: Node) {
      event.stopPropagation(); // Prevent the svg click event from firing
      setSelectedNode(d);
    }

    function handleLinkClick(event: MouseEvent, d: Link) {
      event.stopPropagation();
      console.log("handleclick ",d)
      setSelectedLink(d);
      if (d.transactionHash) {
        fetchTransactionData(d.transactionHash);
      } else {
        console.error('No transaction hash available for this link');
        // Optionally, show an error message to the user
      }
    }
    // Add this new event listener
    svg.on("click", () => setSelectedNode(null));

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<SVGCircleElement, Node, Node | d3.SubjectPosition>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="relative w-full h-[600px]">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <InfoPanel 
        node={selectedNode} 
        onFetchTransactions={fetchTransactions}
        blockscoutData={blockscoutData}
        transactions={transactions}
        isLoading={isLoadingAdditionalData}
      />
       <TransactionInfoPanel
        transaction={transactionData}
        onClose={() => {
          setSelectedLink(null);
          setTransactionData(null);
        }}
      />
    </div>
  );
};

export default EthereumViz;