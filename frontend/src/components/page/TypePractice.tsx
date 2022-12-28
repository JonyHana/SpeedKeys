import { useEffect, useState } from "react";
import TypeBox from "../TypeBox";

const TypePage = () => {
  const [sentence, setSentence] = useState<string>();
  
  const grabSentenceFromServer = () => {
    let grabbed = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores ipsam necessitatibus corporis aperiam provident sed, eius iste, cupiditate fugiat sint aliquam et architecto? Natus asperiores eligendi, est similique quisquam modi!';
    grabbed = grabbed.substring(0, grabbed.length - 100);
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
        <div className="text-white text-2xl">
          Created by <span className="text-green-400">Jonathan Hana</span>
        </div>
      </div>
    </div>
  )
}

export default TypePage