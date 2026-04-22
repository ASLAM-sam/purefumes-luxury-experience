export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const groupBrandsByLetter = (brands: string[]) =>
  brands.reduce<Record<string, string[]>>((acc, brand) => {
    const letter = brand[0]?.toUpperCase();
    if (!letter) return acc;
    (acc[letter] ||= []).push(brand);
    return acc;
  }, {});
