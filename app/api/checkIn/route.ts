import { NextResponse } from 'next/server';
import { PublicKey, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js';
import { locationAtIndex, Location, locations } from '@/utils/locations'; // Updated the path to align with app structure
import { connection, gameId, program } from '@/utils/programSetup';

// Retrieve the event organizer keypair
function getEventOrganizer(): Keypair {
  const eventOrganizerSecret = process.env.EVENT_ORGANIZER;
  if (!eventOrganizerSecret) throw new Error('EVENT_ORGANIZER not found');

  const eventOrganizer = JSON.parse(eventOrganizerSecret) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(eventOrganizer));
}

const eventOrganizer = getEventOrganizer();

// GET method handler
export async function GET() {
  return NextResponse.json({
    label: 'Scavenger Hunt!',
    icon: 'https://solana.com/src/img/branding/solanaLogoMark.svg',
  });
}

// POST method handler
export async function POST(req: Request) {
  const body = await req.json();
  const { account } = body;
  const { reference, id } = new URL(req.url).searchParams;

  if (!account || !reference || !id) {
    return NextResponse.json({ error: 'Missing required parameter(s)' }, { status: 400 });
  }

  try {
    const transaction = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference),
      id.toString()
    );

    return NextResponse.json({
      transaction,
      message: `You've found location ${id}!`,
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { transaction: '', message: err.message || 'Error creating transaction' },
      { status: 500 }
    );
  }
}

// Function to build the transaction
async function buildTransaction(
  account: PublicKey,
  reference: PublicKey,
  id: string
): Promise<string> {
  const userState = await fetchUserState(account);

  const currentLocation = locationAtIndex(Number(id));

  if (!currentLocation) {
    throw { message: 'Invalid location id' };
  }

  if (!verifyCorrectLocation(userState, currentLocation)) {
    throw { message: 'You must visit each location in order!' };
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  // Create a new transaction object
  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  });

  if (!userState) {
    transaction.add(await createInitUserInstruction(account));
  }

  transaction.add(await createCheckInInstruction(account, reference, currentLocation));
  transaction.partialSign(eventOrganizer);

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });

  const base64 = serializedTransaction.toString('base64');
  return base64;
}

// Interface for user state
interface UserState {
  user: PublicKey;
  gameId: PublicKey;
  lastLocation: PublicKey;
}

// Function to fetch user state
async function fetchUserState(account: PublicKey): Promise<UserState | null> {
  const userStatePDA = PublicKey.findProgramAddressSync(
    [gameId.toBuffer(), account.toBuffer()],
    program.programId
  )[0];

  try {
    return await program.account.userState.fetch(userStatePDA);
  } catch {
    return null;
  }
}

// Verify that the user is visiting the correct location in order
function verifyCorrectLocation(userState: UserState | null, currentLocation: Location): boolean {
  if (!userState) {
    return currentLocation.index === 1;
  }

  const lastLocation = locations.find(
    (location: any) => location.key.toString() === userState.lastLocation.toString()
  );

  return lastLocation ? currentLocation.index === lastLocation.index + 1 : false;
}

// Create an instruction to initialize a user
async function createInitUserInstruction(account: PublicKey): Promise<TransactionInstruction> {
  const initializeInstruction = await program.methods
    .initialize(gameId)
    .accounts({ user: account })
    .instruction();

  return initializeInstruction;
}

// Create an instruction to check in at a location
async function createCheckInInstruction(
  account: PublicKey,
  reference: PublicKey,
  location: Location
): Promise<TransactionInstruction> {
  const checkInInstruction = await program.methods
    .checkIn(gameId, location.key)
    .accounts({
      user: account,
      eventOrganizer: eventOrganizer.publicKey,
    })
    .instruction();

  checkInInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  return checkInInstruction;
}
