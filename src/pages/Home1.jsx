import { useState, useEffect } from "react";
import { getVocab } from "../services/getVocab";

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

      <button onClick={() => setPart("part5")}>part 5</button>
      <button onClick={() => setPart("part6")}>part 6</button>
      <button onClick={() => setPart("part7")}>part 7</button>

      <div>
        {vocab.map((item) => (
          <div key={item.id}>
            <h3>{item.word}</h3>
            <p>{item.meaning_th}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home1;