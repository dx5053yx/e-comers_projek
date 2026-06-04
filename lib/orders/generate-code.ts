export function generateOrderCode(sequence: number, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const paddedSequence = String(sequence).padStart(3, "0");

  return `SP-${year}${month}${day}-${paddedSequence}`;
}
