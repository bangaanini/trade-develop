import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fromCoin, toCoin, amount } = await req.json();

    if (!fromCoin || !toCoin || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Determine symbol for Binance
    // Only support swaps involving USDT for now as per req
    let symbol = "";
    let isBuy = false; // Buy means converting USDT -> Coin

    if (fromCoin === "USDT") {
      symbol = `${toCoin}USDT`;
      isBuy = true;
    } else if (toCoin === "USDT") {
      symbol = `${fromCoin}USDT`;
      isBuy = false;
    } else {
      return NextResponse.json({ error: "Only USDT swaps supported" }, { status: 400 });
    }

    // Fetch price
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!res.ok) {
        return NextResponse.json({ error: "Price unavailable" }, { status: 500 });
    }
    const data = await res.json();
    const price = Number(data.price); // Price of COIN in USDT

    const FEE_PERCENT = 0.005;

    let fee = 0;
    let amountOut = 0;
    let rate = 0;
    let feeCurrency = "USDT";

    if (isBuy) {
        // USDT -> Coin. Input is Amount to Swap.
        // Fee is EXTRA.
        fee = Number(amount) * FEE_PERCENT; // Fee in USDT
        rate = 1 / price;
        amountOut = Number(amount) / price; // Swap full amount
    } else {
        // Coin -> USDT. Output is USDT.
        // Fee deducted from Output.
        const grossOutput = Number(amount) * price;
        fee = grossOutput * FEE_PERCENT; // Fee in USDT
        amountOut = grossOutput - fee;
        rate = price;
    }

    return NextResponse.json({
      success: true,
      rate,
      price, // Raw market price
      fee,
      feeCurrency,
      amountIn: Number(amount),
      amountOut
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
