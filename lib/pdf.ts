/** True when the bytes start with the PDF signature. The browser-reported MIME type is client-controlled. */
export function hasPdfSignature(bytes: Uint8Array): boolean {
  return Buffer.from(bytes.subarray(0, 5)).toString("latin1") === "%PDF-";
}
