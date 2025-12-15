import slugifyLib from 'slugify';

export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  let slug = generateSlug(text);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
}
