import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { T_UserBenchmark } from '../types';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

const UserBenchmarks = () => {
  const { username } = useParams();

  const [benchmarks, setBenchmarks] = useState<T_UserBenchmark[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/benchmarks/${username}`)
    .then((res) => res.json())
    .then((data: T_UserBenchmark[]) => {
      data.map((benchmark) => {
        const bm = benchmark;
        bm.completed = (new Date(benchmark.completed)).toLocaleString();
        return bm;
      });
      //console.log(data);
      setBenchmarks(data);
    });
  }, []);

  const renderBenchmarks = () => {
    return (
      <div className='p-4'>
        <h1 className='text-center mb-6'>Viewing benchmarks for: {username}</h1>

        <div className='flex flex-col items-center'>
          <LineChart width={800} height={400} data={benchmarks as any[]}>
            <XAxis dataKey="completed" tick={ false }/>
            <YAxis tick={{ fill: '#ccc' }} />
            <CartesianGrid stroke="#aaa" strokeDasharray="5 5"/>
            <Line type="monotone" dataKey="WPM" stroke="#8884d8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#000' }}
              itemStyle={{ color: '#000' }}
              cursor={ false }
            />
            <Legend />
          </LineChart>
        </div>

        <div className='flex flex-col items-center'>
          {benchmarks &&
            benchmarks.map((benchmark, index) => {
              return (
                <div key={index}>
                  <br/>
                  WPM: {benchmark.WPM}
                  <br/>
                  Completed: {benchmark.completed}
                  <br/>
                  Elapsed Time: {benchmark.elapsedTime}
                  <br/>
                </div>
              )
            })
          }
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