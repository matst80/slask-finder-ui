import { Link } from "react-router-dom";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { TranslationKey } from "../../translations/translations";

const items = [
  "facets",
  "fields",
  "missing_facets",
  "rules",
  "relations",
  "facet_groups",
  "csp",
];

export const AdminNavBar = () => {
  const t = useTranslations();

  return (
    <nav className="bg-white shadow-md border-t border-gray-300">
      <div className="mx-auto sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-12">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 md:gap-4 flex-nowrap">
              {items.map((item) => (
                <Link
                  key={item}
                  to={`/edit/${item}`}
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium shrink-0"
                >
                  {t(`admin_menu.${item}` as TranslationKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
