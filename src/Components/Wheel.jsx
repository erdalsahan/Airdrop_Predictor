import React, { useState, useMemo } from "react";
import { ethers } from "ethers";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = "0x8a0f9e67ba8f2076C4DfBd28735a4B4717C2B358";

const ABI = [
  "function mint() external returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function ownerOf(uint256) external view returns (address)",
  "function totalSupply() external view returns (uint256)"
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
  const { address, isConnected } = useAccount();

  // ✅ mint fonksiyonu için wagmi hook
  const { writeContractAsync } = useWriteContract();

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

  const onTransitionEnd = async () => {
    setSpinning(false);
    setResult("🎉 Kazandın!");
  };

  const handleMint = async () => {
  try {
    if (!isConnected) return alert("Cüzdan bağlı değil!");
    await writeContractAsync({
      address: "0x8a0f9e67ba8f2076C4DfBd28735a4B4717C2B358",
      abi: ABI, // yukarıda tanımladığın global ABI
      functionName: "mint",
    });
    alert("Mint başarılı 🎯");
  } catch (err) {
    console.error(err);
    alert("Mint başarısız ❌");
  }
};


  return (
    <div className="flex flex-col items-center gap-6 relative">
      <div
        className="absolute z-50"
        style={{
          top: "-14px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderBottom: "22px solid #facc15",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }}
      />

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
        {segments.map((label, i) => {
          const middle = i * anglePer + anglePer / 2;
          return (
            <div
              key={i}
              className="absolute text-sm font-semibold"
              style={{
                transform: `rotate(${middle}deg) translateY(-125px) rotate(-${middle}deg)`,
                color: "#fff",
              }}
            >
              {label}
            </div>
          );
        })}

        <div className="absolute w-24 h-24 rounded-full bg-[#0f172a] flex items-center justify-center border border-white/30 text-lg font-bold">
          🎰
        </div>
      </div>

      {!result && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`px-6 py-2 rounded-xl font-semibold shadow-lg transition-all 
            ${spinning ? "bg-gray-500 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
        >
          {spinning ? "Dönüyor..." : "Çevir!"}
        </button>
      )}

      {result && (
        <>
          <div className="text-2xl font-bold text-amber-300">{result}</div>
          <button
            onClick={handleMint}
            className="mt-4 px-6 py-2 rounded-xl font-semibold shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            🎁 Mintle
          </button>
        </>
      )}
    </div>
  );
}
