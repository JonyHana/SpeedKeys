import { useState, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();  
  }
  
  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/user/${event.currentTarget.name}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      }
    );
    
    if (res.status === 401) { // Login error. Passport throws a 401 when there's no failureRedirect field set on the authenticate method.
      console.log('Login error -> Invalid username or password.');
    }
    else { // Either registration error or success.
      const data = await res.json();
      //console.log(data);
      
      if (data.error) {
        console.log('Registration error ->', data.error);
        return;
      }

      // Redirect to index page.
      navigate('/');
      // Need to retrieve auth info after heading to index page.
      location.reload();
    }
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
      <form className='w-[300px] flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type='username' name='username' value={username} onChange={handleInputChange} placeholder='Insert Username Here' />
        <input type='password' name='password' value={password} onChange={handleInputChange} placeholder='Insert Password Here' />
        <button type='submit' name='login' onClick={handleClick}>Login</button>
        <button type='submit' name='register' onClick={handleClick}>Sign Up</button>
      </form>
    </div>
  )
}

export default LoginPage