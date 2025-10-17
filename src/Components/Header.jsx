import React, { useState } from "react";
import { ethers } from "ethers";

export default function Header({setAccount,account}) {
  

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Cüzdan bulunamadı. Lütfen MetaMask yükle!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-3 bg-[#111827] text-white shadow-md z-50">
      <h1 className="text-xl font-bold">🪙 Airdrop Predictor</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Cüzdanı Bağla
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm bg-gray-800 px-3 py-1 rounded-md">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm font-semibold transition"
          >
            Çıkış
          </button>
        </div>
      )}
    </header>
  );
}
