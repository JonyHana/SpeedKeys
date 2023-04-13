import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LogoutPage = () => {
  const navigate = useNavigate();
 
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
      method: 'POST', credentials: 'include'
    })
    .then((res) => {
      // Redirect to index page.
      navigate('/');
      // Need to retrieve auth info after heading to index page.
      location.reload();
    });
  }, [])

  return (
    <div></div>
  )
}

export default LogoutPage