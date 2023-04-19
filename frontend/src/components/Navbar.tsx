import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
      <h1 className="p-4 text-4xl text-amber-200">
        <Link to='/'>SpeedKeys</Link>
      </h1>
    </nav>
  )
}

export default Navbar