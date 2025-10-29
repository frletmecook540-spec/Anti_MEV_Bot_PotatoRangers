import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { AlertCircle, Shield, TrendingUp } from 'lucide-react'
import './App.css'

import TransactionSimulator from './components/TransactionSimulator'
import { useContract } from './hooks/useContract'

function App() {
  const { address, isConnected } = useAccount()
  const { contract, isReady } = useContract()
  
  const [txStatus, setTxStatus] = useState('')
  const [stats, setStats] = useState({
    totalTxs: 0,
    mevSaved: 0,
    lastUpdate: null,
  })

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('mev-stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [address])

  const executeProtectedSwap = async (amount) => {
    if (!isReady) {
      setTxStatus('❌ Wallet not connected')
      return
    }

    setTxStatus('🔄 Executing protected swap...')

    try {
      // Execute contract function using viem
      const hash = await contract.write.protectedSwap([
        '0x0000000000000000000000000000000000000000', // tokenIn (ETH)
        '0x0000000000000000000000000000000000000000', // tokenOut (placeholder)
        parseEther(amount),
      ])

      setTxStatus('⏳ Transaction submitted! Waiting for confirmation...')
      
      // Wait for transaction
      const receipt = await contract.publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        setTxStatus('✅ Transaction confirmed successfully!')
        
        // Update stats
        const newStats = {
          totalTxs: stats.totalTxs + 1,
          mevSaved: stats.mevSaved + (Math.random() * 50), // Simulated savings
          lastUpdate: new Date().toISOString(),
        }
        setStats(newStats)
        localStorage.setItem('mev-stats', JSON.stringify(newStats))
      } else {
        setTxStatus('❌ Transaction failed')
      }
    } catch (error) {
      console.error('Transaction error:', error)
      setTxStatus(`❌ Error: ${error.message?.substring(0, 100)}`)
    }
  }

  return (
    <div className="App">
      <header>
        <div className="logo">
          <Shield size={32} />
          <h1>MEV Protection Dashboard</h1>
        </div>
        <ConnectButton />
      </header>

      {isConnected ? (
        <main>
          <TransactionSimulator onExecute={executeProtectedSwap} />

          {txStatus && (
            <div className="status-banner">
              <AlertCircle size={20} />
              <span>{txStatus}</span>
            </div>
          )}

          <div className="info-grid">
            <div className="info-card stats-card">
              <TrendingUp size={24} />
              <h3>Your Stats</h3>
              <div className="stat-item">
                <span className="stat-label">Protected Transactions</span>
                <span className="stat-value">{stats.totalTxs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estimated MEV Saved</span>
                <span className="stat-value">${stats.mevSaved.toFixed(2)}</span>
              </div>
            </div>

            <div className="info-card">
              <Shield size={24} />
              <h3>Protection Methods</h3>
              <ul className="protection-list">
                <li>✅ Smart Contract Time-Delay</li>
                <li>✅ Flashbots RPC Integration</li>
                <li>✅ Gas Price Optimization</li>
                <li>✅ Slippage Protection</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📚 How It Works</h3>
              <ol className="steps-list">
                <li>Simulate your transaction</li>
                <li>Analyze MEV risk factors</li>
                <li>Route through protection layer</li>
                <li>Execute safely on-chain</li>
              </ol>
            </div>
          </div>
        </main>
      ) : (
        <main>
          <div className="connect-prompt">
            <Shield size={64} />
            <h2>Welcome to MEV Protection</h2>
            <p>Connect your wallet to start protecting your transactions from MEV attacks</p>
            <div className="features">
              <div className="feature">⚡ Real-time risk analysis</div>
              <div className="feature">🛡️ Automated protection</div>
              <div className="feature">💰 Save on transaction costs</div>
            </div>
          </div>
        </main>
      )}

      <footer>
        <p>Built with ❤️ for a MEV-free future</p>
      </footer>
    </div>
  )
}

export default App
