'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PublicKey } from '@solana/web3.js';
import { useOrcaProgram } from '@/hooks/use-orca-program';
import { useWallet } from '@solana/wallet-adapter-react';

export function PoolManagement() {
  const [activeTab, setActiveTab] = useState<'create' | 'add' | 'remove'>('create');
  
  // Create Pool states
  const [tokenMint0, setTokenMint0] = useState('');
  const [tokenMint1, setTokenMint1] = useState('');
  const [sqrtPriceX64, setSqrtPriceX64] = useState('');
  const [tickSpacing, setTickSpacing] = useState('');
  
  // Add/Remove Liquidity states
  const [poolAddress, setPoolAddress] = useState('');
  const [tokenVault0, setTokenVault0] = useState('');
  const [tokenVault1, setTokenVault1] = useState('');
  const [amountToken0, setAmountToken0] = useState('');
  const [amountToken1, setAmountToken1] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const { createPool, addLiquidity, removeLiquidity } = useOrcaProgram();
  const { publicKey } = useWallet();

  const handleCreatePool = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!tokenMint0 || !tokenMint1 || !sqrtPriceX64 || !tickSpacing) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await createPool(
        new PublicKey(tokenMint0),
        new PublicKey(tokenMint1),
        sqrtPriceX64,
        parseInt(tickSpacing)
      );
      setTxSignature(result.tx);
      alert(`Pool created! Address: ${result.pool.toString()}`);
      
      // Reset form
      setTokenMint0('');
      setTokenMint1('');
      setSqrtPriceX64('');
      setTickSpacing('');
    } catch (error: any) {
      console.error('Create pool error:', error);
      alert(`Create pool failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!poolAddress || !tokenVault0 || !tokenVault1 || !amountToken0 || !amountToken1 || !tokenMint0 || !tokenMint1) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const tx = await addLiquidity(
        new PublicKey(poolAddress),
        new PublicKey(tokenVault0),
        new PublicKey(tokenVault1),
        parseFloat(amountToken0) * 1e9,
        parseFloat(amountToken1) * 1e9,
        new PublicKey(tokenMint0),
        new PublicKey(tokenMint1)
      );
      setTxSignature(tx);
      alert('Liquidity added successfully!');
      
      // Reset form
      setAmountToken0('');
      setAmountToken1('');
    } catch (error: any) {
      console.error('Add liquidity error:', error);
      alert(`Add liquidity failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!poolAddress || !tokenVault0 || !tokenVault1 || !amountToken0 || !amountToken1 || !tokenMint0 || !tokenMint1) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const tx = await removeLiquidity(
        new PublicKey(poolAddress),
        new PublicKey(tokenVault0),
        new PublicKey(tokenVault1),
        parseFloat(amountToken0) * 1e9,
        parseFloat(amountToken1) * 1e9,
        new PublicKey(tokenMint0),
        new PublicKey(tokenMint1)
      );
      setTxSignature(tx);
      alert('Liquidity removed successfully!');
      
      // Reset form
      setAmountToken0('');
      setAmountToken1('');
    } catch (error: any) {
      console.error('Remove liquidity error:', error);
      alert(`Remove liquidity failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Pool Management</h2>
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Create Pool
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'add'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'remove'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {/* Create Pool Form */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Mint 0
            </label>
            <input
              type="text"
              value={tokenMint0}
              onChange={(e) => setTokenMint0(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter token mint address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Mint 1
            </label>
            <input
              type="text"
              value={tokenMint1}
              onChange={(e) => setTokenMint1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter token mint address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sqrt Price X64
            </label>
            <input
              type="text"
              value={sqrtPriceX64}
              onChange={(e) => setSqrtPriceX64(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 79228162514264337593543950336"
            />
            <p className="text-xs text-gray-500 mt-1">Initial price encoded as sqrt(price) * 2^64</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tick Spacing
            </label>
            <input
              type="number"
              value={tickSpacing}
              onChange={(e) => setTickSpacing(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10"
            />
            <p className="text-xs text-gray-500 mt-1">Common values: 1, 10, 60, 200</p>
          </div>

          <Button
            onClick={handleCreatePool}
            disabled={loading || !publicKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Creating...' : 'Create Pool'}
          </Button>
        </div>
      )}

      {/* Add Liquidity Form */}
      {activeTab === 'add' && (
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
            onClick={handleAddLiquidity}
            disabled={loading || !publicKey}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Adding...' : 'Add Liquidity'}
          </Button>
        </div>
      )}

      {/* Remove Liquidity Form */}
      {activeTab === 'remove' && (
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
            onClick={handleRemoveLiquidity}
            disabled={loading || !publicKey}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition-colors"
          >
            {loading ? 'Removing...' : 'Remove Liquidity'}
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
