import * as d3 from 'd3';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  address: string;
  transactions: number;
  color: string;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
  transactionHash: string;
  tokenAddress: string;
  tokenStandard: string;
  amount: string;
}


export interface Data {
  nodes: Node[];
  links: Link[];
}

export interface CachedData extends Data {
  timestamp: number;
}

export interface TransactionItem {
  timeMs: number;
  address: string;
  type: number;
  rating: string;
  direction: string;
  details: TransactionDetails;
  id: string;
  eventOrderInTransaction: number;
}
export interface TransactionDetails {
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
export interface TokenAction {
  address: string;
  standard: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  direction: string;
  priceToUsd: number;
}