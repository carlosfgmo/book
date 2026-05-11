'use client'

type Props = {
  current?: string
  hiddenFields?: Record<string, string>
}

export default function SortSelect({ current, hiddenFields = {} }: Props) {
  return (
    <form>
      {Object.entries(hiddenFields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <select
        name="orden"
        defaultValue={current ?? ''}
        onChange={(e) => (e.target.form as HTMLFormElement).submit()}
        className="text-sm border border-stone-200 rounded-lg px-2 py-1.5 text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
      >
        <option value="">Más recientes</option>
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
        <option value="titulo">Título A–Z</option>
      </select>
    </form>
  )
}
