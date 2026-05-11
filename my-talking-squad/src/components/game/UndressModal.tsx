import { X } from "lucide-react";
import undressImg from "@assets/UNDRESS_1777927371543.jpg";

interface UndressModalProps {
  onClose: () => void;
}

export default function UndressModal({ onClose }: UndressModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl overflow-hidden max-w-sm w-full z-10" style={{ border: "2px solid rgba(255,105,180,0.5)" }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
        >
          <X size={18} />
        </button>
        <img src={undressImg} alt="Undress" className="w-full h-auto object-cover" />
        <div className="bg-black/80 py-3 text-center">
          <p className="text-pink-400 font-bold text-lg">Beach Mode Activated!</p>
          <p className="text-white/60 text-sm mt-1">Looking good, squad!</p>
        </div>
      </div>
    </div>
  );
}
