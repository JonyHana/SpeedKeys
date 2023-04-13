import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserBenchmarks = () => {
  const { username } = useParams();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/benchmarks/${username}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
  }, []);

  return (
    <div>UserBenchmarks</div>
  )
}

export default UserBenchmarks