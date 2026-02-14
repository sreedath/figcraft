let counter = 0;

export function generateId(): string {
  counter += 1;
  return `el_${Date.now()}_${counter}`;
}

export function generateFigureId(): string {
  return `fig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
