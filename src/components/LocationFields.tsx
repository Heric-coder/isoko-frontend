import { PROVINCES, RWANDA_PROVINCES } from '@/data/rwandaLocations'
import { useLanguage } from '@/context/LanguageContext'

export interface LocationValue {
  province: string
  district: string
  sector: string
  cell: string
}

interface LocationFieldsProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

export function LocationFields({ value, onChange }: LocationFieldsProps) {
  const { t } = useLanguage()
  const districts = value.province ? RWANDA_PROVINCES[value.province] || [] : []

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label">{t('checkout_province')}</label>
        <select
          className="input"
          value={value.province}
          onChange={(e) => onChange({ ...value, province: e.target.value, district: '' })}
          required
        >
          <option value="">—</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('checkout_district')}</label>
        <select
          className="input"
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
          disabled={!value.province}
          required
        >
          <option value="">—</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('checkout_sector')}</label>
        <input
          className="input"
          value={value.sector}
          onChange={(e) => onChange({ ...value, sector: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label">{t('checkout_cell')}</label>
        <input
          className="input"
          value={value.cell}
          onChange={(e) => onChange({ ...value, cell: e.target.value })}
          required
        />
      </div>
    </div>
  )
}
