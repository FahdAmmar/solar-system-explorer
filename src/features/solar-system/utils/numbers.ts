// Invalid input must never become NaN in the scene.
export const isPositive = (value: number): boolean => Number.isFinite(value) && value > 0
