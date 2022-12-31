import { useEffect, useState } from "react";
import { Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import TypingPractice from "./components/page/TypePractice";
import Home from "./components/page/Home";

import SocketTest from "./components/page/SocketTest";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<TypingPractice />} />
        <Route path="/testsocket" element={<SocketTest />} />
        <Route path="*" element={<span style={{color:'#f00'}}>404 Page Not Found</span>} />
      </Routes>
    </>
  )
}

export default App
