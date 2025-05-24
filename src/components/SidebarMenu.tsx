"use client";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  LayoutDashboard,
  Box,
  Edit,
  BarChart2,
  ShoppingCart,
  Clock,
  LoaderCircle,
  User,
  BotMessageSquare,
  Watch,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./ui/sidebar";
import { useTranslations } from "../lib/hooks/useTranslations";
import { TranslationKey } from "../translations/translations";
import { LanguageSelector } from "./LanguageSelector";
import { useUser } from "../adminHooks";
import { useAdmin } from "../hooks/appState";
import { Button } from "./ui/button";
import { cm } from "../utils";
import { useCookieAcceptance } from "../CookieConsent";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavigationItemType = {
  translationKey: TranslationKey;
  url: string;
  fullNavigation?: boolean;
  icon?: React.ReactNode;
  children?: NavigationItemType[];
  accessKey?: string;
  color?: string;
};

// Color palette for menu items
const menuColors = {
  search: "from-indigo-500 to-blue-500",
  config: "from-blue-500 to-indigo-500",
  dashboard: "from-blue-500 to-cyan-500",
  builder: "from-cyan-500 to-teal-500",
  edit: "from-teal-500 to-emerald-500",
  tracking: "from-emerald-500 to-green-500",
  checkout: "from-amber-500 to-orange-500",
  updated: "from-orange-500 to-rose-500",
  ai: "from-rose-500 to-pink-500",
  gifts: "from-pink-500 to-purple-500",
};

