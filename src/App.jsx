import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Header from "./Components/Header";
import Wheel from "./Components/Wheel";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../wagmiConfig";
export default function App() {
  const [account,setAccount] = useState(null);
  const queryClient = new QueryClient();
  useEffect(() => {
    // Farcaster Mini App ortamı hazır olduğunda bildir
    sdk.actions.ready();
  }, []);
  
  return (
     <QueryClientProvider client={queryClient}>
<WagmiProvider config={config}>

   <div className="min-h-screen bg-[#0f172a] text-white">
      <Header account={account} setAccount={setAccount}/>
      <main className="pt-20 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-4">🎰 Spin to Win</h2>
        {!account&&<p className="text-gray-300 mb-8">Cüzdanını bağla ve şansını dene!</p>}
        
        <Wheel />
      </main>
    </div>
     </WagmiProvider>

     </QueryClientProvider>
     
    
  );
}
