export function cleanPhoneBR(phone: string) {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits.slice(2);
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string) {
  const d = cleanPhoneBR(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/55${d}?text=${encoded}`;
}

export function qrUrlFor(text: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}