const NavigationItem = ({
  translationKey,
  url,
  icon,
  children,
  accessKey,
  fullNavigation,
  level,
  color = "from-blue-500 to-indigo-600",
}: NavigationItemType & { level: number }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === url;
  const hasChildren = children && children.length > 0;

  // Automatically open menu items when their children are active
  useEffect(() => {
    if (
      hasChildren &&
      children.some(
        (child) =>
          pathname === child.url ||
          (child.children &&
            child.children.some((grandchild) => pathname === grandchild.url))
      )
    ) {
      setIsOpen(true);
    }
  }, [pathname, hasChildren, children]);

  const isChildActive =
    hasChildren &&
    children.some(
      (child) =>
        pathname === child.url ||
        (child.children &&
          child.children.some((grandchild) => pathname === grandchild.url))
    );

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span
          className={`${
            isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
          } transition-colors duration-200`}
        >
          {icon}
        </span>
        <span className={`${level === 0 ? "font-medium" : ""}`}>
          {t(translationKey)}
        </span>
        {isActive && level === 0 && (
          <span className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
        )}
      </div>
    </>
  );

  {
    hasChildren && (
      <ChevronDown
        size={16}
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        } ${isActive ? "text-white" : "text-gray-400"}`}
      />
    );
  }

  return (
    <li className={`mb-2 ${level > 0 ? "mt-1" : "mt-0"}`}>
      <div className={`group ${hasChildren ? "cursor-pointer" : ""}`}>
        {fullNavigation ? (
          <a
            href={url}
            accessKey={accessKey}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 
            ${
              isActive
                ? `bg-gradient-to-r ${color} text-white font-medium shadow-sm`
                : isChildActive
                ? "bg-gray-50 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={
              hasChildren
                ? (e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                  }
                : undefined
            }
          >
            {content}
          </a>
        ) : (
          <Link
            href={url}
            accessKey={accessKey}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 
            ${
              isActive
                ? `bg-gradient-to-r ${color} text-white font-medium shadow-sm`
                : isChildActive
                ? "bg-gray-50 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={
              hasChildren
                ? (e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                  }
                : undefined
            }
          >
            {content}
          </Link>
        )}
      </div>

      {hasChildren && (
        <ul
          className={`pl-3 mt-1 overflow-hidden transition-all duration-300 ease-in-out border-l-2 border-gray-100 ml-2 
            ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          {children.map((child) => (
            <NavigationItem
              key={child.translationKey}
              {...child}
              level={level + 1}
              color={color}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const menu: NavigationItemType[] = [
  {
    translationKey: "menu.search",
    url: "/",
    accessKey: "1",
    icon: <Search size={20} />,
    color: menuColors.search,
  },
  {
    translationKey: "menu.config",
    url: "/config",
    accessKey: "c",
    icon: <Watch size={20} />,
    color: menuColors.config,
  },
  {
    translationKey: "menu.ai",
    url: "/ai",
    icon: <BotMessageSquare size={20} />,
    color: menuColors.ai,
  },
  {
    translationKey: "menu.gifts",
    url: "/gifts",
    icon: <Box size={20} />,
    color: menuColors.gifts,
  },
  {
    translationKey: "admin_menu.edit",
    url: "/edit",

    icon: <Edit size={20} />,
    color: menuColors.edit,
    children: [
      {
        translationKey: "admin_menu.facets",
        accessKey: "2",
        url: "/edit/facets",
      },
      {
        translationKey: "admin_menu.facet_groups",
        accessKey: "3",
        url: "/edit/facet_groups",
      },
      {
        translationKey: "admin_menu.words",
        accessKey: "3",
        url: "/edit/words",
      },
      {
        translationKey: "admin_menu.rules",
        accessKey: "r",
        url: "/edit/rules",
      },
      {
        translationKey: "admin_menu.relations",
        accessKey: "l",
        url: "/edit/relations",
      },
      {
        translationKey: "admin_menu.fields",
        url: "/edit/fields",
      },
      {
        translationKey: "admin_menu.csp",
        accessKey: "c",
        url: "/edit/csp",
      },
      {
        translationKey: "admin_menu.missing_facets",
        url: "/edit/missing_fields",
      },
    ],
  },
  {
    translationKey: "menu.tracking",
    url: "/stats",
    icon: <BarChart2 size={20} />,
    color: menuColors.tracking,
    children: [
      { translationKey: "tracking.menu.sessions", url: "/stats/sessions" },
      {
        translationKey: "tracking.menu.queries",
        url: "/stats/queries",
      },
      {
        translationKey: "tracking.emptyqueries.title",
        url: "/stats/empty",
      },
      {
        translationKey: "tracking.menu.items",
        accessKey: "p",
        url: "/stats/popular",
      },
      {
        translationKey: "tracking.menu.facets",
        accessKey: "t",
        url: "/stats/facets",
      },
      {
        translationKey: "tracking.menu.funnels",
        url: "/stats/funnels",
      },
    ],
  },
  {
    translationKey: "menu.builder",
    url: "/builder",
    icon: <Box size={20} />,
    color: menuColors.builder,
    children: [
      {
        translationKey: "builder.start.title",
        accessKey: "b",
        url: "/builder",
      },
      {
        translationKey: "builder.overview",
        url: "/builder/overview",
      },
      {
        translationKey: "builder.kit.title",
        url: "/builder/kit",
      },
    ],
  },
  {
    translationKey: "menu.dashboard",
    url: "/dashboard",
    accessKey: "d",
    icon: <LayoutDashboard size={20} />,
    color: menuColors.dashboard,
  },
  {
    translationKey: "menu.checkout",
    url: "/checkout",
    accessKey: "c",
    icon: <ShoppingCart size={20} />,
    fullNavigation: true,
    color: menuColors.checkout,
  },
  {
    translationKey: "menu.updated",
    url: "/updated",
    icon: <Clock size={20} />,
    color: menuColors.updated,
  },
];

const UserButton = () => {
  const { accepted } = useCookieAcceptance();
  const { data, isLoading } = useUser();
  const [, setIsAdmin] = useAdmin();
  const loggedIn = data?.role != null;
  useEffect(() => {
    // console.log("user changed", data);
    if (data != null) {
      setIsAdmin(data?.role != null);
    }
  }, [data, setIsAdmin]);
  if (accepted === "none" || accepted === null) {
    return null;
  }

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

export const NavMenu = () => {
  const { accepted, manageConsent } = useCookieAcceptance();
  const t = useTranslations();
  return (
    <div className="flex flex-col justify-between gap-2 h-full bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-6 mb-4">
        <h2 className="text-2xl font-bold">s10r</h2>
        <p className="text-blue-100 text-sm mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 overflow-y-auto flex flex-col justify-between px-3 md:px-6 py-2">
        <ul className="space-y-2">
          {menu.map((i) => (
            <NavigationItem key={i.translationKey} {...i} level={0} />
          ))}
        </ul>
        <div className="flex items-center justify-between mt-4">
          <Suspense>
            <LanguageSelector />
            <UserButton />
          </Suspense>
        </div>
      </nav>
      <div className="pt-4 border-t border-gray-100 mt-auto p-4 bg-gray-50">
        <div className="text-xs text-gray-500">
          s10r UI (dev){" "}
          <Suspense>
            {accepted != null && (
              <button onClick={manageConsent}>{t("menu.cookies")}</button>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export const SidebarMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sidebar open={open} setOpen={setOpen} side="left">
        <button
          onClick={() => setOpen(false)}
          className="text-white hover:text-gray-300 absolute top-4 right-4 rounded-full p-2 z-10 transition-colors duration-200"
        >
          <X size={30} />
        </button>
        <NavMenu />
      </Sidebar>
      <button
        accessKey="m"
        className="fixed left-5 bottom-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-full z-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        onClick={() => setOpen((p) => !p)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open sidebar</span>
      </button>
    </>
  );
};
