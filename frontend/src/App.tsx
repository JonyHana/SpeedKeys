import { useEffect, useState } from "react";
import TypeBox from "./components/TypeBox";

function App() {
  let [sentence, setSentence] = useState<string>();
  
  const grabSentenceFromServer = () => {
    let grabbed = 'The quick brown fox jumps over the lazy dog. '.repeat(2);
    grabbed = grabbed.substring(0, grabbed.length - 1);
    setSentence(grabbed);
  }
  
  useEffect(() => {
    grabSentenceFromServer();
  }, []);

  return (
    <div className="h-screen w-screen">
      <div className="grid h-screen place-items-center">
        {sentence &&
          <TypeBox sentence={sentence} />
        }
        <footer className="text-white text-2xl">
          Created by <span className="text-green-400">Jonathan Hana</span>
        </footer>
      </div>
    </div>
  )
}

export default App
