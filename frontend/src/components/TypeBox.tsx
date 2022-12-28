import { ChangeEvent, useEffect, useState, useRef, MouseEvent } from "react";

type TypeBoxProp = {
  sentence: string;
};

const TEXT_STATUS_COLORS: { [index: number]: string } = {
  0: 'text-neutral-400',
  1: 'text-lime-400',
  2: 'text-red-400',
  4: 'text-neutral-300',
}

const BG_STATUS_COLORS: { [index: number]: string } = {
  0: 'bg-neutral-400',
  1: 'bg-lime-400',
  2: 'bg-red-400',
  4: 'bg-lime-300',
}

const TypeBox = ({ sentence }: TypeBoxProp) => {
  const [words, setWords] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  const inputBoxRef = useRef<HTMLInputElement>(null);
  
  const [baseCursorIndex, setBaseCursorIndex] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  // 0 = incomplete, 1 = correct, 2 = incorrect
  // Letters will be compared to position index in sentence prop.
  const [lettersStatus, setLettersStatus] = useState<number[]>([]);
  // Highlighting from left to cursorIndex.
  //const [highlightIndex, setHighlightIndex] = useState<number>(0);

  // TypeBox initialization
  useEffect(() => {
    const wordsArr = sentence.split(' ');
    const setWordsArr = wordsArr.map((word, key) => {
      //console.log(word, key, wordsArr.length);
      return (key !== wordsArr.length - 1) ? word + ' ' : word;
    })
    //console.log(setWordsArr);
    
    let ltrsStatInit: number[] = [];
    for (let i = 0; i < sentence.length; i++) {
      ltrsStatInit.push(0);
    }
    
    setLettersStatus(ltrsStatInit);
    setWords(setWordsArr);
  }, []);
 
  // Changing letter status
  useEffect(() => {
    // To make sure lettersStatus has been initialized.
    if (lettersStatus.length === 0) return;

    const localCursorIndex = inputText.length;
    //let wordFill = words[currentWordIndex].substring(0, localCursorIndex);
    let localCursorIndex2 = 0;

    setLettersStatus(
      lettersStatus.map((status, index, arr) => {
        //console.log(status, index, arr);
        
        if (index >= baseCursorIndex + localCursorIndex) return 0;
        if (index < baseCursorIndex) return 4;
        
        const ltr1 = sentence[index];
        const ltr2 = inputText[localCursorIndex2];
        localCursorIndex2++;
        
        return (ltr1 === ltr2) ? 1 : 2;
        //return (inputText === wordFill) ? 1 : 2;
      })
    );
  }, [inputText]);
  
  // When the current word is completed
  useEffect(() => {
    // To make sure not to execute on TypeBox initialization.
    if (baseCursorIndex === 0) return;

    const localCursorIndex = inputText.length;
    const globalCursorIndex = baseCursorIndex + localCursorIndex;
    
    if (globalCursorIndex === sentence.length) {
      //console.log('sentence complete');
      setInputDisabled(true);
      setInputText('');
      setBaseCursorIndex(globalCursorIndex + 1);
    }
    else {
      //console.log('word complete');
      setInputText('');
      setBaseCursorIndex(globalCursorIndex);
    }
    
    //console.log('setCurrentWordIndex(currentWordIndex + 1)');
    setCurrentWordIndex(currentWordIndex + 1);
  }, [baseCursorIndex]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inTxt = e.target.value;
    const localCursorIndex = inTxt.length;
    const currWord = words[currentWordIndex];
    
    if (localCursorIndex > currWord.length) {
      return false;
    }

    setInputText(inTxt);

    const wordFill = currWord.substring(0, localCursorIndex);
    if (inTxt === wordFill && localCursorIndex === currWord.length) {
      setInputText('');
      setBaseCursorIndex(baseCursorIndex + localCursorIndex);
    }
    /*else {
      console.log('wrong');
    }*/
  }
  
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (inputBoxRef && inputBoxRef.current)
      inputBoxRef.current.focus();
    else
      console.log('[E] no input found');
  }
  
  return (
    <div className="w-5/12" onClick={handleClick}>
      <div className="bg-neutral-900 w-auto text-3xl p-3 rounded-lg">
        {words &&
          (() => {
            let slength = 0;
            return words.map((word, wkey) => {
              slength += word.length;
              const letters = [...word];
              return (
                <span className='word inline-block' key={wkey}>
                  {letters.map((letter, lkey) => {
                    const globIndex = (slength - word.length) + lkey;
                    const ltr = (letter === ' ' ? '\u00A0' : letter);
                    let statusColor = TEXT_STATUS_COLORS[lettersStatus[globIndex]];
                    
                    // Need to color background of whitespace since text coloring won't work for it.
                    if (inputText.length > 0 && (globIndex === baseCursorIndex + inputText.length - 1) && letter === ' ') {
                      statusColor = BG_STATUS_COLORS[lettersStatus[globIndex]];
                    }
                    
                    // Mimicks a text cursor.
                    // Bug: Does not account for input text cursor. Using left and right arrow can break this.
                    if (baseCursorIndex + inputText.length === globIndex) {
                      statusColor += ' bg-slate-700';
                    }
                    
                    return (
                      <span className={`letter ${statusColor}`} key={lkey}>{ltr}</span>
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
        className='opacity-0 cursor-default'
        value={inputText}
        disabled={inputDisabled}
        ref={inputBoxRef}
        onChange={handleInputChange}
        onCopy={(e) => { e.preventDefault(); return false; }}
        onPaste={(e) => { e.preventDefault(); return false; }}
      />
    </div>
  )
}

export default TypeBox