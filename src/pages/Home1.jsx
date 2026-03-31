import { useState, useEffect } from "react";
import { getVocab } from "../services/vocabService";

function Home1() {
  const [part, setPart] = useState(null);
  const [vocab, setVocab] = useState([]);

  useEffect(() => {
    if (!part) return;

    const fetchData = async () => {
      const data = await getVocab(part);
      setVocab(data);
    };

    fetchData();
  }, [part]);

  return (
    <div>
      <h1>select part : {part}</h1>
      <p>Total vocab: {vocab.length}</p>
      <button onClick={() => setPart("part5")}>part 5</button>
      <button onClick={() => setPart("part6")}>part 6</button>
      <button onClick={() => setPart("part7")}>part 7</button>
    </div>
  );
}

export default Home1;
