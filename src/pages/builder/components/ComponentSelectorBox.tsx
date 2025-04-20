import { CheckCircle } from "lucide-react";
import { ItemWithComponentId } from "../builder-types"
import { cm, makeImageUrl } from "../../../utils"


type ComponentSelectorBoxProps = {
  onClick: () => void;
  id: number;
  title: string;
  selected: ItemWithComponentId | undefined;
  isActive: boolean;
};

export const ComponentSelectorBox = ({
  onClick,
  title,
  id,
  selected,
  isActive,
}: ComponentSelectorBoxProps) => {
  return (
    <button
      onClick={onClick}
      data-id={String(id)}
      className={cm(
        "p-2 cursor-pointer text-left transition-colors duration-200 flex-1 min-w-[55vw] md:min-w-0 md:w-auto",
        selected != null ? "bg-gray-100" : "",
        isActive ? "border-accent border-2" : "border-gray-300 border",
      )}
    >
      {selected ? (
        <>
          <div className="flex flex-col gap-1">
            <div className="flex gap-4 items-center justify-between">
              <h2 className="text-accent font-bold text-md">{title}</h2>
              <CheckCircle className="text-accent size-4" />
            </div>
            <div className="text-sm relative text-ellipsis w-full overflow-hidden">
              {selected.title}
            </div>

            <div className="flex gap-4 items-center justify-between">
              <img
                width={48}
                height={48}
                src={makeImageUrl(selected.img)}
                alt={selected.title}
                className="size-10 object-contain mix-blend-multiply"
              />
              <div>
                <span>1 stk</span>&nbsp;
                <span className="font-bold font-regular text-[1.125rem] leading-5 tracking-wide">
                  {selected.values[4] / 100}.-
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm">Välj</div>
          <h2 className="font-bold text-lg text-ellipsis line-clamp-1 w-full overflow-hidden">
            {title}
          </h2>
        </>
      )}
    </button>
  );
};
