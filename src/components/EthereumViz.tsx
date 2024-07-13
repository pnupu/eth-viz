"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node, Link, Data, TransactionItem } from './types';
import { storage } from './storage';
import InfoPanel from './InfoPanel';
import TransactionInfoPanel from './TransactionInfoPanel';

const EthereumViz: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGroupRef = useRef<SVGGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [data, setData] = useState<Data>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockscoutData, setBlockscoutData] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [isLoadingAdditionalData, setIsLoadingAdditionalData] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [transactionData, setTransactionData] = useState<any | null>(null);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  useEffect(() => {
    // Load stored data on initial render
    const storedData = storage.getData();
    // setData(storedData);

    // Fetch data for all stored wallets
    const wallets = storage.getWallets();
    wallets.forEach(wallet => {
      fetchData(wallet);
      setTimeout(() => {}, 1000)
    });
  }, []);

  useEffect(() => {
    // fetchData('0xD36e5e84eAfbD10eD0F718b789457848EA6D121B'); // Or any other address
  }, []);

  const fetchData = async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/data?address=${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData: Data = await response.json();
      
      setData(prevData => {
        const updatedData = {
          nodes: [...prevData.nodes, ...newData.nodes.filter(node => 
            !prevData.nodes.some(n => n.id === node.id)
          )],
          links: [...prevData.links, ...newData.links.filter(link => 
            !prevData.links.some(l => 
              l.source === link.source && 
              l.target === link.target && 
              l.tokenAddress === link.tokenAddress
            )
          )]
        };
        storage.saveData(updatedData, address);
        return updatedData;
      });
    } catch (e) {
      setError(`Failed to fetch data: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!newWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    await fetchData(newWalletAddress);
    setNewWalletAddress('');
  };

  useEffect(() => {
    if (data.nodes.length > 0 && svgRef.current) {
      createVisualization(data);
    }
  }, [data]);



  useEffect(() => {
    if (data && svgRef.current) {
      createVisualization(data);
    }
  }, [data]);

  const setZoomGroupRef = useCallback((node: SVGGElement | null) => {
    if (node !== null) {
      zoomGroupRef.current = node;
    }
  }, []);

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
      const newData: { items: TransactionItem[] } = await response.json();
      
      setData(prevData => {
        const updatedData = updateGraphWithTransactions(address, newData.items, prevData);
        storage.saveData(updatedData, address);
        return updatedData;
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingAdditionalData(false);
    }
  };

  const updateGraphWithTransactions = (sourceAddress: string, transactions: TransactionItem[], currentData: Data): Data => {
    const newNodes: { [key: string]: Node } = {};
    const newLinks: Link[] = [];
  
    transactions.forEach((item) => {
      item.details.tokenActions.forEach((action) => {
        const { fromAddress, toAddress, address: tokenAddress, amount, standard, priceToUsd } = action;
  
        // Add or update nodes
        [fromAddress, toAddress].forEach(address => {
          if (!newNodes[address] && !currentData.nodes.some(n => n.id === address)) {
            newNodes[address] = { id: address, address: address, transactions: 0 };
          }
          if (newNodes[address]) {
            newNodes[address].transactions++;
          } else {
            const existingNode = currentData.nodes.find(n => n.id === address);
            if (existingNode) {
              existingNode.transactions++;
            }
          }
        });
  
        // Calculate value in USD
        const value = Number(amount) /1e18 * (priceToUsd || 1);
  
        // Add new link
        newLinks.push({
          source: fromAddress,
          target: toAddress,
          value: value,
          transactionHash: item.details.txHash,
          tokenAddress: tokenAddress,
          tokenStandard: standard,
          amount: amount,
        });
      });
    });
  
    // Combine new links with existing links
    const combinedLinks = [...currentData.links, ...newLinks].reduce((acc, link) => {
      const existingLink = acc.find(l => 
        l.source === link.source && 
        l.target === link.target && 
        l.tokenAddress === link.tokenAddress
      );
  
      if (existingLink) {
        existingLink.value += link.value;
        existingLink.amount = (BigInt(existingLink.amount) + BigInt(link.amount)).toString();
      } else {
        acc.push(link);
      }
  
      return acc;
    }, [] as Link[]);
  
    return {
      nodes: [...currentData.nodes, ...Object.values(newNodes)],
      links: combinedLinks
    };
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

    // Clear any existing SVG content if it's the first render
    if (svg.select("g").empty()) {
      svg.selectAll("*").remove();
    }

    let zoomGroup = d3.select(zoomGroupRef.current) as d3.Selection<SVGGElement, unknown, null, undefined>;
    if (zoomGroup.empty()) {
      zoomGroup = svg.append("g").attr("class", "zoom-group") as d3.Selection<SVGGElement, unknown, null, undefined>;
      setZoomGroupRef(zoomGroup.node() as SVGGElement);
    }

    zoomGroup.append("defs").selectAll("marker")
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

    let linkGroup = zoomGroup.select<SVGGElement>('.links');
    if (linkGroup.empty()) {
      linkGroup = zoomGroup.append("g").attr("class", "links");
    }

    let nodeGroup = zoomGroup.select<SVGGElement>('.nodes');
    if (nodeGroup.empty()) {
      nodeGroup = zoomGroup.append("g").attr("class", "nodes");
    }

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const updateGraph = () => {
    // Update links
    const linkHitArea = linkGroup.selectAll<SVGLineElement, Link>(".link-hit-area")
      .data(data.links, d => `${d.source}-${d.target}-${d.transactionHash}`);

  linkHitArea.exit().remove();

  const linkHitAreaEnter = linkHitArea.enter().append("line")
    .attr("class", "link-hit-area")
    .style("stroke", "transparent")
    .style("stroke-width", 50)
    .on("click", handleLinkClick);

  const link = linkGroup.selectAll<SVGLineElement, Link>(".link-visible")
    .data(data.links, d => `${d.source}-${d.target}-${d.transactionHash}`);

  link.exit().remove();

  const linkEnter = link.enter().append("line")
    .attr("class", "link-visible")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", d =>  2)
    .attr("marker-end", "url(#end)");

  // Update nodes
  const nodes = nodeGroup.selectAll<SVGGElement, Node>(".node")
    .data(data.nodes, d => d.id);

  nodes.exit().remove();

  const nodesEnter = nodes.enter().append("g")
    .attr("class", "node")
    .call(drag(simulation) as any)
    .on("click", handleNodeClick);

  nodesEnter.append("circle")
    .attr("r", d => 10 + Math.sqrt(d.transactions) * 3)
    .attr("fill", "#69b3a2")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  nodesEnter.append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .text(d => d.id.substring(0, 6) + "...")
    .attr("font-size", "10px")
    .attr("fill", "#333");

  // Update simulation
  simulation.nodes(data.nodes);
  simulation.force<d3.ForceLink<Node, Link>>("link")!.links(data.links);
  simulation.alpha(1).restart();
};

    updateGraph();

    simulation.on("tick", () => {
      linkGroup.selectAll<SVGLineElement, Link>("line")
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      nodeGroup.selectAll<SVGGElement, Node>(".node")
        .attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomGroup.attr("transform", event.transform.toString());
      });

      svg.call(zoom as any);

    // Add double-click to reset zoom
    svg.on("dblclick.zoom", null);
    svg.on("dblclick", (event) => {
      event.preventDefault();
      svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity, d3.zoomTransform(svg.node()!).invert([width / 2, height / 2]));
    });

    function handleNodeClick(event: MouseEvent, d: Node) {
      event.stopPropagation();
      setSelectedNode(d);
      setSelectedLink(null)
      fetchBlockscoutData(d.address);
    }

    function handleLinkClick(event: MouseEvent, d: Link) {
      event.stopPropagation();
      setSelectedNode(null)
      setSelectedLink(d);
      if (d.transactionHash) {
        fetchTransactionData(d.transactionHash);
      } else {
        console.error('No transaction hash available for this link');
      }
    }

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<SVGGElement, Node>()
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
      <div className="absolute top-[-80px] left-4 bg-white p-4 rounded-lg shadow-lg">
        <input
          type="text"
          value={newWalletAddress}
          onChange={(e) => setNewWalletAddress(e.target.value)}
          placeholder="Enter wallet address"
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          onClick={handleAddWallet}
          disabled={isLoadingAdditionalData || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoadingAdditionalData || loading ? 'Loading' : 'Add Wallet'}
        </button>
      </div>
      <svg ref={svgRef} className="w-full h-full">
      <text x="50%" y="50" textAnchor="middle" className="text-4xl font-bold">
          Ethereum Data Visualization
        </text>
        <g ref={zoomGroupRef} className="zoom-group" />
      </svg>

      {selectedNode && (
        <InfoPanel 
          node={selectedNode} 
          onFetchTransactions={fetchTransactions}
          blockscoutData={blockscoutData}
          transactions={transactions}
          isLoading={isLoadingAdditionalData}
          onClose={() => setSelectedNode(null)}
        />
      )}
      
      {selectedLink && (
        <TransactionInfoPanel
          transaction={transactionData}
          onClose={() => {
            setSelectedLink(null);
            setTransactionData(null);
          }}
        />
      )}
    </div>
  );
};

export default EthereumViz;