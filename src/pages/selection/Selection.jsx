import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVocab } from "../../services/vocabService";
import "./SelectionStyle.css";
import { icon } from "@fortawesome/fontawesome-svg-core";

export default function Selection() {
  const navigate = useNavigate();
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
    <div className="flex flex-col min-h-[calc(100vh-64px)] items-center bg-surface p-4 sm:p-10 transition-colors duration-300">
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="font-display text-4xl sm:text-[3.5rem] leading-tight font-extrabold text-primary tracking-tight mb-4">
            Academic Modules
          </h1>
          <p className="font-body text-xl text-on-surface-variant font-medium max-w-2xl">
            Select a disciplined assessment pathway to refine your linguistic mechanics and comprehension.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partMenu.map((part, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedPart(part.value);
                localStorage.setItem("selectedPart", part.value);
                navigate("/quiz");
              }}
              className="group cursor-pointer bg-surface-container-low rounded-[2rem] p-8 transition-all duration-500 hover:bg-surface-container-lowest hover:shadow-ambient hover:-translate-y-2 border border-outline-variant relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/20"
              tabIndex={0}
            >
              {/* Hover Light-Play Element */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-secondary/20 to-secondary-container/0 rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div
                    className="w-16 h-16 rounded-[1rem] flex items-center justify-center bg-primary-fixed shadow-sm group-hover:bg-primary transition-colors duration-500"
                  >
                    <i className={`${part.icon} text-on-primary-fixed group-hover:text-on-primary text-3xl transition-colors duration-500`}></i>
                  </div>
                  <div className="bg-surface-container-high px-4 py-1.5 rounded-full">
                    <span className="font-body text-xs font-bold text-on-surface tracking-widest uppercase">
                      {part.length} ITEMS
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <h3 className="font-display text-3xl font-bold text-on-surface mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {part.title}
                  </h3>
                  <p className="font-body text-on-surface-variant text-lg font-medium leading-relaxed">
                    {part.subTitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
