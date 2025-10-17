import React, {useState} from "react";
import Header from "./Components/Header";
import Wheel from "./Components/Wheel";
import "./App.css";


function App() {
   const [account, setAccount] = useState(null);
  return (
    
      <div className="min-h-screen bg-[#0f172a] text-white">
        
        <Header  account={account} setAccount={setAccount}/>
        
        <main className="pt-20 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold mb-4">🎰 Spin to Win</h2>
         {!account && <p className="text-gray-300">Cüzdanını bağla ve şansını dene!</p>}
        </main>
        {account && <Wheel/>}
      </div>
   
  );
}

export default App;
