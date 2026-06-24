const SCENT_NOTES: Record<string, string> = {
  'creamy delight': 'Vanilla + Oat',
  'golden tropic': 'Gardenia + Lemon',
  'mystic earth': 'Patchouli + Oud',
  rosa: 'Coconut + Rose',
  'sacred santal': 'Sandalwood + Clove',
};

export function getScentNotes(scentName?: string | null): string | null {
  if (!scentName) return null;
  return SCENT_NOTES[scentName.trim().toLowerCase()] || null;
}
