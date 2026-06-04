export function temaToSlug(tema: string): string {
  return tema
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugToTemaName(slug: string, temas: { slug: string; nombre: string }[]): string {
  return temas.find((t) => t.slug === slug)?.nombre ?? slug;
}
