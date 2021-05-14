function product(...nums: number[]): number {
  return nums.reduce((acc: number, curr: number) => acc * curr);
}

export { product as default };
