import { Keypair, PublicKey } from "@solana/web3.js";

// Define the interface for Location
interface Location {
  index: number;
  key: PublicKey;
}

// Use a const assertion to ensure the array is readonly after initialization
export const locations: readonly Location[] = createLocationsArray(3);

// Function to find a location by index
export function locationAtIndex(index: number): Location | undefined {
  return locations.find((l) => l.index === index);
}

// Function to create an array of locations
function createLocationsArray(numLocations: number): Location[] {
  const locations = [];

  for (let i = 1; i <= numLocations; i++) {
    const keypair = Keypair.generate();
    locations.push({
      index: i,
      key: keypair.publicKey,
    });
  }

  return locations;
}
