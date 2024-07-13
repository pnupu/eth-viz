import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Node } from '@/components/types'
import { blacklist } from '@/app/data/banned';
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const data1inch = await fetch1inchData(address);
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
      "chainId": "1",
      "limit": "15"
    }
  };
  
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Waiting before retrying...');
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


  
  interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    value: number;
  }
  
  interface ProcessedData {
    nodes: Node[];
    links: Link[];
  }
  
  interface TokenAction {
    address: string;
    standard: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    direction: string;
    priceToUsd: number;
  }
  
  interface TransactionDetails {
    txHash: string;
    chainId: number;
    blockNumber: number;
    blockTimeSec: number;
    status: string;
    type: string;
    tokenActions: TokenAction[];
    fromAddress: string;
    toAddress: string;
    meta?: {
      protocol?: string;
    };
    orderInBlock: number;
    nonce: number;
    feeInWei: string;
    nativeTokenPriceToUsd: number | null;
  }
  
  interface TransactionItem {
    timeMs: number;
    address: string;
    type: number;
    rating: string;
    direction: string;
    details: TransactionDetails;
    id: string;
    eventOrderInTransaction: number;
  }
  
  interface ApiResponse {
    items: TransactionItem[];
  }

  
  interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    value: number;
    transactionHash: string;
    tokenAddress: string;
    tokenStandard: string;
    amount: string;
  }

  interface ProcessedData {
    nodes: Node[];
    links: Link[];
  }
  
  function processData(data: ApiResponse): ProcessedData {
    const nodes: { [key: string]: Node } = {};
    const links: Link[] = [];
  
    data.items.forEach((item) => {
      item.details.tokenActions.forEach((action) => {
        const { fromAddress, toAddress, address: tokenAddress, amount, standard, priceToUsd } = action;
  
        const blacklistAddresses = blacklist.map(wallet => wallet.address);
        // Add or update nodes
        [fromAddress, toAddress].forEach(address => {
          if (!nodes[address]) {
            nodes[address] = {
              id: address,
              address: address,
              transactions: 0,
              color: blacklistAddresses.includes(address) ? 'black' : '#69b3a2'
            };
          }
          nodes[address].transactions++;
        });
  
        // Calculate value in USD
        const value = Number(amount) * (priceToUsd || 1);
  
        // Add link
        links.push({
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
  
    // Color nodes connected to blacklisted addresses
    Object.values(nodes).forEach(node => {
      if (node.color === 'black') {
        links.forEach(link => {
          if (link.source === node.id) {
            nodes[link.target as string].color = 'red';
          } else if (link.target === node.id) {
            nodes[link.source as string].color = 'red';
          }
        });
      }
    });
  
    return {
      nodes: Object.values(nodes),
      links: links
    };
  }