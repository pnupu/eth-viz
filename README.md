# EthFlow: Ethereum Transaction Visualization Tool

EthFlow is an interactive data visualization tool designed to explore and analyze Ethereum transactions. Built for ETH Brussels, this project leverages the power of 1inch API and Blockscout to provide a comprehensive view of transaction flows within the Ethereum network.

## Features

- **Interactive Graph Visualization**: Visualize Ethereum transactions with an interactive graph.
- **Node Representation**: Wallet addresses are represented as nodes.
- **Edge Representation**: Transactions between addresses are represented as edges.
- **Zoom and Pan**: Explore large datasets with zoom and pan functionality.
- **Information Panel**: View detailed node and transaction data.
- **Blockscout Integration**: Verify transactions and fetch additional data.
- **Blacklist Functionality**: Highlight potentially suspicious addresses.
- **Efficient Handling**: Manage wallets with thousands of transactions seamlessly.

## Technologies Used

- **Next.js**
- **React**
- **D3.js** for visualization
- **Tailwind CSS** for styling
- **1inch API** for transaction data
- **Blockscout API** for block explorer integration

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ethflow.git
   ```

2. **Install dependencies:**
   ```bash
   cd ethflow
   npm install
   ```

3. **Create a `.env.local` file in the root directory and add your API keys:**
   ```env
   ONEINCH_API_KEY=your_1inch_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.**

## Usage

1. **Add Wallet**: Enter an Ethereum wallet address in the input field and click "Add Wallet" to visualize its transactions.
2. **View Details**: Click on nodes to view detailed information about the wallet and its transactions.
3. **Zoom In/Out**: Use the mouse wheel or touchpad to zoom in and out of the visualization.
4. **Pan Around**: Click and drag to pan around the visualization.
5. **Fetch Transactions**: Use the "Fetch Transactions" button in the info panel to load more transactions for a specific wallet.

## Blockscout Integration

EthFlow integrates Blockscout's robust APIs to enhance the user experience:

1. **Transaction Verification**: All transactions are verified using Blockscout's API.
2. **Smart Contract Interaction**: Users can interact with smart contracts directly through Blockscout integration.
3. **API Usage**: EthFlow uses Blockscout's REST API and RPC endpoints for fetching additional transaction and address data.
4. **Explorer Links**: All transaction and address links in the application point to Blockscout explorer for further investigation.

## 1inch Integration

EthFlow utilizes the 1inch API to fetch detailed transaction data, including:

1. **Token Transfers**
2. **Transaction Values**
3. **Gas Fees**
4. **Token Prices**

This integration allows for a comprehensive view of transaction flows and token movements within the Ethereum network.

## Blacklist Functionality

EthFlow includes a blacklist functionality to highlight potentially suspicious addresses. The color coding is as follows:

- **Black**: Blacklisted addresses.
- **Red**: Addresses associated with a blacklisted wallet.
- **Green**: Addresses not associated with any blacklisted wallets.

### Blacklist Source

The blacklist data is sourced from the [OFAC Ethereum addresses list](https://github.com/ultrasoundmoney/ofac-ethereum-addresses/blob/main/data.csv).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.