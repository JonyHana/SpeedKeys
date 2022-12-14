import { ChangeEvent, useEffect, useRef, useState } from "react";

type TypeBoxProp = {
  sentence: string;
};

const TypeBox = ({ sentence }: TypeBoxProp) => {
  let [completedSentence, setCompletedSentence] = useState<string>('');
  let [incompleteSentence, setIncompleteSentence] = useState<string>('');
  let inputRef = useRef<HTMLInputElement>(null);

  let currentWordIndex = 0;
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('handleInputChange');
    let txt = e.target.value;
    let len = txt.length;

    sentence.substring(currentWordIndex, len - 1);

    //currentWordIndex += len;
  }

  const handleClick = () => {
    console.log('handleClick');
    if (inputRef.current)
      inputRef.current.focus();
    else
      console.log('[E] could not get input.');
  }

  // TEMP: debugging
  useEffect(() => {
    setCompletedSentence(sentence.substring(0, 20));
    setIncompleteSentence(sentence.substring(20, sentence.length));
  }, []);
  
  // NOTE: make sure to give invisible input the class 'opacity-0' when done testing.
  return (
    <div className="w-5/12">
      <div onClick={handleClick} className="bg-neutral-900 text-gray-300 w-auto text-2xl p-3 rounded-lg select-none">
        <span className="text-lime-400">{completedSentence}</span>
        <span className="text-red-400">{incompleteSentence}</span>
      </div>
      <input type='text' onChange={handleInputChange} className='cursor-default' ref={inputRef} />
    </div>
  )
}

export default TypeBox