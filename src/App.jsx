import React, { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { config } from "./wagmiConfig";
import Header from "./Components/Header";
import Wheel from "./Components/Wheel";
import "./App.css";

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="text-emerald-400 font-semibold mb-6">
        ✅ Bağlı: {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition-all mb-6"
    >
      Cüzdanı Bağla
    </button>
  );
}

export default function App() {
  useEffect(() => {
    // Farcaster Mini App ortamı hazır olduğunda bildir
    sdk.actions.ready();
  }, []);

  return (
    <WagmiProvider config={config}>
      <div className="min-h-screen bg-[#0f172a] text-white">
        <Header />
        <main className="pt-20 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold mb-4">🎰 Spin to Win</h2>
          <p className="text-gray-300 mb-4">
            Cüzdanını bağla ve şansını dene!
          </p>
          <ConnectMenu />
          <Wheel />
        </main>
      </div>
    </WagmiProvider>
  );
}
