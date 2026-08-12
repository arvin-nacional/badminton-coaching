import { Target } from 'lucide-react'

export function PracticeStepIllustration({
  sheetURL,
  index,
  columns,
  rows,
  alt,
  className = '',
}: {
  sheetURL?: string | null
  index: number
  columns: number
  rows: number
  alt?: string
  className?: string
}) {
  if (!sheetURL) {
    return (
      <div
        className={`flex aspect-square items-center justify-center rounded-2xl bg-[#e7eef4] text-[#1677ff] ${className}`}
      >
        <Target className="h-10 w-10" />
      </div>
    )
  }

  const safeColumns = Math.max(1, columns)
  const safeRows = Math.max(1, rows)
  const column = index % safeColumns
  const row = Math.floor(index / safeColumns)
  const x = safeColumns === 1 ? 0 : (column / (safeColumns - 1)) * 100
  const y = safeRows === 1 ? 0 : (row / (safeRows - 1)) * 100

  return (
    <div
      role="img"
      aria-label={alt || `Exercise ${index + 1} illustration`}
      className={`aspect-square rounded-2xl bg-[#e7eef4] bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${sheetURL})`,
        backgroundPosition: `${x}% ${y}%`,
        backgroundSize: `${safeColumns * 100}% ${safeRows * 100}%`,
      }}
    />
  )
}
