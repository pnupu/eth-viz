import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const address = '0xB05D01658e1Fd9434e9E6a5ba8fE038b2BD5564e'; // Example address
  try {
    const data1inch = await fetch1inchData(address);
    // const dataBlockscout = await fetchBlockscoutData(address);
    
    const processedData = processData(data1inch);
    
    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

async function fetch1inchData(address: string) {
  const url = `https://api.1inch.dev/history/v2.0/history/${address}/events`;
  const config = {
    headers: {
      "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}`
    },
    params: {
      "chainId": "1"
    }
  };
  
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Waiting before retrying...');
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fetch1inchData(address); // Retry the request
    }
    throw error;
  }
}


interface TransactionEvent {
    timeMs: number;
    address: string;
    type: number;
    rating: string;
    direction: 'in' | 'out';
    details: {
      fromAddress: string;
      toAddress: string;
      tokenAmount: string;
      tokenSymbol: string;
    };
    id: string;
    eventOrderInTransaction: number;
  }

  
  interface Node extends d3.SimulationNodeDatum {
    id: string;
    address: string;
    transactions: number;
  }
  
  interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    value: number;
  }
  
  interface ProcessedData {
    nodes: Node[];
    links: Link[];
  }
  
  interface ApiResponse {
    items: {
      details: {
        fromAddress: string;
        toAddress: string;
        txHash: string;
      };
      id: string; // Assuming this is the transaction hash
    }[];
  }
  
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
  
  interface ProcessedData {
    nodes: Node[];
    links: Link[];
  }
  
  function processData(data: ApiResponse): ProcessedData {
    const nodes: { [key: string]: Node } = {};
    const links: Link[] = [];
  
    data.items.forEach((item) => {
      const { fromAddress, toAddress } = item.details;
  
      // Add or update nodes
      if (!nodes[fromAddress]) {
        nodes[fromAddress] = { id: fromAddress, address: fromAddress, transactions: 0 };
      }
      if (!nodes[toAddress]) {
        nodes[toAddress] = { id: toAddress, address: toAddress, transactions: 0 };
      }
      nodes[fromAddress].transactions++;
      nodes[toAddress].transactions++;
  

      // Add links (now as an array of unique links)
      links.push({
        source: fromAddress,
        target: toAddress,
        value: 1,
        transactionHash: item.details.txHash
      });
    });
  
    // Combine links with the same source and target
    const combinedLinks = links.reduce((acc, link) => {
      const existingLink = acc.find(l => 
        (l.source === link.source && l.target === link.target) ||
        (l.source === link.target && l.target === link.source)
      );
  
      if (existingLink) {
        existingLink.value++;
      } else {
        acc.push(link);
      }
  
      return acc;
    }, [] as Link[]);
  
    return {
      nodes: Object.values(nodes),
      links: combinedLinks
    };
  }