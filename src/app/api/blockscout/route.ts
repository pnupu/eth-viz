import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const url = `https://eth.blockscout.com/api/v2/addresses/${address}`;

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Blockscout: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Blockscout API handler:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Blockscout' }, { status: 500 });
  }
}