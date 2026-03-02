import { ParamSchema } from '@/engine/params/schema';

export const ParamControls = ({ schema, values, onChange }: { schema: ParamSchema; values: Record<string, any>; onChange: (k: string, v: any) => void }) => (
  <div>
    {Object.entries(schema).map(([k, p]) => {
      if (p.visibleWhen && values[p.visibleWhen.key] !== p.visibleWhen.equals) return null;
      return (
        <label key={k} className="ctrl">
          <span>{p.label}</span>
          {p.type === 'slider' && <input type="range" min={p.min} max={p.max} step={p.step} value={values[k]} onChange={(e) => onChange(k, Number(e.target.value))} />}
          {p.type === 'toggle' && <input type="checkbox" checked={values[k]} onChange={(e) => onChange(k, e.target.checked)} />}
          {p.type === 'color' && <input type="color" value={values[k]} onChange={(e) => onChange(k, e.target.value)} />}
          {p.type === 'select' && <select value={values[k]} onChange={(e) => onChange(k, e.target.value)}>{p.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
          {p.type === 'button' && <button onClick={() => onChange('seed', Math.round(Math.random() * 9999))}>{p.label}</button>}
        </label>
      );
    })}
  </div>
);
