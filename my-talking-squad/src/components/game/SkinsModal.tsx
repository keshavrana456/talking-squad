import { useState } from "react";
import { X, ShoppingBag } from "lucide-react";

interface Skin {
  id: string;
  name: string;
  priceMon: number;
  priceEggs: number;
  owned: boolean;
  applied: boolean;
}

interface SkinsModalProps {
  onClose: () => void;
  eggs: number;
  connectedWallet: string | null;
  onWalletClick: () => void;
}

const INITIAL_SKINS: Skin[] = [
  { id: "s1", name: "Galaxy Feathers", priceMon: 100, priceEggs: 500, owned: false, applied: false },
  { id: "s2", name: "Golden Crown", priceMon: 100, priceEggs: 500, owned: false, applied: false },
  { id: "s3", name: "Neon Punk", priceMon: 100, priceEggs: 500, owned: false, applied: false },
  { id: "s4", name: "Pirate Squad", priceMon: 100, priceEggs: 500, owned: false, applied: false },
];

export default function SkinsModal({ onClose, eggs, connectedWallet, onWalletClick }: SkinsModalProps) {
  const [skins, setSkins] = useState<Skin[]>(INITIAL_SKINS);
  const [showApply, setShowApply] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  function buyWithEggs(skin: Skin) {
    if (eggs < skin.priceEggs) {
      setMsg("Not enough eggs!");
      return;
    }
    setSkins(prev => prev.map(s => s.id === skin.id ? { ...s, owned: true } : s));
    setShowApply(skin.id);
    setMsg("");
  }

  function buyWithMon(skin: Skin) {
    if (!connectedWallet) {
      setMsg("Connect a wallet first!");
      return;
    }
    setSkins(prev => prev.map(s => s.id === skin.id ? { ...s, owned: true } : s));
    setShowApply(skin.id);
    setMsg("");
  }

  function applySkin(skinId: string) {
    setSkins(prev => prev.map(s => ({ ...s, applied: s.id === skinId })));
    setShowApply(null);
    setMsg("Skin applied!");
    setTimeout(() => setMsg(""), 2000);
  }

  const skinColors = ["#7B2FBE", "#FFB800", "#00D4FF", "#FF6B6B"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 z-10 max-h-[90vh] overflow-y-auto"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 100%)", border: "1px solid rgba(255,105,180,0.3)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag size={20} className="text-pink-400" />
          <h2 className="text-white text-xl font-bold">Skins</h2>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-white/60 text-sm">Your eggs: <span className="text-yellow-400 font-bold">{eggs}</span></p>
          {!connectedWallet && (
            <button
              onClick={() => { onClose(); onWalletClick(); }}
              className="text-xs text-pink-400 underline"
            >
              Connect wallet for MON
            </button>
          )}
        </div>

        {msg && (
          <div className="mb-3 rounded-lg p-2 text-center text-sm font-semibold"
            style={{ background: msg.includes("applied") || msg.includes("owned") ? "rgba(0,255,100,0.15)" : "rgba(255,50,50,0.15)", color: msg.includes("!") && !msg.includes("applied") ? "#ff6b6b" : "#6bff9e" }}>
            {msg}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {skins.map((skin, i) => (
            <div
              key={skin.id}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.06)", border: skin.applied ? "1px solid #ff69b4" : "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: skinColors[i] + "30" }}
                >
                  🪄
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold">{skin.name}</div>
                  <div className="text-xs text-white/50">{skin.applied ? "✅ Applied" : skin.owned ? "Owned" : "Not owned"}</div>
                </div>
              </div>

              {!skin.owned ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => buyWithEggs(skin)}
                    disabled={eggs < skin.priceEggs}
                    className="flex-1 rounded-lg py-2 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}
                  >
                    🥚 {skin.priceEggs}
                  </button>
                  <button
                    onClick={() => buyWithMon(skin)}
                    className="flex-1 rounded-lg py-2 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #7B2FBE, #a855f7)" }}
                  >
                    💎 {skin.priceMon} MON
                  </button>
                </div>
              ) : !skin.applied ? (
                <button
                  onClick={() => applySkin(skin.id)}
                  className="w-full rounded-lg py-2 text-sm font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #ff69b4, #ff1493)" }}
                >
                  Apply
                </button>
              ) : (
                <div className="text-center text-green-400 text-sm font-bold">Currently Applied</div>
              )}
            </div>
          ))}
        </div>

        {showApply && (
          <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative rounded-2xl p-6 text-center max-w-xs w-full"
              style={{ background: "linear-gradient(135deg, #1a0533, #2d0a5e)", border: "1px solid rgba(255,105,180,0.5)" }}>
              <p className="text-white text-lg font-bold mb-1">Skin Purchased!</p>
              <p className="text-white/70 text-sm mb-4">Would you like to apply it now?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowApply(null)} className="flex-1 py-2 rounded-xl text-white/60 border border-white/20">Later</button>
                <button onClick={() => applySkin(showApply)} className="flex-1 py-2 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #ff69b4, #ff1493)" }}>Apply Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
