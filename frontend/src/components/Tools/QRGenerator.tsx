import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import CopyButton from '@/components/Common/CopyButton'

type DataType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard'

export default function QRGenerator() {
  const [dataType, setDataType] = useState<DataType>('url')
  const [input, setInput] = useState('')
  const [qrCodeURL, setQRCodeURL] = useState('')
  const [size, setSize] = useState(300)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [error, setError] = useState('')

  // WiFi specific fields
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState(false)

  // vCard specific fields
  const [vcardName, setVcardName] = useState('')
  const [vcardPhone, setVcardPhone] = useState('')
  const [vcardEmail, setVcardEmail] = useState('')
  const [vcardOrg, setVcardOrg] = useState('')
  const [vcardWebsite, setVcardWebsite] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Format input based on data type
  const formatInput = (): string => {
    switch (dataType) {
      case 'url':
        return input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`
      case 'email':
        return `mailto:${input}`
      case 'phone':
        return `tel:${input.replace(/\D/g, '')}`
      case 'sms':
        return `sms:${input.replace(/\D/g, '')}`
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardName}
TEL:${vcardPhone}
EMAIL:${vcardEmail}
ORG:${vcardOrg}
URL:${vcardWebsite}
END:VCARD`
      default:
        return input
    }
  }

  const handleGenerate = async () => {
    setError('')
    setQRCodeURL('')

    try {
      const textToEncode = formatInput()

      if (!textToEncode || (dataType === 'wifi' && !wifiSSID) || (dataType === 'vcard' && !vcardName)) {
        throw new Error('Please fill in the required fields')
      }

      const options = {
        errorCorrectionLevel: errorCorrection,
        width: size,
        margin: 1,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      }

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(textToEncode, options)
      setQRCodeURL(url)

      // Also draw on canvas for reference
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, textToEncode, options)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code')
    }
  }

  const handleDownload = () => {
    if (!qrCodeURL) return

    const link = document.createElement('a')
    link.href = qrCodeURL
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const loadSample = () => {
    setDataType('url')
    setInput('https://developer-tools.example.com')
  }

  const handleClear = () => {
    setInput('')
    setQRCodeURL('')
    setError('')
    setWifiSSID('')
    setWifiPassword('')
    setVcardName('')
    setVcardPhone('')
    setVcardEmail('')
    setVcardOrg('')
    setVcardWebsite('')
  }

  // Auto-generate when switching data types or changing values
  useEffect(() => {
    if (input || wifiSSID || vcardName) {
      const timer = setTimeout(() => {
        handleGenerate()
      }, 500) // Debounce
      return () => clearTimeout(timer)
    }
  }, [input, dataType, size, errorCorrection, foregroundColor, backgroundColor, wifiSSID, wifiPassword, wifiEncryption, wifiHidden, vcardName, vcardPhone, vcardEmail, vcardOrg, vcardWebsite])

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample URL"
          >
            📋 Sample
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary text-sm"
            title="Clear all"
          >
            🗑️ Clear
          </button>
          {qrCodeURL && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
              title="Download QR code as PNG"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>

      {/* Data Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Type:
        </label>
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value as DataType)}
          className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="text">Plain Text</option>
          <option value="url">URL / Website</option>
          <option value="email">Email Address</option>
          <option value="phone">Phone Number</option>
          <option value="sms">SMS Message</option>
          <option value="wifi">WiFi Network</option>
          <option value="vcard">Contact Card (vCard)</option>
        </select>
      </div>

      {/* Input Fields Based on Data Type */}
      {(dataType === 'text' || dataType === 'url') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {dataType === 'url' ? 'URL / Website' : 'Text'}:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea font-mono text-sm"
            rows={4}
            placeholder={dataType === 'url' ? 'https://example.com' : 'Enter any text...'}
          />
        </div>
      )}

      {(dataType === 'email' || dataType === 'phone' || dataType === 'sms') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {dataType === 'email' ? 'Email Address' : dataType === 'phone' ? 'Phone Number' : 'Phone Number for SMS'}:
          </label>
          <input
            type={dataType === 'email' ? 'email' : 'tel'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input w-full"
            placeholder={dataType === 'email' ? 'user@example.com' : '+1234567890'}
          />
        </div>
      )}

      {dataType === 'wifi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WiFi Network Name (SSID):
            </label>
            <input
              type="text"
              value={wifiSSID}
              onChange={(e) => setWifiSSID(e.target.value)}
              className="input w-full"
              placeholder="MyWiFiNetwork"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password:
            </label>
            <input
              type="text"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              className="input w-full"
              placeholder="password123"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Encryption:
              </label>
              <select
                value={wifiEncryption}
                onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifiHidden}
                  onChange={(e) => setWifiHidden(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Hidden Network
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {dataType === 'vcard' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name:
            </label>
            <input
              type="text"
              value={vcardName}
              onChange={(e) => setVcardName(e.target.value)}
              className="input w-full"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone:
              </label>
              <input
                type="tel"
                value={vcardPhone}
                onChange={(e) => setVcardPhone(e.target.value)}
                className="input w-full"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email:
              </label>
              <input
                type="email"
                value={vcardEmail}
                onChange={(e) => setVcardEmail(e.target.value)}
                className="input w-full"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization:
              </label>
              <input
                type="text"
                value={vcardOrg}
                onChange={(e) => setVcardOrg(e.target.value)}
                className="input w-full"
                placeholder="Company Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website:
              </label>
              <input
                type="url"
                value={vcardWebsite}
                onChange={(e) => setVcardWebsite(e.target.value)}
                className="input w-full"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Error Correction:
          </label>
          <select
            value={errorCorrection}
            onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size: {size}px
          </label>
          <input
            type="range"
            min="200"
            max="800"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Foreground Color:
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Color:
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeURL && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              📱 Scannable QR Code
            </h3>
            <CopyButton text={qrCodeURL} />
          </div>

          <div className="flex justify-center mb-4">
            <img
              src={qrCodeURL}
              alt="QR Code"
              className="border-4 border-gray-100 dark:border-gray-800 rounded-lg"
              style={{ width: size, height: size }}
            />
          </div>

          {/* Hidden canvas for reference */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Data Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-xs">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Encoded Data:
            </p>
            <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">
              {formatInput()}
            </pre>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>The QR code is generated in real-time and updates automatically</li>
          <li>Scan the QR code with your phone camera or QR code scanner app</li>
          <li>Higher error correction allows the QR code to be scanned even if partially damaged</li>
          <li>WiFi QR codes allow instant network connection on most devices</li>
          <li>vCard QR codes allow quick contact information sharing</li>
          <li>Download the QR code as PNG for use in documents or websites</li>
        </ul>
      </div>
    </div>
  )
}
