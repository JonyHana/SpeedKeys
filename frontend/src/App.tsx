import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from 'react-router-dom';

import Navbar from "./components/Navbar";
import TypingPractice from "./pages/TypePractice";
import Home from "./pages/Home";
import SocketTest from "./pages/SocketTest";
import LoginPage from "./pages/LoginPage";

import { T_UserInfo } from "./types";
import LogoutPage from "./pages/LogoutPage";
import UserBenchmarks from "./pages/UserBenchmarks";

function App() {
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL}/`,
      { method: 'GET', credentials: "include" }
    )
    .then((res) => res.json())
    .then((data: T_UserInfo) => {
      if (data.username) {
        console.log('User authed', data);
        setUsername(data.username);
      }
      else {
        console.log('User not authenticated');
      }
    })
    .catch((e) => {
      console.warn('Auth error occured ->', e);
    });
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home username={username} />} />
        <Route path="/practice" element={<TypingPractice />} />
        <Route path="/testsocket" element={<SocketTest />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/benchmarks/" element={<Navigate to='/' />} />
        <Route path="/benchmarks/:username" element={<UserBenchmarks />} />
        <Route path="*" element={<span style={{color:'#f00'}}>404 Page Not Found</span>} />
      </Routes>
    </>
  )
}

export default App
