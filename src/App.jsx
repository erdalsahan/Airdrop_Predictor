import React, { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Header from "./Components/Header";
import Wheel from "./Components/Wheel";
import "./App.css";
export default function App() {
  
  useEffect(() => {
    // Farcaster Mini App ortamı hazır olduğunda bildir
    sdk.actions.ready();
  }, []);

  return (
    
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header />
      <main className="pt-20 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-4">🎰 Spin to Win</h2>
        <p className="text-gray-300 mb-8">Cüzdanını bağla ve şansını dene!</p>
        
        <Wheel />
      </main>
    </div>
  );
}
