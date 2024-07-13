import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    const url = `https://api.1inch.dev/history/v2.0/history/${address}/events`;

    const config = {
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
      },
      params: {
        'chainId': '1',
        'limit': '15'
      }
    };

    const response = await axios.get(url, config);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching data from 1inch:', error);
    return NextResponse.json({ error: 'Failed to fetch data from 1inch' }, { status: 500 });
  }
}
