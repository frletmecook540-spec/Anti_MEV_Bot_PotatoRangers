export function calculateMEVRisk({ value, gasPrice, slippage, tokenVolatility }) {
  // Enhanced MEV risk calculation algorithm
  const valueUSD = parseFloat(value) || 0
  const gasPriceGwei = parseFloat(gasPrice) || 0
  
  // Risk factors (0-100 scale)
  const valueRisk = Math.min((valueUSD / 1000) * 30, 30) // Higher value = more risk
  const gasRisk = Math.min((gasPriceGwei / 100) * 20, 20) // Higher gas = more congestion
  const slippageRisk = Math.min(slippage * 25, 25) // Higher slippage = easier to sandwich
  const volatilityRisk = Math.min(tokenVolatility * 2.5, 25) // Market volatility
  
  const totalScore = Math.round(valueRisk + gasRisk + slippageRisk + volatilityRisk)
  
  return {
    score: totalScore,
    level: totalScore > 70 ? 'high' : totalScore > 30 ? 'medium' : 'low',
    factors: {
      value: Math.round(valueRisk),
      gas: Math.round(gasRisk),
      slippage: Math.round(slippageRisk),
      volatility: Math.round(volatilityRisk),
    },
    recommendation: getRiskRecommendation(totalScore),
  }
}

function getRiskRecommendation(score) {
  if (score > 70) {
    return {
      icon: '⚠️',
      text: 'HIGH RISK - Use Flashbots RPC',
      action: 'flashbots',
    }
  } else if (score > 30) {
    return {
      icon: '⚡',
      text: 'MEDIUM RISK - Consider MEV protection',
      action: 'protect',
    }
  } else {
    return {
      icon: '✅',
      text: 'LOW RISK - Safe to proceed',
      action: 'proceed',
    }
  }
}
