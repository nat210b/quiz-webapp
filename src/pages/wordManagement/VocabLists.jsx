import { useState, useEffect } from "react";
import { getAllVocab } from "../../services/vocabService";
import AddEditWord from "../../components/wordManagement/AddEditWord";
import "./VocabLists.css";

function VocabLists() {
  const [vocabList, setVocabList] = useState([]);
  const [searchVocab, setSearchVocab] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  function handleClickEditWord(item) {
    setIsAddingNew(false);
    setSelectedWord(item);
  }

  async function refreshVocabList() {
    const data = await getAllVocab();
    setVocabList(data);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await getAllVocab();
      if (cancelled) return;
      setVocabList(data);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-center p-3 ">
        <h1>Vocabulary Lists</h1>
        <div className="flex justify-between">
          <p>Managing the vocabulary lists</p>
          <div className="flex gap-2 pb-1">
            <input
              type="search"
              name="search_vocab"
              id="search_vocab"
              placeholder="Search..."
              onChange={(event) => setSearchVocab(event.target.value)}
            />
            <button
              onClick={() => {
                setSelectedWord(null);
                setIsAddingNew(true);
              }}
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Add New
            </button>
          </div>
        </div>
        <table className="table-auto">
          <thead>
            <tr>
              <th>Word</th>
              <th>Word Type</th>
              <th>Meaning (TH)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vocabList
              .filter((word) =>
                word.word.toLowerCase().includes(searchVocab.toLowerCase()),
              )
              .map((word) => (
                <tr key={word.id}>
                  <td>{word.word}</td>
                  <td>{word.word_type}</td>
                  <td>{word.meaning_th}</td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleClickEditWord(word)}
                      >
                        Edit
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {(selectedWord || isAddingNew) && (
        <AddEditWord
          item={selectedWord}
          isNew={isAddingNew}
          onSaved={refreshVocabList}
          onClose={() => {
            setSelectedWord(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </>
  );
}
export default VocabLists;
