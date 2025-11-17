'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PublicKey } from '@solana/web3.js';
import { useOrcaProgram } from '@/hooks/use-orca-program';
import { useWallet } from '@solana/wallet-adapter-react';

export function PositionManagement() {
  const [activeTab, setActiveTab] = useState<'open' | 'increase' | 'decrease'>('open');
  
  // Open Position states
  const [poolAddressOpen, setPoolAddressOpen] = useState('');
  
  // Increase/Decrease Position states
  const [poolAddress, setPoolAddress] = useState('');
  const [positionAddress, setPositionAddress] = useState('');
  const [tokenMint0, setTokenMint0] = useState('');
  const [tokenMint1, setTokenMint1] = useState('');
  const [tokenVault0, setTokenVault0] = useState('');
  const [tokenVault1, setTokenVault1] = useState('');
  const [amountToken0, setAmountToken0] = useState('');
  const [amountToken1, setAmountToken1] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const { openPosition, increasePositionLiquidity, decreasePositionLiquidity } = useOrcaProgram();
  const { publicKey } = useWallet();

  const handleOpenPosition = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!poolAddressOpen) {
      alert('Please enter pool address');
      return;
    }

    try {
      setLoading(true);
      const result = await openPosition(new PublicKey(poolAddressOpen));
      setTxSignature(result.tx);
      alert(`Position opened! Address: ${result.position.toString()}`);
      
      // Reset form
      setPoolAddressOpen('');
    } catch (error: any) {
      console.error('Open position error:', error);
      alert(`Open position failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIncreasePosition = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!poolAddress || !positionAddress || !tokenVault0 || !tokenVault1 || 
        !tokenMint0 || !tokenMint1 || !amountToken0 || !amountToken1) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const tx = await increasePositionLiquidity(
        new PublicKey(poolAddress),
        new PublicKey(positionAddress),
        new PublicKey(tokenVault0),
        new PublicKey(tokenVault1),
        new PublicKey(tokenMint0),
        new PublicKey(tokenMint1),
        parseFloat(amountToken0) * 1e9,
        parseFloat(amountToken1) * 1e9
      );
      setTxSignature(tx);
      alert('Position liquidity increased successfully!');
      
      // Reset form
      setAmountToken0('');
      setAmountToken1('');
    } catch (error: any) {
      console.error('Increase position error:', error);
      alert(`Increase position failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecreasePosition = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!poolAddress || !positionAddress || !tokenVault0 || !tokenVault1 || 
        !tokenMint0 || !tokenMint1 || !amountToken0 || !amountToken1) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const tx = await decreasePositionLiquidity(
        new PublicKey(poolAddress),
        new PublicKey(positionAddress),
        new PublicKey(tokenVault0),
        new PublicKey(tokenVault1),
        new PublicKey(tokenMint0),
        new PublicKey(tokenMint1),
        parseFloat(amountToken0) * 1e9,
        parseFloat(amountToken1) * 1e9
      );
      setTxSignature(tx);
      alert('Position liquidity decreased successfully!');
      
      // Reset form
      setAmountToken0('');
      setAmountToken1('');
    } catch (error: any) {
      console.error('Decrease position error:', error);
      alert(`Decrease position failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Position Management</h2>
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'open'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Open Position
        </button>
        <button
          onClick={() => setActiveTab('increase')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'increase'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Increase Liquidity
        </button>
        <button
          onClick={() => setActiveTab('decrease')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'decrease'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Decrease Liquidity
        </button>
      </div>

      {/* Open Position Form */}
      {activeTab === 'open' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Address
            </label>
            <input
              type="text"
              value={poolAddressOpen}
              onChange={(e) => setPoolAddressOpen(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter pool address"
            />
          </div>

          <Button
            onClick={handleOpenPosition}
            disabled={loading || !publicKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Opening...' : 'Open Position'}
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Opening a position creates a new position account for the specified pool. 
              After opening, you can add liquidity to this position.
            </p>
          </div>
        </div>
      )}

      {/* Increase Position Form */}
      {activeTab === 'increase' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Address
            </label>
            <input
              type="text"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter pool address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Address
            </label>
            <input
              type="text"
              value={positionAddress}
              onChange={(e) => setPositionAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter position address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Mint 0
              </label>
              <input
                type="text"
                value={tokenMint0}
                onChange={(e) => setTokenMint0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mint address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Vault 0
              </label>
              <input
                type="text"
                value={tokenVault0}
                onChange={(e) => setTokenVault0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vault address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Mint 1
              </label>
              <input
                type="text"
                value={tokenMint1}
                onChange={(e) => setTokenMint1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mint address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Vault 1
              </label>
              <input
                type="text"
                value={tokenVault1}
                onChange={(e) => setTokenVault1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vault address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Token 0
              </label>
              <input
                type="number"
                value={amountToken0}
                onChange={(e) => setAmountToken0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                step="0.000000001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Token 1
              </label>
              <input
                type="number"
                value={amountToken1}
                onChange={(e) => setAmountToken1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                step="0.000000001"
              />
            </div>
          </div>

          <Button
            onClick={handleIncreasePosition}
            disabled={loading || !publicKey}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Increasing...' : 'Increase Position Liquidity'}
          </Button>
        </div>
      )}

      {/* Decrease Position Form */}
      {activeTab === 'decrease' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Address
            </label>
            <input
              type="text"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter pool address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Address
            </label>
            <input
              type="text"
              value={positionAddress}
              onChange={(e) => setPositionAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter position address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Mint 0
              </label>
              <input
                type="text"
                value={tokenMint0}
                onChange={(e) => setTokenMint0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mint address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Vault 0
              </label>
              <input
                type="text"
                value={tokenVault0}
                onChange={(e) => setTokenVault0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vault address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Mint 1
              </label>
              <input
                type="text"
                value={tokenMint1}
                onChange={(e) => setTokenMint1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mint address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Vault 1
              </label>
              <input
                type="text"
                value={tokenVault1}
                onChange={(e) => setTokenVault1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vault address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Token 0
              </label>
              <input
                type="number"
                value={amountToken0}
                onChange={(e) => setAmountToken0(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                step="0.000000001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Token 1
              </label>
              <input
                type="number"
                value={amountToken1}
                onChange={(e) => setAmountToken1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                step="0.000000001"
              />
            </div>
          </div>

          <Button
            onClick={handleDecreasePosition}
            disabled={loading || !publicKey}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Decreasing...' : 'Decrease Position Liquidity'}
          </Button>
        </div>
      )}

      {txSignature && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800">Transaction Successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 break-all"
          >
            View on Explorer: {txSignature}
          </a>
        </div>
      )}
    </div>
  );
}
