import { NextRequest, NextResponse } from "next/server";
import { clearTransactions, insertTransaction, listTransactions } from "@/lib/serverDatabase";
import { TransactionRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidPayload(payload: Partial<TransactionRecord>): payload is TransactionRecord {
  const amount = Number(payload.amountCollected);
  const passes = Number(payload.numberOfPasses);

  return Boolean(
    payload.id &&
      payload.collectedBy?.trim() &&
      payload.date &&
      payload.time &&
      payload.passType?.trim() &&
      payload.generatedPassCode?.trim() &&
      Number.isFinite(Number(payload.createdAt)) &&
      Number.isFinite(amount) &&
      amount > 0 &&
      Number.isInteger(passes) &&
      passes > 0
  );
}

export async function GET() {
  try {
    const records = await listTransactions();
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ message: "Failed to load transactions." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<TransactionRecord>;
    if (!isValidPayload(payload)) {
      return NextResponse.json({ message: "Invalid transaction payload." }, { status: 400 });
    }

    await insertTransaction({
      id: payload.id,
      createdAt: Number(payload.createdAt),
      collectedBy: payload.collectedBy.trim(),
      date: payload.date,
      time: payload.time,
      passType: payload.passType.trim(),
      amountCollected: Number(payload.amountCollected),
      numberOfPasses: Number(payload.numberOfPasses),
      generatedPassCode: payload.generatedPassCode.trim()
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to save transaction." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearTransactions();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to clear transactions." }, { status: 500 });
  }
}