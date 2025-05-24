import { useMemo, useState } from "react";
import { useItemData, useSessions } from "../hooks/trackingHooks";
import {
  TrackedEvent,
  SessionData,
  SearchEvent,
  ClickEvent,
  CartEvent,
  ImpressionEvent,
  ActionEvent,
  SuggestionEvent,
  CheckoutEvent,
  BaseEvent,
  ItemEvent,
} from "../lib/types";
import { cm, isDefined, makeImageUrl } from "../utils";
import { useFacetList } from "../hooks/searchHooks";
import {
  Eye,
  Flashlight,
  MonitorCheck,
  Search,
  ShoppingCart,
  Sparkles,
  TabletSmartphone,
} from "lucide-react";

import { TimeAgo } from "./TimeAgo";
import { useTranslations } from "../lib/hooks/useTranslations";
import { Loader } from "./Loader";
import { JsonView } from "../page-components/tracking/JsonView";
import Link from "next/link";

const SearchEventElement = ({ string, query }: SearchEvent) => {
  const { data } = useFacetList();
  const t = useTranslations();
  const usedFacets = useMemo(() => {
    return (
      string
        ?.map((d) => {
          const facet = data?.find((f) => f.id === d.id);
          if (facet) {
            return { name: facet.name, value: d.value, id: d.id };
          }
          return null;
        })
        .filter(isDefined) ?? []
    );
  }, [string, data]);
  return (
    <div>
      <span className="font-bold">
        <Search className="size-4 inline-block" />{" "}
        {t("tracking.sessions.events.search")}
        {query != null && query.length > 0 ? ` (${query})` : ""}
      </span>
      <ul>
        {usedFacets.map((d) => (
          <li key={d.id}>
            {d.name}: {Array.isArray(d.value) ? d.value.join(", ") : d.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ItemPreview = ({ id }: Partial<ItemEvent>) => {
  const { data } = useItemData(id ?? 0);
  const t = useTranslations();
  if (!id) {
    return null;
  }
  if (!data) {
    return <div>{t("tracking.sessions.loading")}</div>;
  }
  return (
    <div className="p-3 bg-white rounded-lg shadow-xs">
      <img
        src={makeImageUrl(data.img)}
        title={data.title}
        className="object-contain size-28"
      />
    </div>
  );
};

const ClickEventElement = (props: ClickEvent) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <div onClick={() => setOpen((p) => !p)}>
      {t("tracking.sessions.events.click")} ({props.item_name ?? props.id})
      {open && <ItemPreview {...props} />}
    </div>
  );
};
const CartEventElement = (props: CartEvent) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <div className="font-bold" onClick={() => setOpen((p) => !p)}>
      <ShoppingCart className="size-5 inline-block mr-2" />
      {props.event == 15 ? (
        <>
          {t("tracking.sessions.events.changeQuantity", {
            quantity: props.quantity,
          })}
        </>
      ) : (
        <>
          {t("tracking.sessions.events.addToCart")} (
          {props.item_name ?? props.id} - {props.quantity})
          {open && <ItemPreview {...props} />}
        </>
      )}
    </div>
  );
};
const ImpressionEventElement = (props: ImpressionEvent) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <div className="font-bold" onClick={() => setOpen((p) => !p)}>
      <Eye className="size-5 inline-block" />{" "}
      {t("tracking.sessions.events.impression", { count: props.items.length })}
      {open && (
        <div className="p-4 rounded-lg bg-white">
          <div className="flex gap-2 flex-wrap">
            {props.items.map((item) => (
              <ItemPreview key={item.id} id={item.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const useActionName = () => {
  const t = useTranslations();
  return (action: string): string => {
    if (action === "exit") {
      return t("tracking.sessions.events.action.exit");
    }
    if (action === "lost-focus") {
      return t("tracking.sessions.events.action.lostFocus");
    }
    if (action === "got-focus") {
      return t("tracking.sessions.events.action.gotFocus");
    }
    return action;
  };
};

const ActionEventElement = ({ action, reason, item }: ActionEvent) => {
  const getActionName = useActionName();
  return (
    <div className="font-bold">
      <Flashlight className="size-5 inline-block" /> {getActionName(action)} (
      {reason}){item != null && <ItemPreview {...item} />}
    </div>
  );
};

const SuggestionEventElement = (props: SuggestionEvent) => {
  const { value, results, suggestions } = props;
  const t = useTranslations();

  return (
    <div>
      <span className="font-bold">
        <Sparkles className="size-4 inline-block" />{" "}
        {t("tracking.sessions.events.suggestion", { value })}
      </span>
      <div className="mt-1">
        <div>
          {t("tracking.sessions.events.items")}: {results}
        </div>
        <div>
          {t("tracking.sessions.events.suggestedWords")}: {suggestions}
        </div>
      </div>
    </div>
  );
};

const CheckoutEventElement = (props: CheckoutEvent) => {
  const { items } = props;
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <div onClick={() => setOpen((p) => !p)}>
      <span className="font-bold">
        <ShoppingCart className="size-4 inline-block" />{" "}
        {t("tracking.sessions.events.checkout", { count: items.length })}
      </span>
      {open && (
        <div className="p-4 rounded-lg bg-white">
          <div className="flex gap-2 flex-wrap">
            {props.items.map((item) => (
              <ItemPreview key={item.id} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Event = (props: TrackedEvent) => {
  switch (props.event) {
    case 1:
      return <SearchEventElement {...props} />;
    case 2:
      return <ClickEventElement {...props} />;
    case 3:
    case 4:
    case 11:
    case 15:
      return <CartEventElement {...props} />;
    case 5:
      return <ImpressionEventElement {...props} />;
    case 6:
      return <ActionEventElement {...props} />;
    case 7:
      return <SuggestionEventElement {...props} />;
    case 14:
      return <CheckoutEventElement {...props} />;
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const EventList = ({ events }: { events: TrackedEvent[] }) => {
  let indent = 0;
  let currentDate = "";
  /*   const { all } = useMemo(() => {
    return events.reduce(
      ({ all, lastEvent }, event) => {
        if (lastEvent?.event === 7 && event.event === 7) {
          all.pop();
        }
        return { all: [...all, event], lastEvent: event };
      },
      { all: [], lastEvent: undefined } as {
        all: TrackedEvent[];
        lastEvent: TrackedEvent | undefined;
      }
    );
  }, [events]); */

  return (
    <div className="flex flex-col gap-4">
      {events.map((event, idx) => {
        const eventDate = formatDate(event.ts);
        const showDateSeparator = eventDate !== currentDate;
        currentDate = eventDate;

        if (event.event === 1 || event.event === 7) {
          indent = 0;
        }

        const result = (
          <div key={`event-${idx}`}>
            {showDateSeparator && (
              <div className="relative my-4">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-gray-500">
                    {eventDate}
                  </span>
                </div>
              </div>
            )}
            <div
              onClick={() => console.log(event)}
              className={cm(
                "self-start px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                indent === 1 && "ml-5",
                indent === 2 && "ml-10",
                event.event === 1 &&
                  "bg-blue-50 text-blue-800 hover:bg-blue-100",
                event.event === 2 &&
                  "bg-green-50 text-green-800 hover:bg-green-100",
                (event.event === 3 ||
                  event.event === 4 ||
                  event.event === 11 ||
                  event.event === 14 ||
                  event.event === 15) &&
                  "bg-purple-50 text-purple-800 hover:bg-purple-100",
                event.event === 5 &&
                  "bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
                event.event === 6 &&
                  "bg-gray-50 text-gray-800 hover:bg-gray-100",
                event.event === 7 &&
                  "bg-pink-50 text-pink-800 hover:bg-pink-100"
              )}
            >
              <Event {...event} />
            </div>
          </div>
        );

        if (event.event === 1) {
          indent = 1;
        }
        if (event.event === 3 || (event.event === 4 && indent === 1)) {
          indent = 2;
        }

        return result;
      })}
    </div>
  );
};

const trimLanguage = (language?: string) => {
  const first = language?.split(",")[0];
  if (first?.includes("sv")) {
    return "Swedish";
  }
  if (first?.includes("en")) {
    return "English";
  }
};

const getDeviceFromUserAgent = (user_agent?: string) => {
  const t = useTranslations();
  if (!user_agent) {
    return null;
  }
  if (user_agent.includes("SM-")) {
    return t("tracking.sessions.device.samsung");
  }
  if (user_agent.includes("Android")) {
    return t("tracking.sessions.device.android");
  }
  if (user_agent.includes("iPhone")) {
    return t("tracking.sessions.device.iphone");
  }
  if (user_agent.includes("iPad")) {
    return t("tracking.sessions.device.ipad");
  }
  if (user_agent.includes("Macintosh")) {
    return t("tracking.sessions.device.mac");
  }
  if (user_agent.includes("Windows")) {
    return t("tracking.sessions.device.windows");
  }
  if (user_agent.includes("Linux")) {
    return t("tracking.sessions.device.linux");
  }

  return user_agent.split(" ")[0];
};

const getBrowserFromUserAgent = (user_agent?: string) => {
  const t = useTranslations();
  if (!user_agent) {
    return null;
  }
  if (user_agent.includes("SamsungBrowser")) {
    return t("tracking.sessions.browser.samsung");
  }
  if (user_agent.includes("Chrome")) {
    return t("tracking.sessions.browser.chrome");
  }
  if (user_agent.includes("Firefox")) {
    return t("tracking.sessions.browser.firefox");
  }
  if (user_agent.includes("Safari")) {
    return t("tracking.sessions.browser.safari");
  }
  if (user_agent.includes("Edge")) {
    return t("tracking.sessions.browser.edge");
  }

  return user_agent.split(" ")[1];
};

const isMobile = function (a: string) {
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      a
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      a.substr(0, 4)
    )
  );
};

const Session = (props: SessionData) => {
  const { user_agent, ip, language, id } = props;
  const t = useTranslations();
  return (
    <Link
      href={`/stats/session/${id}`}
      className="min-w-fit flex flex-col p-4 bg-white rounded-xs shadow-xs hover:shadow-md transition-shadow relative"
    >
      <div className="text-lg font-medium mb-2" title={user_agent}>
        {trimLanguage(language)}, {getDeviceFromUserAgent(user_agent)}{" "}
        {getBrowserFromUserAgent(user_agent)}
        {ip != null && ip.length ? ` (${ip.trim()})` : ""}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {t("tracking.sessions.created")}
          </span>
          <TimeAgo ts={props.ts * 1000} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {t("tracking.sessions.updated")}
          </span>
          <TimeAgo ts={props.last_update * 1000} />
        </div>
      </div>
      {user_agent != null && (
        <div className="absolute top-0 right-0 p-2 text-xs text-gray-500">
          {isMobile(user_agent) ? (
            <TabletSmartphone className="size-5" aria-label="Mobile/Tablet" />
          ) : (
            <MonitorCheck className="size-5" aria-label="Desktop" />
          )}
        </div>
      )}
    </Link>
  );
};

const byLastUpdate = (a: BaseEvent, b: BaseEvent) => {
  return (b.last_update ?? b.ts) - (a.last_update ?? b.ts);
};

export const Sessions = () => {
  const { data, isLoading } = useSessions();
  const t = useTranslations();
  const sessions = useMemo(() => {
    return data?.sort(byLastUpdate) ?? [];
  }, [data]);
  if (isLoading) {
    return <div>{t("tracking.sessions.loading")}</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => (
        <Session key={`${session.ip}-${session.id}`} {...session} />
      ))}
    </div>
  );
};

export const SessionView = (data: SessionData) => {
  const t = useTranslations();
  const eventSummary = useMemo(() => {
    if (!data)
      return {
        searches: 0,
        clicks: 0,
        cartActions: 0,
        impressions: 0,
        actions: 0,
        suggestions: 0,
      };

    const summary = {
      searches: 0,
      clicks: 0,
      cartActions: 0,
      impressions: 0,
      actions: 0,
      suggestions: 0,
    };
    data.events?.filter(isDefined).forEach((event) => {
      switch (event.event) {
        case 1:
          summary.searches++;
          break;
        case 2:
          summary.clicks++;
          break;
        case 3:
        case 4:
        case 11:
        case 15:
          summary.cartActions++;
          break;
        case 5:
          summary.impressions++;
          break;
        case 6:
          summary.actions++;
          break;
        case 7:
          summary.suggestions++;
          break;
      }
    });
    return summary;
  }, [data]);

  if (!data) {
    return <Loader size="lg" variant="default" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white md:rounded-lg md:shadow-xs md:p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {t("tracking.sessions.details")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              {t("tracking.sessions.ip")}
            </h2>
            <p className="text-lg">{data.ip}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              {t("tracking.sessions.language")}
            </h2>
            <p className="text-lg">{data.language}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              {t("tracking.sessions.user_agent")}
            </h2>
            <p className="text-sm text-gray-600">{data.user_agent}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              {t("tracking.sessions.updated")}
            </h2>
            <p className="text-lg">
              <TimeAgo ts={data.last_update * 1000} />
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              {t("tracking.sessions.created")}
            </h2>
            <p className="text-lg">
              <TimeAgo ts={data.ts * 1000} />
            </p>
          </div>
        </div>

        <div className="bg-gray-50 hidden md:block rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">
            {t("tracking.sessions.summary")}
          </h2>
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {eventSummary.searches}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.search")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {eventSummary.clicks}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.click")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {eventSummary.cartActions}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.cart")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {eventSummary.impressions}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.impressions")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {eventSummary.actions}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.actions")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {eventSummary.suggestions}
              </div>
              <div className="text-sm text-gray-600">
                {t("tracking.sessions.actions.suggestions")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <JsonView data={{ groups: data.groups, variations: data.variations }} />
      </div>
      <div className="bg-white rounded-lg md:shadow-xs md:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("tracking.sessions.timeline")}
        </h2>
        <EventList events={data.events?.filter(isDefined) ?? []} />
      </div>
    </div>
  );
};
