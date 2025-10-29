import { useState } from 'react'
import { useMEVSimulation } from '../hooks/useMEVSimulation'
import { useGasPrice } from '../hooks/useGasPrice'

export default function TransactionSimulator({ onExecute }) {
  const { riskScore, isSimulating, simulationData, simulateMEVRisk } = useMEVSimulation()
  const { gasPrice } = useGasPrice()
  const [txAmount, setTxAmount] = useState('0.1')

  const handleSimulate = async () => {
    await simulateMEVRisk({
      value: txAmount,
      gasPrice: gasPrice?.gwei || '0',
      slippage: 0.5,
    })
  }

  const getRiskColor = () => {
    if (riskScore > 70) return '#ef4444'
    if (riskScore > 30) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div className="simulator-card">
      <h2>🔍 Transaction Simulator</h2>
      <p>Check MEV risk before submitting transactions</p>

      <div className="input-group">
        <label>Transaction Amount (ETH)</label>
        <input
          type="number"
          value={txAmount}
          onChange={(e) => setTxAmount(e.target.value)}
          step="0.01"
          min="0"
          placeholder="0.1"
        />
      </div>

      {gasPrice && (
        <div className="gas-info">
          <span>⛽ Current Gas: {parseFloat(gasPrice.gwei).toFixed(2)} Gwei</span>
        </div>
      )}

      <div className="risk-meter">
        <div 
          className="risk-bar" 
          style={{
            width: `${riskScore}%`,
            backgroundColor: getRiskColor(),
          }}
        />
        <span className="risk-score">{riskScore}/100</span>
      </div>

      {simulationData && (
        <div className="risk-breakdown">
          <h4>Risk Factors:</h4>
          <div className="factors">
            <span>Value Risk: {simulationData.factors.value}%</span>
            <span>Gas Risk: {simulationData.factors.gas}%</span>
            <span>Slippage Risk: {simulationData.factors.slippage}%</span>
            <span>Volatility Risk: {simulationData.factors.volatility}%</span>
          </div>
          <p className="recommendation">
            {simulationData.recommendation.icon} {simulationData.recommendation.text}
          </p>
        </div>
      )}

      <div className="button-group">
        <button 
          onClick={handleSimulate}
          disabled={isSimulating}
          className="btn-primary"
        >
          {isSimulating ? 'Simulating...' : '🔍 Simulate MEV Risk'}
        </button>

        <button 
          onClick={() => onExecute(txAmount)}
          disabled={riskScore === 0 || isSimulating}
          className="btn-protected"
        >
          🛡️ Execute Protected Swap
        </button>
      </div>
    </div>
  )
}
