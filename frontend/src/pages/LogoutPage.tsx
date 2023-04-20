import { useEffect } from "react"

const LogoutPage = () => {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
      method: 'POST', credentials: 'include'
    })
    .then((res) => {
      // Redirect to index page. Need to do a full refresh instead of useNavigate to obtain auth info.
      window.location.href = '/';
    });
  }, [])

  return (
    <div></div>
  )
}

export default LogoutPage