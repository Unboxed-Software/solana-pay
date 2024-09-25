"use client"; // This is needed for client-side components in the app directory

import { Flex, Heading, VStack } from "@chakra-ui/react";
import { useParams } from "next/navigation"; // Correct hook for accessing params in the App Router
import { Keypair } from "@solana/web3.js";
import { useEffect, useRef, useState } from "react";
import { createQRCode } from "@/utils/createQrCode/checkIn";
import { checkTransaction } from "@/utils/checkTransaction";

const QrCodePage = () => {
  const { id } = useParams(); // Get the `id` parameter from the URL

  const qrRef = useRef<HTMLDivElement>(null);
  const [reference, setReference] = useState(Keypair.generate().publicKey);

  // Create the QR code when the `id` parameter or `reference` changes
  useEffect(() => {
    if (id && qrRef.current) {
      createQRCode(qrRef, reference, id);
    }
  }, [reference, id]);

  // Periodically check the transaction status and reset the `reference` state variable once confirmed
  useEffect(() => {
    const interval = setInterval(() => {
      checkTransaction(reference, setReference);
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [reference]);

  return (
    <VStack justifyContent="center">
      <Heading>Location {id}</Heading>
      <Flex ref={qrRef} />
    </VStack>
  );
};

export default QrCodePage;

