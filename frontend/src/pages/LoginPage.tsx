import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/user/register`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      }
    );
    
    const data = await res.json();

    if (data.error) {
      console.log('Registration error ->', data.error);
      return;
    }

    // Redirect to index page.
    navigate('/');
    // Need to retrieve auth info after heading to index page.
    location.reload();
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') {
      setUsername(event.target.value);
    }
    else {
      setPassword(event.target.value);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type='username' name='username' value={username} onChange={handleInputChange} placeholder='Insert Username Here' />
        <input type='password' name='password' value={password} onChange={handleInputChange} placeholder='Insert Password Here' />
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default LoginPage