import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div>
      <Link to='/practice' className="p-4 block text-white">Practice</Link>
      <Link to='/testsocket' className="p-4 block text-white">Socket Test</Link>
    </div>
  )
}

export default Home