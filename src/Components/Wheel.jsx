import React, { useState, useMemo } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5b3968CCf5FA0DF3D8e6f6bD7c85C7a11b677EBb";
const ABI = [
  "function mint(address to) external returns (uint256)",
];

export default function Wheel() {
  const segments = useMemo(
    () => [
      "😢 Kaybettin",
      "↻ Tekrar Dene",
      "🎉 Kazandın",
      "— Boş",
      "😢 Kaybettin",
      "↻ Tekrar Dene",
    ],
    []
  );

  const colors = ["#ef4444", "#22c55e", "#f59e0b", "#a78bfa", "#0ea5e9", "#14b8a6"];
  const anglePer = 360 / segments.length;
  const winIndex = segments.findIndex((s) => s.includes("Kazandın"));

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [minting, setMinting] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const current = ((rotation % 360) + 360) % 360;
    const centerOfWin = winIndex * anglePer + anglePer / 2;
    const neededToTop = 90 - centerOfWin - current;
    const fullTurns = 5;
    const delta = neededToTop + fullTurns * 360;

    setRotation((prev) => prev + delta);
  };

  const onTransitionEnd = () => {
    setSpinning(false);
    setResult("🎉 You Will Get Airdrop !");
  };

  const handleMint = async () => {
    try {
      if (!window.ethereum) {
        alert("Cüzdan bulunamadı!");
        return;
      }
      setMinting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.mint(userAddress);
      await tx.wait();

      alert("✅ Mint başarılı!");
      setMinting(false);
    } catch (err) {
      console.error(err);
      alert("❌ Mint başarısız veya yetkisiz işlem.");
      setMinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Çark */}
      <div
        onTransitionEnd={onTransitionEnd}
        className="relative flex items-center justify-center shadow-2xl"
        style={{
          width: "320px",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          overflow: "hidden",
          background: `conic-gradient(
            ${colors
              .map((c, i) => {
                const start = i * anglePer;
                const end = (i + 1) * anglePer;
                return `${c} ${start}deg ${end}deg`;
              })
              .join(",")}
          )`,
          transform: `rotate(${rotation}deg)`,
          transition: "transform 3.5s cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      >
        {/* Ok */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-50"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderBottom: "22px solid #facc15",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          }}
        />

        {/* Dilimler */}
        {segments.map((label, i) => {
          const middle = i * anglePer + anglePer / 2;
          return (
            <div
              key={i}
              className="absolute text-sm font-semibold"
              style={{
                transform: `rotate(${middle}deg) translateY(-125px) rotate(-${middle}deg)`,
                transformOrigin: "center center",
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {label}
            </div>
          );
        })}

        {/* Göbek */}
        <div className="absolute w-24 h-24 rounded-full bg-[#0f172a] flex items-center justify-center border border-white/30 text-lg font-bold">
          🎰
        </div>
      </div>

      {/* Buton */}
      <button
        onClick={result ? handleMint : handleSpin}
        disabled={spinning || minting}
        className={`px-6 py-2 rounded-xl font-semibold shadow-lg transition-all 
          ${
            spinning || minting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600"
          }
        `}
      >
        {spinning
          ? "Dönüyor..."
          : minting
          ? "Mintleniyor..."
          : result
          ? "Mintle"
          : "Çevir!"}
      </button>

      {result && (
        <div className="text-2xl font-bold text-amber-300 mt-2 animate-pulse">
          {result}
        </div>
      )}
    </div>
  );
}
