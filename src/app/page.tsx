import EthereumViz from '@/components/EthereumViz';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Ethereum Data Visualization</h1>
      <EthereumViz />
    </main>
  );
}