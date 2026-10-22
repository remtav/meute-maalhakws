import { getCollection, type CollectionEntry } from 'astro:content';

export type Nouvelle = CollectionEntry<'nouvelles'>;

/** Nouvelles épinglées d'abord, puis de la plus récente à la plus ancienne. */
export async function nouvellesTriees(): Promise<Nouvelle[]> {
  const toutes = await getCollection('nouvelles');
  return toutes.sort((a, b) => {
    if (a.data.epingle !== b.data.epingle) return a.data.epingle ? -1 : 1;
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

const formatDate = new Intl.DateTimeFormat('fr-CA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function dateLisible(date: Date): string {
  return formatDate.format(date);
}
