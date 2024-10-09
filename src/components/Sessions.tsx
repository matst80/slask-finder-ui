import { ReactNode, useMemo, useState } from "react";
import { useSessions } from "../trackingHooks";
import {
  TrackedEvent,
  SessionData,
  SearchEvent,
  ClickEvent,
  CartEvent,
  ImpressionEvent,
} from "../types";
import { cm, isDefined } from "../utils";
import { useFacetList } from "../searchHooks";
import { Eye, Search, ShoppingCart } from "lucide-react";

const SearchEventElement = ({ string }: SearchEvent) => {
  const { data } = useFacetList();
  const usedFacets = useMemo(() => {
    return (
      string
        ?.map((d) => {
          const facet = data?.find((f) => f.id === d.id);
          if (facet) {
            return { name: facet.name, value: d.value };
          }
          return null;
        })
        .filter(isDefined) ?? []
    );
  }, [string, data]);
  return (
    <div>
      <span className="font-bold">
        <Search className="size-4 inline-block" /> Search
      </span>
      <ul>
        {usedFacets.map((d) => (
          <li>
            {d.name}: {d.value}
          </li>
        ))}
      </ul>
    </div>
  );
};
const ClickEventElement = (props: ClickEvent) => <div>Click</div>;
const CartEventElement = (props: CartEvent) => (
  <div className="font-bold">
    <ShoppingCart className="size-5 inline-block" />
    Add to cart
  </div>
);
const ImpressionEventElement = (props: ImpressionEvent) => (
  <div className="font-bold">
    <Eye className="size-5 inline-block" /> Impression ({props.items.length})
  </div>
);

const Event = (props: TrackedEvent) => {
  switch (props.event) {
    case 1:
      return <SearchEventElement {...props} />;
    case 2:
      return <ClickEventElement {...props} />;
    case 3:
    case 4:
      return <CartEventElement {...props} />;
    case 5:
      return <ImpressionEventElement {...props} />;
  }
};

const EventList = ({ events }: { events: TrackedEvent[] }) => {
  let indent = 0;
  return (
    <div className="flex flex-col gap-2">
      {events.map((event, idx) => {
        if (event.event === 1) {
          indent = 0;
        }
        const result = (
          <div
            key={`event-${idx}`}
            onClick={() => console.log(event)}
            className={cm(
              "self-start px-5 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer",
              indent === 1 && "ml-5",
              indent === 2 && "ml-10"
            )}
          >
            <Event {...event} />
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

const Session = ({ user_agent, ip, language, events }: SessionData) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button className="block" onClick={() => setOpen((p) => !p)}>
        <span>{user_agent}</span> | <span>{ip}</span> | <span>{language}</span>
      </button>
      {open && <EventList events={events} />}
    </div>
  );
};

export const Sessions = () => {
  const { data, isLoading } = useSessions();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {Object.entries(data ?? {})?.map(([key, session]) => (
        <Session key={key} {...session} />
      ))}
    </div>
  );
};

export const SessionButtonAndDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="bg-gray-200 rounded-lg px-3 py-1"
        onClick={() => setOpen(true)}
      >
        Sessions
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sessions />
          </div>
        </div>
      )}
    </>
  );
};
