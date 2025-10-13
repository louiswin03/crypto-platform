export default function TestImages() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-4">Test des logos</h1>
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded">
          <img src="/Binance.png" alt="Binance" className="w-24 h-24 object-contain" />
          <p className="text-black">/Binance.png</p>
        </div>
        <div className="bg-white p-4 rounded">
          <img src="/coinbase.png" alt="Coinbase" className="w-24 h-24 object-contain" />
          <p className="text-black">/coinbase.png</p>
        </div>
        <div className="bg-white p-4 rounded">
          <img src="/kraken.png" alt="Kraken" className="w-24 h-24 object-contain" />
          <p className="text-black">/kraken.png</p>
        </div>
      </div>
    </div>
  )
}
