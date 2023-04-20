import { useState, ChangeEvent, MouseEvent } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

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
      //console.log('Login error -> Invalid username or password.');
      setErrorMsg('Invalid username or password.');
    }
    else { // Either registration error or success.
      const data = await res.json();
      console.log(data);

      if (data.registerError) {
        //console.log('Registration error ->', data.error);
        setErrorMsg('Invalid username. That username already exists.');
        return;
      }

      // Redirect to index page. Need to do a full refresh instead of useNavigate to obtain auth info.
      window.location.href = '/';
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
    <div className="max-w-lg bg-neutral-700 shadow-2xl mx-auto text-center py-12 mt-4 rounded-lg">
        <h1 className="text-gray-200 text-center font-extrabold -mt-3 text-3xl">Login or Sign-Up</h1>
        <div className="container py-5 max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <input
                        type='text'
                        name='username'
                        placeholder="Username"
                        value={username}
                        onChange={handleInputChange}
                        className="shadow appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                </div>
                <div className="mb-6">
                  <input
                      type='password'
                      name='password'
                      placeholder="Password"
                      value={password}
                      onChange={handleInputChange}
                      className="shadow appearance-none  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                    />
                </div>
                <div className="flex items-center justify-between mb-5">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        name='register'
                        onClick={handleClick}>
                        Sign-Up
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        name='login'
                        onClick={handleClick}>
                        Login
                    </button>
                </div>
            </form>

            {errorMsg.length > 0 &&
              <p className='font-semibold text-red-400'>{errorMsg}</p>
            }
        </div>
    </div>
  );
}

export default LoginPage