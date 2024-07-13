import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    const url = new URL(`https://api.1inch.dev/history/v2.0/history/${address}/events`);
    url.searchParams.append('chainId', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from 1inch');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from 1inch:', error);
    return NextResponse.json({ error: 'Failed to fetch data from 1inch' }, { status: 500 });
  }
}