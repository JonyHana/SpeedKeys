import { ChangeEvent, useEffect, useRef, useState } from "react";

type TypeBoxProp = {
  sentence: string;
};

const TypeBox = ({ sentence }: TypeBoxProp) => {
  const [incompleteText, setIncompleteText] = useState<string>('');
  const [correctText, setCorrectText] = useState<string>('');
  const [incorrectText, setIncorrectText] = useState<string>('');

  const [inputText, setInputText] = useState<string>('');
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [cursorCorrectIndex, setCursorCorrectIndex] = useState<number>(0);
  const [cursorIncorrectIndex, setCursorIncorrectIndex] = useState<number>(0);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('handleInputChange');

    setInputText(e.target.value);

    let txt = e.target.value;
    let len = txt.length;

    let match = sentence.substring(currentWordIndex, currentWordIndex + len);

    let delimiter = sentence.indexOf(' ', currentWordIndex);
    console.log(currentWordIndex, delimiter);
    delimiter = (delimiter === -1) ? sentence.length - 1 : delimiter;
    let word = sentence.substring(currentWordIndex, delimiter + 1);

    console.log('word', word, word.length, '; ', txt, txt.length);

    if (txt === match) {
      console.log('ok');

      if (txt === word) {
        setInputText('');
        
        if (delimiter + 1 === sentence.length) {
          console.log('game finished');
          setIsInputDisabled(true);
        }
        else {
          setCurrentWordIndex(delimiter + 1);
          setCursorCorrectIndex(currentWordIndex);
          setCursorIncorrectIndex(currentWordIndex);
          console.log('matched\nnew position', currentWordIndex, sentence[currentWordIndex]);
        }
      }
    }
    else {
      console.log('nope');
    }

    // (RESUME)
    if (txt === match) {
      console.log('setCursorCorrectIndex');
      setCursorCorrectIndex(currentWordIndex + len);
      setCursorIncorrectIndex(currentWordIndex + len);
    }
    else {
      console.log('setCursorIncorrectIndex');
      setCursorIncorrectIndex(currentWordIndex + len);
    }
    
    console.log(cursorCorrectIndex, sentence.substring(0, cursorCorrectIndex));
  }

  const handleClick = () => {
    console.log('handleClick');
    if (inputRef.current)
      inputRef.current.focus();
    else
      console.log('[E] could not get input.');
  }
  
  useEffect(() => {
    setIncompleteText(sentence);
  }, []);

  useEffect(() => {
    setCorrectText(sentence.substring(0, cursorCorrectIndex));
    setIncompleteText(
      sentence.substring(
        (cursorCorrectIndex > cursorIncorrectIndex) ? cursorCorrectIndex : cursorIncorrectIndex,
        sentence.length)
    );
    setIncorrectText(sentence.substring(cursorCorrectIndex, cursorIncorrectIndex));
  }, [currentWordIndex, cursorCorrectIndex, cursorIncorrectIndex]);
  
  // NOTE: make sure to give invisible input the class 'opacity-0' when done testing.
  return (
    <div className="w-5/12">
      <div onClick={handleClick} className="bg-neutral-900 text-gray-300 w-auto text-2xl p-3 rounded-lg select-none">
        <span className="text-lime-400">{correctText}</span>
        <span className="text-red-400">{incorrectText}</span>
        <span>{incompleteText}</span>
      </div>
      <input
        type='text'
        onChange={handleInputChange}
        className='cursor-default'
        ref={inputRef}
        value={inputText}
        disabled={isInputDisabled} />
    </div>
  )
}

export default TypeBox