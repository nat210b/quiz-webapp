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

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      const payload = {
        word: formData.word?.trim() ?? "",
        word_type: formData.word_type ?? "",
        dual_type: normalizeOptionalText(formData.dual_type),
        meaning_th: formData.meaning_th?.trim() ?? "",
        meaning_en: normalizeOptionalText(formData.meaning_en),
        example_1: normalizeOptionalText(formData.example_1),
        example_2: normalizeOptionalText(formData.example_2),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={() => onClose?.()}
      />
      <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-4 shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <h2 className="text-lg font-semibold" style={{ color: "#333" }}>
            {!isNew && itemDetail?.word ? "Edit Word" : "Add Word"}
          </h2>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => onClose?.()}
          >
            Close
          </button>
        </div>
        <form className="pt-3 text-gray-900" onSubmit={handleSubmit}>
          {saveError && (
            <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 overflow-auto max-h-[50vh] p-3">
            <label className="grid gap-1" htmlFor="word">
              <span className="text-sm text-gray-700">Word</span>
              <input
                type="text"
                id="word"
                name="word"
                value={formData.word ?? ""}
                onChange={(e) => setField("word", e.target.value)}
                className="rounded border px-3 py-2"
                required
              />
            </label>

            <label className="grid gap-1" htmlFor="word_type">
              <span className="text-sm text-gray-700">Word Type</span>
              <select
                name="word_type"
                id="word_type"
                value={formData.word_type ?? ""}
                onChange={(e) => setField("word_type", e.target.value)}
                className="rounded border px-3 py-2"
                required
              >
                <option value="">Select Word Type</option>
                <option value="conj">Conjunction</option>
                <option value="prep">Preposition</option>
                <option value="adverb">Adverb</option>
              </select>
            </label>

            <label className="grid gap-1" htmlFor="dual_type">
              <span className="text-sm text-gray-700">Dual Type</span>
              <input
                type="checkbox"
                name="dual_type"
                id="dual_type"
                checked={formData.dual_type}
                onChange={(e) => setField("dual_type", e.target.checked)}
                className="rounded border px-3 py-2"
              />
            </label>

            <label className="grid gap-1" htmlFor="meaning_th">
              <span className="text-sm text-gray-700">Meaning (TH)</span>
              <input
                type="text"
                id="meaning_th"
                name="meaning_th"
                value={formData.meaning_th ?? ""}
                onChange={(e) => setField("meaning_th", e.target.value)}
                className="rounded border px-3 py-2"
                required
              />
            </label>

            <label className="grid gap-1" htmlFor="meaning_en">
              <span className="text-sm text-gray-700">Meaning (EN)</span>
              <input
                type="text"
                id="meaning_en"
                name="meaning_en"
                value={formData.meaning_en ?? ""}
                onChange={(e) => setField("meaning_en", e.target.value)}
                className="rounded border px-3 py-2"
              />
            </label>

            <label className="grid gap-1" htmlFor="example_1">
              <span className="text-sm text-gray-700">Example 1</span>
              <input
                type="text"
                id="example_1"
                name="example_1"
                value={formData.example_1 ?? ""}
                onChange={(e) => setField("example_1", e.target.value)}
                className="rounded border px-3 py-2"
              />
            </label>

            <label className="grid gap-1" htmlFor="example_2">
              <span className="text-sm text-gray-700">Example 2</span>
              <input
                type="text"
                id="example_2"
                name="example_2"
                value={formData.example_2 ?? ""}
                onChange={(e) => setField("example_2", e.target.value)}
                className="rounded border px-3 py-2"
              />
            </label>

            <label className="grid gap-1" htmlFor="part_scope">
              <span className="text-sm text-gray-700">Part Scope</span>
              <select
                name="part_scope"
                id="part_scope"
                value={formData.part_scope ?? ""}
                onChange={(e) => setField("part_scope", e.target.value)}
                className="rounded border px-3 py-2"
              >
                <option value="">Select Part Scope</option>
                <option value="part5">Part 5</option>
                <option value="reading">Reading</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => onClose?.()}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditWord;
