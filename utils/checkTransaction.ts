import { findReference, FindReferenceError } from "@solana/pay";
import { Keypair, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from 'next/server';

// Assuming connection is defined elsewhere, you might want to use a dependency injection or context for a better Next.js integration
import { connection } from "@/utils/programSetup";

export async function POST(request: NextRequest) {
  const { reference } = await request.json();

  try {
    // Check for confirmed transactions including the reference public key
    await findReference(connection, new PublicKey(reference), {
      finality: "confirmed",
    });

    // If a transaction is confirmed, generate a new reference
    const newReference = Keypair.generate().publicKey;
    
    return NextResponse.json(
      { 
        message: "Transaction Confirmed", 
        newReference: newReference.toString() 
      },
      { status: 200 }
    );

  } catch (e) {
    if (e instanceof FindReferenceError) {
      console.log(reference, "not confirmed");
      return NextResponse.json({ message: `${reference} not confirmed` }, { status: 404 });
    } else {
      console.error("Unknown error", e);
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}
