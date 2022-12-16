import { ChangeEvent, useEffect, useState } from "react";

type TypeBoxProp = {
  sentence: string;
};

const STATUS_COLORS: { [index: number]: string } = {
  0: 'text-neutral-400',
  1: 'text-lime-400',
  2: 'text-red-400',
}

const TypeBox = ({ sentence }: TypeBoxProp) => {
  const [words, setWords] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');

  //const [cursorIndex, setCursorIndex] = useState<number>(0); // currentWordIndex + len
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  //const [cursorCorrectIndex, setCursorCorrectIndex] = useState<number>(0);
  // 0 = incomplete, 1 = correct, 2 = incorrect
  // Letters will be compared to position index in sentence prop.
  const [lettersStatus, setLettersStatus] = useState<number[]>([]);
  // Highlighting from left to cursorIndex.
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  useEffect(() => {
    let wordsArr: string[] = sentence.split(' ');
    let setWordsArr: string[] = wordsArr.map((word, key) => {
      //console.log(word, key, wordsArr.length);
      return (key !== wordsArr.length - 1) ? word + '\u00A0' : word;
    })
    //console.log(setWordsArr);
    
    let ltrsStatInit: number[] = [];
    for (let i: number = 0; i < sentence.length; i++) {
      ltrsStatInit.push(0);
    }
    
    setLettersStatus(ltrsStatInit);
    setWords(setWordsArr);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inTxt: string = e.target.value;
    let len: number = inTxt.length;

    if (len > sentence.length) {
      return false;
    }

    setInputText(inTxt);

    let cursor = currentWordIndex + len;
    //setCursorIndex(len);

    //console.log(cursorCorrectIndex, len);
    
    setLettersStatus(
      lettersStatus.map((status, index, arr) => {
        if (index >= cursor) return 0;
        if (index < currentWordIndex) return 0; // NOTE: temporarily 0, make this 1 later.
        
        let letter: string = sentence[index];
        let letter2: string = inTxt[index];

        return (letter === letter2) ? 1 : 2;
      })
    );
    
    // (RESUME)
    // TODO: check if word matches. also, this seems like it'd be good for setting letter status.
    let wordFill = sentence.substring(currentWordIndex, currentWordIndex + len);
    console.log(inTxt, wordFill, inTxt === wordFill);
    
    if (inTxt === wordFill) {
      if (len < sentence.length - 1) {
        console.log('game end');
      }
      else if (inTxt[len] === ' ') {
        console.log('word?');
      }
    }
  }
  
  return (
    <div className="w-5/12">
      <div className="bg-neutral-900 w-auto text-2xl p-3 rounded-lg">
        {words &&
          (() => {
            let slength = 0;
            return words.map((word, wkey) => {
              slength += word.length;
              let letters: string[] = [...word];
              return (<span className='word inline-block' key={wkey}>
                {letters.map((letter, lkey) => {
                  let statusColor = STATUS_COLORS[lettersStatus[(slength - word.length) + lkey]];
                  return <span className={`letter ${statusColor}`} key={lkey}>{letter}</span>
                })}
              </span>);
            })
          })()
        }
      </div>
      <input
        type='text'
        /* className='opacity-0 cursor-default' */
        value={inputText}
        onChange={handleInputChange}
        onCopy={(e) => { e.preventDefault(); return false; }}
        onPaste={(e) => { e.preventDefault(); return false; }}
      />
    </div>
  )
}

export default TypeBox