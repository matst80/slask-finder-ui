import { ListRestartIcon } from "lucide-react";
import { useBuilderContext } from "../useBuilderContext"


export const BuilderTop = () => {
  const { percentDone, reset } = useBuilderContext();
  return (
    <div className="md:flex justify-between items-center px-4 pt-4">
      <div className="hidden md:block">
        <h1 className="text-2xl font-elkjop-text font-bold">Bygg din dator</h1>
      </div>
      <div className="flex gap-2">
        <button onClick={reset} className="flex gap-2 items-center text-sm">
          <ListRestartIcon className="size-4" /> Börja om
        </button>
        <div>
          <span className="text-black text-xl font-bold font-elkjop uppercase tracking-tight">
            Ditt bygge&nbsp;
          </span>
          <span className="text-[#4a90e2] text-xl font-bold font-elkjop uppercase tracking-tight">
            {percentDone}% klart
          </span>
        </div>
      </div>
    </div>
  );
};
