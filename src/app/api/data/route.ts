import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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
      "chainId": "1"
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

      // Add or update nodes
      if (!nodes[fromAddress]) {
        nodes[fromAddress] = { id: fromAddress, address: fromAddress, transactions: 0 };
      }
      if (!nodes[toAddress]) {
        nodes[toAddress] = { id: toAddress, address: toAddress, transactions: 0 };
      }
      nodes[fromAddress].transactions++;
      nodes[toAddress].transactions++;

      // Calculate value in USD
      const value = Number(amount) / 1e18 * (priceToUsd || 1);

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

  // Combine links with the same source, target, and token
  const combinedLinks = links.reduce((acc, link) => {
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
    nodes: Object.values(nodes),
    links: combinedLinks
  };
}