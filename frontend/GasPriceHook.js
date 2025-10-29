import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { formatGwei } from 'viem'

export function useGasPrice() {
  const [gasPrice, setGasPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const publicClient = usePublicClient()

  useEffect(() => {
    let interval

    const fetchGasPrice = async () => {
      try {
        const price = await publicClient.getGasPrice()
        setGasPrice({
          wei: price,
          gwei: formatGwei(price),
        })
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch gas price:', error)
      }
    }

    fetchGasPrice()
    interval = setInterval(fetchGasPrice, 15000) // Update every 15s

    return () => clearInterval(interval)
  }, [publicClient])

  return { gasPrice, loading }
}
