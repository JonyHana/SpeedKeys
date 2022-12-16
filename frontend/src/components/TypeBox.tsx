import { ChangeEvent, useEffect, useState } from "react";

type TypeBoxProp = {
  sentence: string;
};

const STATUS_COLORS: { [index: number]: string } = {
  0: 'text-neutral-400',
  1: 'text-lime-400',
  2: 'text-red-400',
  4: 'text-neutral-300',
}

const TypeBox = ({ sentence }: TypeBoxProp) => {
  const [words, setWords] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  //const [cursorIndex, setCursorIndex] = useState<number>(0); // currentWordIndex + len
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  // 0 = incomplete, 1 = correct, 2 = incorrect
  // Letters will be compared to position index in sentence prop.
  const [lettersStatus, setLettersStatus] = useState<number[]>([]);
  // Highlighting from left to cursorIndex.
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  useEffect(() => {
    let wordsArr = sentence.split(' ');
    let setWordsArr = wordsArr.map((word, key) => {
      //console.log(word, key, wordsArr.length);
      return (key !== wordsArr.length - 1) ? word + '\u00A0' : word;
    })
    //console.log(setWordsArr);
    
    let ltrsStatInit: number[] = [];
    for (let i = 0; i < sentence.length; i++) {
      ltrsStatInit.push(0);
    }
    
    setLettersStatus(ltrsStatInit);
    setWords(setWordsArr);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inTxt = e.target.value;
    const inLen = inTxt.length;
    const cursor = currentWordIndex + inLen;

    if (cursor > sentence.length) {
      return false;
    }

    setInputText(inTxt);
    //setCursorIndex(cursor);

    let wordFill = sentence.substring(currentWordIndex, cursor);
    //console.log(inTxt, wordFill, inTxt === wordFill, cursor, sentence.length);
    if (inTxt === wordFill) {
      if (cursor === sentence.length) {
        console.log('game end');
        setInputDisabled(true);
        setInputText('');
        setCurrentWordIndex(cursor + 1);
      }
      else if (inTxt[inLen - 1] === ' ') {
        console.log('word complete');
        setInputText('');
        setCurrentWordIndex(cursor);
      }
    }
    else {
      console.log('wrong');
    }
  }
  
  useEffect(() => {
    if (lettersStatus.length === 0) return; // To make sure lettersStatus has been initialized.

    let cursor = currentWordIndex + (inputText.length);
    let wordFill = sentence.substring(currentWordIndex, cursor);

    setLettersStatus(
      lettersStatus.map((status, index, arr) => {
        //console.log(status, index, arr);
        
        if (index >= cursor) return 0;
        if (index < currentWordIndex) return 4;
        
        return (inputText === wordFill) ? 1 : 2;
      })
    );
  }, [inputText]);
  
  return (
    <div className="w-5/12">
      <div className="bg-neutral-900 w-auto text-2xl p-3 rounded-lg">
        {words &&
          (() => {
            let slength = 0;
            return words.map((word, wkey) => {
              slength += word.length;
              let letters = [...word];
              return (
                <span className='word inline-block' key={wkey}>
                  {letters.map((letter, lkey) => {
                    let statusColor = STATUS_COLORS[lettersStatus[(slength - word.length) + lkey]];
                    return (
                      <span className={`letter ${statusColor}`} key={lkey}>{letter}</span>
                    );
                  })}
                </span>
              );
            })
          })()
        }
      </div>
      <input
        type='text'
        /* className='opacity-0 cursor-default' */
        value={inputText}
        disabled={inputDisabled}
        onChange={handleInputChange}
        onCopy={(e) => { e.preventDefault(); return false; }}
        onPaste={(e) => { e.preventDefault(); return false; }}
      />
    </div>
  )
}

export default TypeBox