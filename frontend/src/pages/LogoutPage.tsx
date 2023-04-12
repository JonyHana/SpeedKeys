import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LogoutPage = () => {
  const navigate = useNavigate();
 
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
      method: 'POST', credentials: 'include'
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
  }, [])

  return (
    <div></div>
  )
}

export default LogoutPage