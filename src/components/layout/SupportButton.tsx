import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SupportButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/support")}
      aria-label="Contact Support"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl"
    >
      <MessageCircle size={22} />

      <span className="font-medium">
        Support
      </span>
    </button>
  );
}

export default SupportButton;