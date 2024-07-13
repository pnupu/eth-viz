import * as d3 from 'd3';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  address: string;
  transactions: number;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
  transactionHash: string;
}

export interface Data {
  nodes: Node[];
  links: Link[];
}

export interface CachedData extends Data {
  timestamp: number;
}