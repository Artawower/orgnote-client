/*
 * Compare the position of two elements in the DOM tree.
 * Returns 0 if the second element inside the first element
 * Returns 1 if the second element is after the first element
 * Returns -1 if the second element is before the first element
 */
export function compareElemPositions(
  querySelector1: string,
  querySelector2: string
): 0 | 1 | -1 {
  const elem1 = document.querySelector(querySelector1);
  const elem2 = document.querySelector(querySelector2);
  if (!elem1 || !elem2) {
    return 0;
  }

  const elem1Top = elem1.getBoundingClientRect().top;
  const elem1Bottom = elem1.getBoundingClientRect().bottom;

  const elem2Top = elem2.getBoundingClientRect().top;
  const elem2Bottom = elem2.getBoundingClientRect().bottom;

  if (elem2Bottom > elem1Bottom) {
    return 1;
  }

  if (elem1Top >= elem2Top) {
    return -1;
  }

  return 0;
}
