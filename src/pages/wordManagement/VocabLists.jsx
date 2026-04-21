import { useState, useEffect } from "react";
import { getAllVocab } from "../../services/vocabService";
import AddEditWord from "../../components/wordManagement/AddEditWord";

function VocabLists() {
  const [vocabList, setVocabList] = useState([]);
  const [searchVocab, setSearchVocab] = useState("");
  const [filterWordType, setFilterWordType] = useState("");
  const [filterPartScope, setFilterPartScope] = useState("");
  const [filterIsDualType, setFilterIsDualType] = useState(false);

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

  const filteredList = vocabList.filter((word) => {
    const matchesSearch = word.word
      .toLowerCase()
      .includes(searchVocab.toLowerCase());
    const matchesWordType = filterWordType
      ? word.word_type === filterWordType
      : true;
    const matchesPartScope = filterPartScope
      ? word.part_scope === filterPartScope
      : true;
    const matchesDualType = filterIsDualType ? !!word.dual_type : true;

    return (
      matchesSearch && matchesWordType && matchesPartScope && matchesDualType
    );
  });

  return (
    <>
      <div className="h-[calc(100vh-75px)] bg-gradient-to-br from-[#0d1021] via-[#131729] to-[#1a1f35] font-['DM_Sans',sans-serif] text-[#c8d0e8] p-6 sm:p-8 flex flex-col">
        <div className="max-w-7xl w-full mx-auto space-y-4 flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-3 border-b border-[#252c44] pb-4 shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-[#e8d5a3] tracking-wide mb-1">
                Vocabulary Lists
              </h1>
              <p className="text-sm text-[#7a84a8]">
                จัดการรายการคำศัพท์ในระบบ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter: Part Scope */}
              <div className="relative">
                <select
                  value={filterPartScope}
                  onChange={(e) => setFilterPartScope(e.target.value)}
                  className="appearance-none px-4 pr-10 py-2.5 rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
                >
                  <option value="">All Parts</option>
                  <option value="part5">Part 5</option>
                  <option value="reading">Reading</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7a84a8]">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>

              {/* Filter: Word Type */}
              <div className="relative">
                <select
                  value={filterWordType}
                  onChange={(e) => setFilterWordType(e.target.value)}
                  className="appearance-none px-4 pr-10 py-2.5 rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
                >
                  <option value="">All Types</option>
                  <option value="conj">Conjunction</option>
                  <option value="prep">Preposition</option>
                  <option value="adv">Adverb</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adj">Adjective</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7a84a8]">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>

              {/* Filter: Is Dual Type Toggle */}
              <label className="flex items-center select-none gap-2 cursor-pointer text-sm font-medium text-[#c8d0e8] bg-[#1e2235] border border-[#2e3450] py-2.5 px-4 rounded-xl hover:bg-[#252a40] transition-colors">
                <input
                  type="checkbox"
                  checked={filterIsDualType}
                  onChange={(e) => setFilterIsDualType(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2e3450] text-[#4f8ef7] focus:ring-[#4f8ef7] bg-[#0d1020] cursor-pointer"
                  style={{ accentColor: "#4f8ef7" }}
                />
                Dual Type
              </label>

              <div className="relative">
                <input
                  type="search"
                  name="search_vocab"
                  id="search_vocab"
                  placeholder="ค้นหาคำศัพท์..."
                  onChange={(event) => setSearchVocab(event.target.value)}
                  className="appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] placeholder-[#7a84a8]/50 focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-colors shadow-inner w-56 lg:w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7a84a8]">
                  <i className="fas fa-search text-sm"></i>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedWord(null);
                  setIsAddingNew(true);
                }}
                className="flex items-center shrink-0 gap-2 py-2.5 px-5 rounded-xl shadow-[0_0_15px_rgba(79,207,138,0.2)] text-sm font-bold text-[#0f2a1e] bg-[#4fcf8a] hover:bg-[#3ba66e] transition-all transform hover:-translate-y-0.5"
              >
                <i className="fas fa-plus"></i> Add New
              </button>
            </div>
          </div>

          <div className="bg-[#161b2e] rounded-[20px] border border-[#252c44] shadow-2xl relative flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10 bg-[#0f1322] shadow-sm">
                  <tr className="border-b border-[#252c44] text-[#7a84a8] text-xs uppercase tracking-wider whitespace-nowrap">
                    <th className="py-4 px-6 font-semibold">Word</th>
                    <th className="py-4 px-6 font-semibold">Word Type</th>
                    <th className="py-4 px-6 font-semibold">Part</th>
                    <th className="py-4 px-6 font-semibold">Meaning (TH)</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252c44]/50">
                  {filteredList.map((word) => (
                    <tr
                      key={word.id}
                      className="hover:bg-[#1e2235]/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-[#e8d5a3]">
                        {word.word}
                        {word.dual_type && (
                          <span
                            className="ml-2 inline-flex items-center justify-center bg-[#a78bfa]/20 text-[#a78bfa] text-[0.65rem] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
                            title={`Dual Type: ${word.dual_type}`}
                          >
                            DUAL
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-[#4f8ef7]/10 text-[#4f8ef7] border border-[#4f8ef7]/20 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                          {word.word_type || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#c8d0e8] text-xs px-2 py-1 bg-[#1e2235] border border-[#2e3450] rounded-md whitespace-nowrap">
                          {word.part_scope === "part5"
                            ? "Part 5"
                            : word.part_scope === "reading"
                              ? "Reading"
                              : "All"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#b0bcd8]">
                        {word.meaning_th}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleClickEditWord(word)}
                            className="bg-[#1e2235] text-[#f7c94f] border border-[#f7c94f]/30 hover:bg-[#f7c94f]/10 p-2 py-1.5 rounded-lg text-sm transition-colors font-semibold shadow-sm"
                          >
                            <i className="fas fa-pen text-xs mr-1"></i> Edit
                          </button>
                          <button className="bg-[#1e2235] text-[#f76f4f] border border-[#f76f4f]/30 hover:bg-[#f76f4f]/10 p-2 py-1.5 rounded-lg text-sm transition-colors font-semibold shadow-sm">
                            <i className="fas fa-trash text-xs mr-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredList.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-[#7a84a8]"
                      >
                        ไม่พบคำศัพท์ที่ตรงตามเงื่อนไข ลองปรับตัวกรองดูนะ...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
