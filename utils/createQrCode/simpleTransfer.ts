import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { RefObject, useEffect, useRef } from "react";

// Assuming this function is part of a React component or utility file

export const useCreateQRCode = (reference: PublicKey) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Build the API URL with the `reference` parameter
    const params = new URLSearchParams();
    params.append("reference", reference.toString());

    // Constructing the API URL dynamically based on the current site origin
    const apiUrl = `${window.location.origin}/api/simpleTransfer?${params.toString()}`;

    // Encode the API URL into a QR code
    const urlFields: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    };
    const url = encodeURL(urlFields);
    const qr = createQR(url, 400, "transparent");

    // Append the QR code to the element specified by the `qrRef` ref object
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  }, [reference]); // Re-run effect if reference changes

  return qrRef;
};

