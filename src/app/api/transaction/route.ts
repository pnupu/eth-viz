import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
  }

  try {
    const url = `https://eth.blockscout.com/api/v2/transactions/${hash}`;
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction data' }, { status: 500 });
  }
}