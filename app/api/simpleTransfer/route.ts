import { NextResponse } from "next/server";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { connection } from "@/utils/programSetup";

// GET request handler
export async function GET() {
  return NextResponse.json({
    label: "Store Name",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  });
}

// POST request handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { account } = body;
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!account) {
      return NextResponse.json({ error: "No account provided" }, { status: 400 });
    }

    if (!reference) {
      return NextResponse.json({ error: "No reference provided" }, { status: 400 });
    }

    const accountKey = new PublicKey(account);
    const referenceKey = new PublicKey(reference);

    // Airdrop devnet SOL to fund mobile wallet
    await connection.requestAirdrop(accountKey, 2 * LAMPORTS_PER_SOL);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      feePayer: accountKey,
      blockhash,
      lastValidBlockHeight,
    });

    const instruction = SystemProgram.transfer({
      fromPubkey: accountKey,
      toPubkey: Keypair.generate().publicKey,
      lamports: 0.001 * LAMPORTS_PER_SOL,
    });

    instruction.keys.push({
      pubkey: referenceKey,
      isSigner: false,
      isWritable: false,
    });

    transaction.add(instruction);

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    const message = "Approve to transfer 0.001 Devnet SOL";

    return NextResponse.json({ transaction: base64, message });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Error creating transaction" }, { status: 500 });
  }
}
