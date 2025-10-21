import React, { useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";

const CONTRACT_ADDRESS = "0x303D8e109143D6e44E5e1DFb0c2A03756C0B998d";
const ABI = [
  "function mint(string memory _uri) payable",
  "function mintPrice() view returns (uint256)"
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

  useEffect(() => {
    sdk.actions.ready();
  }, []);

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
    setResult("🎉 Kazandın!");
  };

const handleMint = async () => {
  try {
    console.log("🟣 Mint işlemi başlatılıyor...");

    let provider;

    // 1️⃣ Önce Farcaster provider'ı al
    const fcProvider = await sdk.wallet.getEthereumProvider();

    if (fcProvider) {
      console.log("💜 Farcaster Wallet aktif");
      provider = new ethers.BrowserProvider(fcProvider);
    } else if (window.ethereum?.isMetaMask) {
      console.log("🦊 MetaMask seçili");
      provider = new ethers.BrowserProvider(window.ethereum);
    } else if (window.ethereum?.providers) {
      // Çoklu provider varsa fallback
      const selected = window.ethereum.providers.find(
        (p) => p.isFarcaster || p.isMetaMask
      );
      provider = new ethers.BrowserProvider(selected);
    } else {
      await sdk.actions.openDialog({
        title: "Cüzdan Bulunamadı ❌",
        description: "Lütfen Farcaster veya MetaMask ile bağlanın.",
      });
      return;
    }

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    console.log("🔗 Aktif Chain ID:", network.chainId.toString());

    // 2️⃣ Ağ kontrolü
    if (network.chainId !== 8453n) {
      await sdk.actions.openDialog({
        title: "Yanlış Ağ ⚠️",
        description: "Lütfen Base Mainnet ağına geçin (chainId 8453).",
      });
      return;
    }

    // 3️⃣ Kontrat
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // 4️⃣ mintPrice()
    let mintPrice;
    try {
      mintPrice = await contract.mintPrice();
      console.log("💰 Mint fiyatı:", mintPrice.toString());
    } catch {
      console.warn("mintPrice okunamadı, sabit 0.00005 ETH kullanılacak");
      mintPrice = ethers.parseEther("0.00005");
    }

    // 5️⃣ IPFS URI
    const tokenURI = "https://gateway.pinata.cloud/ipfs/YOUR_METADATA.json";

    // 6️⃣ Mint işlemi
    const tx = await contract.mint(tokenURI, {
      value: mintPrice,
      gasLimit: 500000n,
    });

    console.log("⏳ Mint gönderildi:", tx.hash);

    await sdk.actions.openDialog({
      title: "Mint İşlemi Başladı ⏳",
      description: "İşlem blockchain üzerinde onay bekliyor...",
    });

    await tx.wait();

    await sdk.actions.openDialog({
      title: "🎉 Başarılı",
      description: "NFT başarıyla mintlendi ✅",
    });
  } catch (error) {
    console.error("🔥 Mint hatası:", error);
    await sdk.actions.openDialog({
      title: "Mint Hatası ❌",
      description:
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Bilinmeyen hata oluştu",
    });
  }
};



  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Üstteki ok işareti */}
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

      {/* Çark */}
      <div
        onTransitionEnd={onTransitionEnd}
        className="relative flex items-center justify-center shadow-2xl"
        style={{
          width: "320px",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          overflow: "hidden",
          background: `conic-gradient(${colors
            .map((c, i) => `${c} ${i * anglePer}deg ${(i + 1) * anglePer}deg`)
            .join(",")})`,
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
