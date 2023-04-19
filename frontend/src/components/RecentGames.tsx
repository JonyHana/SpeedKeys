import { useEffect, useState } from "react";
import { T_UserBenchmark_HomePage } from "../types";
import { Link } from "react-router-dom";
import BenchmarkReformat from "../utils/benchmarkReformat";

const RecentGames = () => {
  const [benchmarks, setBenchmarks] = useState<T_UserBenchmark_HomePage[]>();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/benchmarks/`)
    .then((res) => res.json())
    .then((data: T_UserBenchmark_HomePage[]) => {
      const benchmarks = BenchmarkReformat(data) as T_UserBenchmark_HomePage[];
      setBenchmarks(benchmarks);
    });
  }, []);

  return (
    <div className="relative overflow-x-auto">
      <table className="mx-auto text-sm text-center text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              User
            </th>
            <th scope="col" className="px-6 py-3">
              WPM
            </th>
            <th scope="col" className="px-6 py-3">
              Completed
            </th>
          </tr>
        </thead>
        <tbody>
          {benchmarks &&
            benchmarks.map((b, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <Link to={`benchmarks/${b.username}`}>{b.username}</Link>
                </th>
                <td className="px-6 py-4">
                  {b.WPM}
                </td>
                <td className="px-6 py-4">
                  {b.completed}
                </td> 
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default RecentGames