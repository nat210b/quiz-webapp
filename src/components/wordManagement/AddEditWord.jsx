import { useEffect, useState } from "react";
import { addVocabWord, updateVocabWord } from "../../services/vocabService";

function AddEditWord({ item, onClose, isNew, onSaved }) {
  const [itemDetail, setItemDetail] = useState(item);
  const [newWord, setNewWord] = useState({
    word: "",
    word_type: "",
    dual_type: "",
    meaning_th: "",
    meaning_en: "",
    example_1: "",
    example_2: "",
    part_scope: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setItemDetail(item);
  }, [item]);

  useEffect(() => {
    if (!isNew) return;
    setNewWord({
      word: "",
      word_type: "",
      dual_type: "",
      meaning_th: "",
      meaning_en: "",
      example_1: "",
      example_2: "",
      part_scope: "",
    });
  }, [isNew]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!isNew && !itemDetail) return null;
  const formData = isNew ? newWord : itemDetail;

  function setField(field, value) {
    if (isNew) {
      setNewWord((prev) => ({ ...prev, [field]: value }));
      return;
    }
    setItemDetail((prev) => ({ ...prev, [field]: value }));
  }

  function normalizeOptionalText(value) {
    const trimmed = value?.trim?.();
    return trimmed ? trimmed : null;
  }

  function autoHighlight(text, word) {
    if (!text || !word) return text;
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedWord = escapeRegExp(word.trim());
    if (!escapedWord) return text;

    // Remove old tags if they specifically wrap the word (to avoid <strong><strong>word</strong></strong>)
    const cleanupRegex = new RegExp(`<strong>\\s*(${escapedWord})\\s*<\\/strong>`, 'gi');
    let cleanText = text.replace(cleanupRegex, '$1');

    // Add strong tags back avoiding partial matches by using word boundaries
    const wrapRegex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
    return cleanText.replace(wrapRegex, '<strong>$1</strong>');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      const vocabWord = formData.word?.trim() ?? "";
      
      const ex1 = autoHighlight(normalizeOptionalText(formData.example_1), vocabWord);
      const ex2 = autoHighlight(normalizeOptionalText(formData.example_2), vocabWord);

      const payload = {
        word: vocabWord,
        word_type: formData.word_type ?? "",
        dual_type: normalizeOptionalText(formData.dual_type),
        meaning_th: formData.meaning_th?.trim() ?? "",
        meaning_en: normalizeOptionalText(formData.meaning_en),
        example_1: ex1,
        example_2: ex2,
        part_scope: normalizeOptionalText(formData.part_scope),
      };

      if (isNew) {
        await addVocabWord(payload);
      } else {
        await updateVocabWord(itemDetail.id, payload);
      }

      await onSaved?.();
      onClose?.();
    } catch (error) {
      setSaveError(error?.message ?? "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass = "appearance-none w-full px-4 py-3 text-sm rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] placeholder-[#7a84a8]/50 focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-colors shadow-inner";
  const labelClass = "text-xs font-bold text-[#7a84a8] uppercase tracking-wider pl-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['DM_Sans',sans-serif]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#060813]/80 backdrop-blur-sm transition-opacity"
        onClick={() => onClose?.()}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-[24px] bg-[#161b2e] border border-[#252c44] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#252c44] bg-[#131729]">
          <div>
            <h2 className="text-xl font-bold text-[#e8d5a3] tracking-wide">
              {!isNew && itemDetail?.word ? "Edit Vocabulary" : "Add New Word"}
            </h2>
            <p className="text-xs text-[#7a84a8] mt-1">{!isNew ? "แก้ไขข้อมูลคำศัพท์" : "เพิ่มคำศัพท์ใหม่ลงในระบบ"}</p>
          </div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1e2235] text-[#7a84a8] hover:bg-[#252a40] hover:text-[#c8d0e8] transition-colors border border-[#2e3450]"
            onClick={() => onClose?.()}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Form Body */}
        <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit}>
          
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            {saveError && (
              <div className="mb-6 rounded-xl border border-[#f76f4f]/30 bg-[#2a0f0f] px-4 py-3 text-sm font-medium text-[#f76f4f] flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-lg"></i>
                {saveError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <label className="grid gap-2 md:col-span-2" htmlFor="word">
                <span className={labelClass}>Word <span className="text-[#f76f4f]">*</span></span>
                <input
                  type="text"
                  id="word"
                  name="word"
                  placeholder="e.g. Determine"
                  value={formData.word ?? ""}
                  onChange={(e) => setField("word", e.target.value)}
                  className={`${inputClass} text-lg font-semibold text-[#e8d5a3]`}
                  required
                />
              </label>

              <label className="grid gap-2" htmlFor="word_type">
                <span className={labelClass}>Word Type <span className="text-[#f76f4f]">*</span></span>
                <div className="relative">
                  <select
                    name="word_type"
                    id="word_type"
                    value={formData.word_type ?? ""}
                    onChange={(e) => setField("word_type", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                    required
                  >
                    <option value="">Select Word Type</option>
                    <option value="conj">Conjunction (conj)</option>
                    <option value="prep">Preposition (prep)</option>
                    <option value="adv">Adverb (adv)</option>
                    <option value="noun">Noun (noun)</option>
                    <option value="verb">Verb (verb)</option>
                    <option value="adj">Adjective (adj)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7a84a8]">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </label>

              <label className="grid gap-2" htmlFor="dual_type">
                 <span className={labelClass}>Dual Type (Optional)</span>
                <input
                  type="text"
                  id="dual_type"
                  name="dual_type"
                  placeholder="e.g. prep"
                  value={formData.dual_type ?? ""}
                  onChange={(e) => setField("dual_type", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2 md:col-span-2" htmlFor="meaning_th">
                <span className={labelClass}>Meaning (TH) <span className="text-[#f76f4f]">*</span></span>
                <input
                  type="text"
                  id="meaning_th"
                  name="meaning_th"
                  placeholder="ความหมายภาษาไทย"
                  value={formData.meaning_th ?? ""}
                  onChange={(e) => setField("meaning_th", e.target.value)}
                  className={inputClass}
                  required
                />
              </label>

              <label className="grid gap-2 md:col-span-2" htmlFor="meaning_en">
                <span className={labelClass}>Meaning (EN)</span>
                 <input
                  type="text"
                  id="meaning_en"
                  name="meaning_en"
                  placeholder="English definition (optional)"
                  value={formData.meaning_en ?? ""}
                  onChange={(e) => setField("meaning_en", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2 md:col-span-2" htmlFor="example_1">
                <span className={labelClass}>Example 1</span>
                <textarea
                  id="example_1"
                  name="example_1"
                  rows="2"
                  placeholder="e.g. It is hard to determine what is the right thing to do."
                  value={formData.example_1 ?? ""}
                  onChange={(e) => setField("example_1", e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </label>

              <label className="grid gap-2 md:col-span-2" htmlFor="example_2">
                <span className={labelClass}>Example 2</span>
                <textarea
                  id="example_2"
                  name="example_2"
                  rows="2"
                  placeholder="Additional example (optional)"
                  value={formData.example_2 ?? ""}
                  onChange={(e) => setField("example_2", e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </label>

              <label className="grid gap-2 md:col-span-2" htmlFor="part_scope">
                <span className={labelClass}>Part Scope</span>
                <div className="relative">
                  <select
                    name="part_scope"
                    id="part_scope"
                    value={formData.part_scope ?? ""}
                    onChange={(e) => setField("part_scope", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Any / All Parts</option>
                    <option value="part5">Part 5 (Incomplete Sentences)</option>
                    <option value="reading">Part 6/7 (Reading)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7a84a8]">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end items-center px-8 py-5 border-t border-[#252c44] bg-[#131729]">
            <button
              type="button"
              className="py-2.5 px-6 rounded-xl border border-[#2e3450] bg-[#1e2235] text-sm font-semibold text-[#7a84a8] hover:text-[#c8d0e8] hover:bg-[#252a40] focus:outline-none transition-all duration-200"
              onClick={() => onClose?.()}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-8 rounded-xl border border-transparent shadow-[0_0_15px_rgba(79,142,247,0.3)] text-sm font-bold text-white bg-gradient-to-r from-[#4f8ef7] to-[#3b7adb] hover:shadow-[0_0_20px_rgba(79,142,247,0.5)] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i> Save Word
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditWord;
