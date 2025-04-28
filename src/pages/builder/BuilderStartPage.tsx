import { useNavigate } from "react-router-dom";
import { useBuilderContext } from "./useBuilderContext";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { TranslationKey } from "../../translations/translations";

export const ComponentSelectorBox = ({
  headerText,
  onClick,
  isRecommended,
  prefix,
}: {
  prefix: string;
  onClick: () => void;
  headerText?: string;
  isRecommended: boolean;
}) => {
  const t = useTranslations();
  return (
    <button
      className="flex-1 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 
                 border border-gray-300 flex flex-col items-center justify-center p-6 gap-3 
                 relative transform hover:-translate-y-1 focus:outline-hidden focus:ring-2 
                 focus:ring-blue focus:border-transparent"
      onClick={onClick}
    >
      {isRecommended && (
        <div className="absolute -top-3 w-full flex justify-center">
          <span className="bg-amber-600 text-white px-4 py-1 text-sm rounded-full font-medium">
            {t("common.recommended")}
          </span>
        </div>
      )}
      {headerText && (
        <div className="text-gray-500 text-xs uppercase tracking-wider">
          {headerText}
        </div>
      )}
      <div className="text-black text-[40px] font-bold">
        {t(`${prefix}.title` as TranslationKey)}
      </div>
      <div className="w-24 h-[1px] bg-gray-400 my-2"></div>
      <div className="text-center text-gray-600 text-sm max-w-xs">
        {t(`${prefix}.description` as TranslationKey)}
      </div>
    </button>
  );
};

export const BuilderStartPage = () => {
  const { rules, setOrder } = useBuilderContext();
  const push = useNavigate();
  const t = useTranslations();

  return (
    <div className="animate-fadeIn space-y-10 mx-auto max-w-6xl p-8">
      <h2 className="text-[#242424] text-2xl md:text-4xl font-medium pb-3 text-center w-full">
        {t("builder.start.title")}
      </h2>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center flex-wrap">
        {rules
          .filter((d) => d.type === "component")
          .filter((d) => d.order != null)
          .map((component, idx) => (
            <ComponentSelectorBox
              key={component.id}
              prefix={`builder.start.${component.id}`}
              headerText={t("builder.start.boxText")}
              isRecommended={idx === 0}
              onClick={() => {
                if (component.order != null) {
                  setOrder(component.order);
                }
                push("/builder/component/" + component.id);
              }}
            />
          ))}
      </div>
    </div>
  );
};
