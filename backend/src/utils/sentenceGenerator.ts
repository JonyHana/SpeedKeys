export default function sentenceGenerator() {
  const sentence = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores ipsam necessitatibus corporis aperiam provident sed, eius iste, cupiditate fugiat sint aliquam et architecto? Natus asperiores eligendi, est similique quisquam modi!';
  return sentence.substring(0, sentence.length - (Math.floor(Math.random() * 150)));
}
