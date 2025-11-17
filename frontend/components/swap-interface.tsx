'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PublicKey } from '@solana/web3.js';
import { useOrcaProgram } from '@/hooks/use-orca-program';
import { useWallet } from '@solana/wallet-adapter-react';

export function SwapInterface() {
  const [amountIn, setAmountIn] = useState('');
  const [minimumAmountOut, setMinimumAmountOut] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [tokenMintIn, setTokenMintIn] = useState('');
  const [tokenMintOut, setTokenMintOut] = useState('');
  const [tokenVaultIn, setTokenVaultIn] = useState('');
  const [tokenVaultOut, setTokenVaultOut] = useState('');
  const [zeroForOne, setZeroForOne] = useState(true);
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const { swap } = useOrcaProgram();
  const { publicKey } = useWallet();

  const handleSwap = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    if (!amountIn || !minimumAmountOut || !poolAddress || !tokenMintIn || !tokenMintOut || !tokenVaultIn || !tokenVaultOut) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const tx = await swap(
        new PublicKey(poolAddress),
        new PublicKey(tokenMintIn),
        new PublicKey(tokenMintOut),
        new PublicKey(tokenVaultIn),
        new PublicKey(tokenVaultOut),
        parseFloat(amountIn) * 1e9,
        parseFloat(minimumAmountOut) * 1e9,
        zeroForOne
      );
      setTxSignature(tx);
      alert('Swap successful!');
      
      // Reset form
      setAmountIn('');
      setMinimumAmountOut('');
    } catch (error: any) {
      console.error('Swap error:', error);
      alert(`Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Token Swap</h2>
      
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
              Token Mint In
            </label>
            <input
              type="text"
              value={tokenMintIn}
              onChange={(e) => setTokenMintIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Token mint address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Vault In
            </label>
            <input
              type="text"
              value={tokenVaultIn}
              onChange={(e) => setTokenVaultIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Token vault address"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Mint Out
            </label>
            <input
              type="text"
              value={tokenMintOut}
              onChange={(e) => setTokenMintOut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Token mint address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Vault Out
            </label>
            <input
              type="text"
              value={tokenVaultOut}
              onChange={(e) => setTokenVaultOut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Token vault address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount In (tokens)
          </label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0"
            step="0.000000001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Amount Out (tokens)
          </label>
          <input
            type="number"
            value={minimumAmountOut}
            onChange={(e) => setMinimumAmountOut(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0"
            step="0.000000001"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={zeroForOne}
              onChange={(e) => setZeroForOne(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Swap Token0 for Token1 (uncheck for Token1 to Token0)
            </span>
          </label>
        </div>

        <Button
          onClick={handleSwap}
          disabled={loading || !publicKey}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
        >
          {loading ? 'Swapping...' : 'Swap Tokens'}
        </Button>

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
    </div>
  );
}
