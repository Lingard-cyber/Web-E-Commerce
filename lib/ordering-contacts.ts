export const orderingContacts = [
  { label: "CP 1", number: "628138732976", display: "+62 813-8732-976" },
  { label: "CP 2", number: "6285647357039", display: "+62 856-4735-7039" },
] as const;

export function orderingWhatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
