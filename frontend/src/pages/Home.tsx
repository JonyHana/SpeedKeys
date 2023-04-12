import { Link } from "react-router-dom"
import { T_Prop_HomePage } from "../types"

const Home = ({ username }: T_Prop_HomePage) => {
  return (
    <div>
      <Link to='/practice' className="p-4 block text-white">Practice</Link>
      <Link to='/testsocket' className="p-4 block text-white">Socket Test</Link>
      {!username
        ? <Link to='/login' className="p-4 block text-white">Login</Link>
        : <Link to='/logout' className="p-4 block text-white">Logout</Link>
      }
    </div>
  )
}

export default Home