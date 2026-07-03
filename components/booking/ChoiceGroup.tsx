import { MonoLabel } from "@/components/ui/MonoLabel";

interface Option {
  readonly value: string;
  readonly label: string;
}

/** Groupe de choix exclusifs, présenté en « chips » sobres (radios accessibles). */
export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1">
        <MonoLabel tone="gris">{legend}</MonoLabel>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer select-none border px-3.5 py-2 font-serif text-[14px] transition-colors ${
                selected
                  ? "border-or-dim bg-noir-3 text-blanc"
                  : "border-line text-brume hover:border-gris"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
