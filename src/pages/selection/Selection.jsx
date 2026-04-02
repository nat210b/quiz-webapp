import { useState, useEffect, use } from "react";
import { getAllVocab } from "../../services/vocabService";
import "./SelectionStyle.css";
import { icon } from "@fortawesome/fontawesome-svg-core";

export default function Selection() {
  const [allVocab, setAllVocab] = useState([]);
  useEffect(() => {
    const fetchAllVocab = async () => {
      const vocab = await getAllVocab();
      setAllVocab(vocab);
    };
    fetchAllVocab();
  }, []);

  const partMenu = [
    {
      icon: "fas fa-book",
      iconColor: "text-blue-500",
      title: "Part5",
      subTitle: "Conjuction and Preposition",
      value: "part5",
      length: allVocab.filter((w) => w.part_scope === "part5").length,
    },
    {
      icon: "fas fa-book-open",
      iconColor: "text-purple-500",
      title: "Reading",
      subTitle: "Word in Reading Part (Part5-7)",
      value: "reading",
      length: allVocab.length,
    },
  ];
  const [selectedPart, setSelectedPart] = useState(null);
  useEffect(() => {
    localStorage.setItem("selectedPart", selectedPart);
  }, [selectedPart]);
  return (
    <div>
      <div className="image-container"></div>
      <div className="part-selection-container">
        {partMenu.map((part, index) => (
          <div
            key={index}
            onClick={() => setSelectedPart(part.value)}
            className={`part-card ${part.iconColor}`}
          >
            <div className="gap-2 flex items-center">
              <div
                className={`w-10 h-10 border rounded items-center justify-center flex ${part.iconColor}`}
              >
                <i className={part.icon}></i>
              </div>
              <p className="font-bold text-gray-500 ">{part.title}</p>
            </div>
            <p className="text-sm text-gray-400">{part.subTitle}</p>
            <p className="text-sm text-gray-400">{part.length} words</p>
          </div>
        ))}
      </div>
      <div className="loading-container"></div>
    </div>
  );
}
