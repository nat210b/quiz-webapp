import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitFeedback } from "../../services/feedbackService";

export default function FeedbackForm() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [feedbackType, setFeedbackType] = useState("ปัญหา");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    let error = null;
    try {
      await submitFeedback({ topic, feedbackType, details });
    } catch (err) {
      error = err;
    }

    setIsSubmitting(false);

    if (error) {
      setMessage({
        type: "error",
        text: "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
      console.error(error);
    } else {
      setMessage({
        type: "success",
        text: "ขอบคุณสำหรับข้อเสนอแนะ/แจ้งปัญหา!",
      });
      setTopic("");
      setDetails("");
      setFeedbackType("ปัญหา");
    }
  };

  return (
    <div className="min-h-screen flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0d1021] via-[#131729] to-[#1a1f35] font-['DM_Sans',sans-serif] text-[#c8d0e8]">
      <div className="max-w-md w-full space-y-8 p-10 rounded-[24px] shadow-2xl border border-[#252c44] bg-[#161b2e] h-fit relative overflow-hidden">
        {/* Subtle glowing orb in background */}
        <div className="absolute top-0 right-0 -m-20 w-40 h-40 bg-[#4f8ef7] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-20 w-40 h-40 bg-[#a78bfa] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <span className="text-4xl">💭</span>
          </div>
          <h2 className="text-center text-2xl font-bold text-[#e8d5a3] tracking-wide">
            แจ้งปัญหา & ข้อเสนอแนะ
          </h2>
          <p className="mt-2 text-center text-sm text-[#7a84a8]">
            ขอขอบคุณที่ร่วมเป็นส่วนหนึ่งในการพัฒนาแพลตฟอร์ม
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium relative z-10 transition-all ${
              message.type === "success"
                ? "bg-[#0f2a1e] text-[#4fcf8a] border border-[#4fcf8a]/30"
                : "bg-[#2a0f0f] text-[#f76f4f] border border-[#f76f4f]/30"
            }`}
          >
            <span className="flex items-center gap-2">
              <i
                className={`fas ${
                  message.type === "success"
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
                }`}
              ></i>
              {message.text}
            </span>
          </div>
        )}

        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
          {/* Feedback Type */}
          <div>
            <label
              htmlFor="feedbackType"
              className="block text-xs font-bold text-[#7a84a8] uppercase tracking-wider mb-2"
            >
              ประเภท
            </label>
            <div className="relative">
              <select
                id="feedbackType"
                name="feedbackType"
                required
                className="appearance-none block w-full pl-4 pr-10 py-3.5 text-sm rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-colors"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <option value="ปัญหา">🐞 พบปัญหา (Bug/Issue)</option>
                <option value="ข้อเสนอแนะ">💡 ข้อเสนอแนะ (Suggestion)</option>
                <option value="อื่นๆ">💬 อื่นๆ (Others)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7a84a8]">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label
              htmlFor="topic"
              className="block text-xs font-bold text-[#7a84a8] uppercase tracking-wider mb-2"
            >
              หัวข้อ
            </label>
            <input
              id="topic"
              name="topic"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3.5 text-sm rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] placeholder-[#7a84a8]/50 focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-colors shadow-inner"
              placeholder="ระบุหัวข้อสั้นๆ..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Details */}
          <div>
            <label
              htmlFor="details"
              className="block text-xs font-bold text-[#7a84a8] uppercase tracking-wider mb-2"
            >
              รายละเอียด
            </label>
            <textarea
              id="details"
              name="details"
              rows={5}
              required
              className="appearance-none block w-full px-4 py-3.5 text-sm rounded-xl border border-[#2e3450] bg-[#1e2235] text-[#c8d0e8] placeholder-[#7a84a8]/50 focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-colors resize-none shadow-inner"
              placeholder="อธิบายรายละเอียดที่คุณต้องการแจ้งให้เราทราบ..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-1/3 flex justify-center items-center py-3.5 px-4 rounded-xl border border-[#2e3450] bg-[#1e2235] text-sm font-semibold text-[#7a84a8] hover:text-[#c8d0e8] hover:bg-[#252a40] focus:outline-none transition-all duration-200"
            >
              กลับ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl border border-transparent shadow-[0_0_15px_rgba(79,142,247,0.3)] text-sm font-bold text-white bg-gradient-to-r from-[#4f8ef7] to-[#3b7adb] hover:shadow-[0_0_20px_rgba(79,142,247,0.5)] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังส่ง...
                </div>
              ) : (
                <>
                  ส่งข้อมูล <i className="fas fa-paper-plane ml-1"></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
