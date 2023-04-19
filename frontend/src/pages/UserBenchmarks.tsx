import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { T_UserBenchmark } from '../types';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import BenchmarkReformat from '../utils/benchmarkReformat';

const UserBenchmarks = () => {
  const { username } = useParams();

  const [benchmarks, setBenchmarks] = useState<T_UserBenchmark[] | null>(null);
  const [benchmarksReversed, setBenchmarksReversed] = useState<T_UserBenchmark[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/benchmarks/${username}`)
    .then((res) => res.json())
    .then((data: T_UserBenchmark[]) => {
      const benchmarks = BenchmarkReformat(data) as T_UserBenchmark[];
      setBenchmarks(benchmarks);
      const benchmarksRev = [...benchmarks];
      setBenchmarksReversed(benchmarksRev.reverse());
    });
  }, []);

  const renderBenchmarks = () => {
    return (
      <div className='p-4'>
        <h1 className='text-center mb-6'>Viewing benchmarks for: {username}</h1>

        <div className='mb-8 flex flex-col items-center'>
          <LineChart width={800} height={400} data={benchmarksReversed as any[]}>
            <XAxis dataKey="completed" tick={ false }/>
            <YAxis tick={{ fill: '#ccc' }} />
            <CartesianGrid stroke="#aaa" strokeDasharray="5 5"/>
            <Line type="monotone" dataKey="WPM" stroke="#8884d8" autoReverse />
            <Tooltip
              contentStyle={{ backgroundColor: '#000' }}
              itemStyle={{ color: '#000' }}
              cursor={ false }
            />
            <Legend />
          </LineChart>
        </div>
        
        <div className="relative overflow-x-auto">
          <table className="mx-auto text-sm text-center text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  WPM
                </th>
                <th scope="col" className="px-6 py-3">
                  Completed
                </th>
                <th scope="col" className="px-6 py-3">
                  Elapsed Time (seconds)
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks &&
                benchmarks.map((benchmark, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {benchmark.WPM}
                    </th>
                    <td className="px-6 py-4">
                      {benchmark.completed}
                    </td>
                    <td className="px-6 py-4">
                      {benchmark.elapsedTime}
                    </td> 
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      );
    }

  const renderError = () => {
    return (
      <div className='p-4'>
        <h3 className='mb-4'>No benchmarks available for {username}</h3>
        <p><Link to='/' className='text-blue-300'>Click here to go back to the home page.</Link></p>
      </div>
    );
  }

  return (
    <>
    { benchmarks && benchmarks.length > 0
      ? renderBenchmarks()
      : renderError()
    }
    </>
  );
}

export default UserBenchmarks