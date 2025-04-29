import { Bell, LoaderCircle, Menu, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link, To } from "react-router-dom";
import { cm, getLocale, setCookie } from "../utils";
import { useUser } from "../adminHooks";
import { PropsWithChildren, useEffect } from "react";
import { MiniCart } from "./MiniCart";
import { useAdmin } from "../hooks/appState";
import { useTranslations } from "../lib/hooks/useTranslations";

const UserButton = () => {
  const { data, isLoading } = useUser();
  const [, setIsAdmin] = useAdmin();
  const loggedIn = data?.role != null;
  useEffect(() => {
    // console.log("user changed", data);
    if (data != null) {
      setIsAdmin(data?.role != null);
    }
  }, [data, setIsAdmin]);
  return (
    <a href={loggedIn ? "/admin/logout" : "/admin/login"}>
      <Button
        variant={loggedIn ? "outline" : "ghost"}
        size="icon"
        title={data?.name ?? "Logga in"}
      >
        {isLoading ? (
          <LoaderCircle className="size-5 animate-spin inline-block ml-2" />
        ) : (
          <User className={cm("size-5", loggedIn ? "text-blue-600" : "")} />
        )}
      </Button>
    </a>
  );
};

const MenuLink = ({ to, children }: PropsWithChildren<{ to: To }>) => (
  <Link
    to={to}
    className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
  >
    {children}
  </Link>
);

const regions = ["sv-SE", "sv-FI", "en-US", "en-GB"];
const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
  type: "language",
});

export function Navbar() {
  const t = useTranslations();
  const locale = getLocale();
  return (
    <nav className="bg-white shadow-md hidden md:block">
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {t("app_name")}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <MenuLink to="/">{t("menu.search")}</MenuLink>
                <MenuLink to="/dashboard">{t("menu.dashboard")}</MenuLink>
                <MenuLink to="/builder">{t("menu.builder")}</MenuLink>
                <MenuLink to="/stats">{t("menu.tracking")}</MenuLink>
                <MenuLink to="/edit">{t("menu.admin")}</MenuLink>
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <select
              onChange={(e) => {
                setCookie("sflocale", e.target.value, 365);
                window.location.reload();
              }}
              value={locale}
              className="border border-gray-300 rounded-md p-2 appearance-none"
            >
              {regions.map((item) => (
                <option key={item} value={item}>
                  {regionNamesInEnglish.of(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <MiniCart />
              <UserButton />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
