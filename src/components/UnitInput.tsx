import type { FrequencyUnit, LengthUnit } from '@/lib/units'
import { FREQUENCY_UNITS, LENGTH_UNITS } from '@/lib/units'

type Unit = FrequencyUnit | LengthUnit

interface UnitInputProps {
  label: string
  value: number
  unit: Unit
  onValueChange: (value: number) => void
  onUnitChange: (unit: Unit) => void
  unitOptions: readonly Unit[]
  min?: number
  step?: number
}

export function UnitInput({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  unitOptions,
  min = 0,
  step = 0.01,
}: UnitInputProps) {
  return (
    <div className="unit-input">
      <label>
        <span className="label-text">{label}</span>
        <div className="input-row">
          <input
            type="number"
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v)) onValueChange(v)
            }}
            min={min}
            step={step}
          />
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as Unit)}
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>
  )
}

export function FrequencyInput(
  props: Omit<UnitInputProps, 'unitOptions'> & { unit: FrequencyUnit }
) {
  return <UnitInput {...props} unitOptions={FREQUENCY_UNITS} />
}

export function LengthInput(
  props: Omit<UnitInputProps, 'unitOptions'> & { unit: LengthUnit }
) {
  return <UnitInput {...props} unitOptions={LENGTH_UNITS} />
}
