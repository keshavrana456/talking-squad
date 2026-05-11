import { useState } from "react";
import { X } from "lucide-react";

interface WalletModalProps {
  onClose: () => void;
  onConnect: (wallet: string, address: string) => void;
  connectedWallet: string | null;
  connectedAddress: string | null;
}

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    color: "#F6851B",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "https://phantom.app/img/phantom-logo.svg",
    color: "#AB9FF2",
    fallbackIcon: "👻",
  },
  {
    id: "haha",
    name: "Haha Wallet",
    icon: "https://haha.me/logo.png",
    color: "#FFD700",
    fallbackIcon: "😄",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
    color: "#000000",
    fallbackIcon: "⭕",
  },
];

export default function WalletModal({ onClose, onConnect, connectedWallet, connectedAddress }: WalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  async function handleConnect(wallet: (typeof WALLETS)[0]) {
    setConnecting(wallet.id);
    await new Promise(r => setTimeout(r, 900));

    let address = "";
    if (wallet.id === "metamask" && typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        address = accounts[0] || "";
      } catch {
        address = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      }
    } else if (wallet.id === "phantom" && (window as any).solana) {
      try {
        const resp = await (window as any).solana.connect();
        address = resp.publicKey.toString();
      } catch {
        address = Array.from({ length: 44 }, () => "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789"[Math.floor(Math.random() * 58)]).join("");
      }
    } else {
      address = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    setConnecting(null);
    onConnect(wallet.id, address);
  }

  function shortAddr(addr: string) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 100%)", border: "1px solid rgba(255,105,180,0.3)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-white text-xl font-bold mb-2 text-center">Connect Wallet</h2>
        {connectedWallet && connectedAddress && (
          <div className="mb-4 rounded-xl p-3 text-center text-sm" style={{ background: "rgba(255,105,180,0.15)" }}>
            <span className="text-green-400 font-semibold">Connected: </span>
            <span className="text-white">{WALLETS.find(w => w.id === connectedWallet)?.name}</span>
            <div className="text-white/60 text-xs mt-1 font-mono">{shortAddr(connectedAddress)}</div>
          </div>
        )}
        <p className="text-white/60 text-sm text-center mb-5">Choose your wallet to connect</p>

        <div className="flex flex-col gap-3">
          {WALLETS.map(wallet => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={connecting !== null}
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{
                background: connectedWallet === wallet.id ? "rgba(255,105,180,0.25)" : "rgba(255,255,255,0.07)",
                border: connectedWallet === wallet.id ? "1px solid rgba(255,105,180,0.6)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: wallet.color + "20" }}>
                {imgErrors[wallet.id] ? (
                  <span className="text-lg">{wallet.fallbackIcon || "💳"}</span>
                ) : (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-6 h-6 object-contain"
                    onError={() => setImgErrors(prev => ({ ...prev, [wallet.id]: true }))}
                  />
                )}
              </div>
              <span className="text-white font-semibold flex-1 text-left">{wallet.name}</span>
              {connecting === wallet.id && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {connectedWallet === wallet.id && (
                <div className="w-2 h-2 rounded-full bg-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
