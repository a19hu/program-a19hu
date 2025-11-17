"use client";

import { useState } from "react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { SwapInterface } from "@/components/swap-interface";
import { PoolManagement } from "@/components/pool-management";
import { PositionManagement } from "@/components/position-management";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool' | 'position'>('swap');

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Orca AMM</h1>
            <p className="text-gray-600 mt-1">Decentralized Exchange on Solana</p>
          </div>
          <WalletConnectButton />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'swap'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab('pool')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'pool'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pools
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'position'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Positions
          </button>
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {activeTab === 'swap' && <SwapInterface />}
          {activeTab === 'pool' && <PoolManagement />}
          {activeTab === 'position' && <PositionManagement />}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About Orca AMM</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Swap</h4>
              <p>Exchange tokens instantly with minimal slippage. Our AMM uses concentrated liquidity for efficient trading.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pools</h4>
              <p>Create new liquidity pools or add/remove liquidity to existing pools. Earn fees from trades.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Positions</h4>
              <p>Manage your liquidity positions with precision. Open new positions and adjust liquidity as needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}