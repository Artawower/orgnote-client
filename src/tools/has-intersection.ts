export function hasIntersection(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return (
    (start2 >= start1 && start2 <= end1) || (start1 >= start2 && start1 <= end2)
  );
}
