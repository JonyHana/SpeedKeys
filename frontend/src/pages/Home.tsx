import { Link } from "react-router-dom"
import { T_Prop_HomePage } from "../types"
import RecentGames from "../components/RecentGames"

const Home = ({ username }: T_Prop_HomePage) => {
  return (
    <>
      <div className="flex flex-col text-center justify-center p-20 mx-auto gap-10 w-1/2">
        <h1 className="text-6xl text-amber-200">SpeedKeys</h1>
        <p>A type gaming website to benchmark your WPM performance!</p>
        <section className="flex justify-center gap-10">
          <button className="p-2 rounded-sm font-semibold text-white bg-blue-700">
            <Link to='/practice' className="text-white">Play {!username && 'as Guest'}</Link>
          </button>
          {!username
            ? <button className="p-2 rounded-sm font-semibold text-white bg-lime-700">
                <Link to='/login' className="text-white">Sign Up / Login</Link>
              </button>
            : <button className="p-2 rounded-sm font-semibold text-white bg-orange-500">
                <Link to='/logout' className="text-white">Logout</Link>
              </button>
          }
        </section>

        <section className="mt-4">
          <h4 className="mb-4">Recent Games</h4>
          <RecentGames />
        </section>
      </div>
      
      <footer className="text-center text-2xl mb-6">
        Created by <a href="https://github.com/JonyHana" className="text-green-400">Jonathan Hana</a>
      </footer>
    </>
  )
}

export default Home