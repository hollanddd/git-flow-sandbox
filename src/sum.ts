function sum(...nums: number[]): number {
  return nums.reduce((acc: number, curr: number) => acc + curr);
}

export { sum as default };
