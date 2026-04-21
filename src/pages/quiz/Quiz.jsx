import { useEffect, useState } from "react";
import { getVocab } from "../../services/vocabService";
import "./QuizStyle.css";

export default function Quiz() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [allVocab, setAllVocab] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState([]);
  const [isAnswer, setIsAnswer] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setSelectedPart(localStorage.getItem("selectedPart"));
    const fetchAllVocab = async () => {
      const vocabs = await getVocab(localStorage.getItem("selectedPart"));
      setAllVocab(vocabs);
    };
    setOptions([
      { title: "conjunction", value: "conj" },
      { title: "preposition", value: "prep" },
    ]);
    fetchAllVocab();
  }, []);
  const nextQuestion = () => {
    if (answer === allVocab[index].word_type) {
      setScore(score + 1);
    }
    setIndex(index + 1);
    setAnswer("");
    setIsAnswer(false);
    setIsCorrect(false);
  };
  const selectOptionAnswer = (value) => {
    if (isAnswer) return;
    setAnswer(value);
    setIsAnswer(true);
    if (value === allVocab[index].word_type) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };
  return (
    <div>
      <h1>TOEIC {selectedPart} Vocab</h1>
      <div>
        <div className="quiz-body">
          <div className="card">
            <div>
              <div className="flex justify-end">
                <p>
                  Score: {score}/ {allVocab.length}
                </p>
              </div>
              {allVocab.length === 0 ? (
                <p>Loading...</p>
              ) : (
                <h2 style={{ color: "black" }} className="text-center">
                  {allVocab[index].word.charAt(0).toUpperCase() +
                    allVocab[index].word.slice(1)}
                </h2>
              )}
            </div>
            <div>
              <div className="option-body">
                {options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => selectOptionAnswer(option.value)}
                    className={`option-button ${
                      isAnswer && answer === option.value
                        ? isCorrect
                          ? "correct"
                          : "incorrect"
                        : ""
                    }`}
                  >
                    {option.title}
                  </div>
                ))}
              </div>
              <button onClick={nextQuestion} disabled={!isAnswer}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
