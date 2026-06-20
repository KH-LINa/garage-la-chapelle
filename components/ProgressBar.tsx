interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: 'blue' | 'green' | 'yellow'
}

const colors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
}

export default function ProgressBar({ value, max = 100, label, color = 'blue' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
