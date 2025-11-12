import { useState } from 'react'

export default function UnitConverter() {
  const [category, setCategory] = useState<'length' | 'weight' | 'temperature'>('length')
  const [value, setValue] = useState<string>('1')
  const [fromUnit, setFromUnit] = useState('meter')
  const [toUnit, setToUnit] = useState('foot')

  const conversions = {
    length: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      mile: 0.000621371,
      yard: 1.09361,
      foot: 3.28084,
      inch: 39.3701,
    },
    weight: {
      kilogram: 1,
      gram: 1000,
      milligram: 1000000,
      pound: 2.20462,
      ounce: 35.274,
      ton: 0.001,
    },
    temperature: {
      celsius: (v: number) => v,
      fahrenheit: (v: number) => (v * 9) / 5 + 32,
      kelvin: (v: number) => v + 273.15,
    },
  }

  const convertValue = () => {
    const numValue = parseFloat(value) || 0

    if (category === 'temperature') {
      // Special handling for temperature
      let celsius = numValue
      if (fromUnit === 'fahrenheit') celsius = ((numValue - 32) * 5) / 9
      if (fromUnit === 'kelvin') celsius = numValue - 273.15

      const converter = conversions.temperature[toUnit as keyof typeof conversions.temperature]
      return typeof converter === 'function' ? converter(celsius).toFixed(4) : '0'
    }

    // Regular conversion
    const fromFactor = conversions[category][fromUnit as keyof typeof conversions[typeof category]]
    const toFactor = conversions[category][toUnit as keyof typeof conversions[typeof category]]
    const result = (numValue / (fromFactor as number)) * (toFactor as number)
    return result.toFixed(4)
  }

  const units = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
    weight: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
  }

  const result = convertValue()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['length', 'weight', 'temperature'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat)
                setFromUnit(units[cat][0])
                setToUnit(units[cat][1])
              }}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input w-full mb-2"
            placeholder="Enter value..."
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="input w-full capitalize"
          >
            {units[category].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-2">
            <div className="text-3xl font-bold text-primary-900 dark:text-primary-100">
              {result}
            </div>
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="input w-full capitalize"
          >
            {units[category].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formula</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {value} {fromUnit} = {result} {toUnit}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Quick Reference</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
          {category === 'length' && (
            <>
              <div>• 1 meter = 3.28 feet</div>
              <div>• 1 kilometer = 0.62 miles</div>
              <div>• 1 inch = 2.54 centimeters</div>
              <div>• 1 yard = 0.91 meters</div>
            </>
          )}
          {category === 'weight' && (
            <>
              <div>• 1 kilogram = 2.2 pounds</div>
              <div>• 1 pound = 16 ounces</div>
              <div>• 1 ton = 1000 kilograms</div>
              <div>• 1 ounce = 28.35 grams</div>
            </>
          )}
          {category === 'temperature' && (
            <>
              <div>• 0°C = 32°F = 273.15K</div>
              <div>• 100°C = 212°F = 373.15K</div>
              <div>• °F = (°C × 9/5) + 32</div>
              <div>• °C = (°F - 32) × 5/9</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
