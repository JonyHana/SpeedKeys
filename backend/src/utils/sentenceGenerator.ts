import wordsJSON from './words.json';
const words: string[] = wordsJSON;

const MAX_WORDS = 30;

export default function sentenceGenerator() { 
  let count = 0;
  let sentence = '';

  while (count < MAX_WORDS) {
    let word = words[Math.floor(Math.random() * words.length)]; 
    sentence += word + (count < MAX_WORDS - 1 ? ' ' : '');
    count++;
  }

  return sentence;
}
