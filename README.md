# EthFlow: Ethereum Transaction Visualization Tool

EthFlow is an interactive data visualization tool designed to explore and analyze Ethereum transactions. Built for ETH Brussels, this project leverages the power of 1inch API and Blockscout to provide a comprehensive view of transaction flows within the Ethereum network.

## Features

- Interactive graph visualization of Ethereum transactions
- Node representation for wallet addresses
- Edge representation for transactions between addresses
- Zoom and pan functionality for exploring large datasets
- Information panel for detailed node and transaction data
- Integration with Blockscout for transaction verification and additional data
- Blacklist functionality to highlight potentially suspicious addresses
- Efficient handling of wallets with thousands of transactions

## Technologies Used

- Next.js
- React
- D3.js for visualization
- Tailwind CSS for styling
- 1inch API for transaction data
- Blockscout API for block explorer integration

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ethflow.git
   ```

2. Install dependencies:
   ```
   cd ethflow
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```
   ONEINCH_API_KEY=your_1inch_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter an Ethereum wallet address in the input field and click "Add Wallet" to visualize its transactions.
2. Click on nodes to view detailed information about the wallet and its transactions.
3. Use the mouse wheel or touchpad to zoom in and out of the visualization.
4. Click and drag to pan around the visualization.
5. Use the "Fetch Transactions" button in the info panel to load more transactions for a specific wallet.

## Blockscout Integration

EthFlow integrates Blockscout's robust APIs to enhance the user experience:

1. Transaction verification: All transactions are verified using Blockscout's API.
2. Smart contract interaction: Users can interact with smart contracts directly through Blockscout integration.
3. API usage: EthFlow uses Blockscout's REST API and RPC endpoints for fetching additional transaction and address data.
4. Explorer links: All transaction and address links in the application point to Blockscout explorer for further investigation.

## 1inch Integration

EthFlow utilizes the 1inch API to fetch detailed transaction data, including:

1. Token transfers
2. Transaction values
3. Gas fees
4. Token prices

This integration allows for a comprehensive view of transaction flows and token movements within the Ethereum network.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.