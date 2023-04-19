import { T_BenchmarkReformat } from "../types";

export default function BenchmarkReformat(benchmarks: T_BenchmarkReformat[]): T_BenchmarkReformat[] {
  return benchmarks.map((benchmark) => {
    const bm = benchmark;
    bm.completed = (new Date(benchmark.completed)).toLocaleString();
    return bm;
  });
}
