import EthereumViz from '@/components/EthereumViz';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24">
      <EthereumViz />
    </main>
  );
}