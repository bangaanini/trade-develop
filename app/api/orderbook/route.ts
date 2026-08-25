import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const limit = searchParams.get('limit') || '15';

    // Fetch from Binance API server-side
    const binanceUrl = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`;
    
    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Orderbook proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order book' },
      { status: 500 }
    );
  }
}
