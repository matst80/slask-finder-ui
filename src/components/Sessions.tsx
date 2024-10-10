import { useMemo, useState } from "react";
import { useItemData, useSessions } from "../trackingHooks";
import {
  TrackedEvent,
  SessionData,
  SearchEvent,
  ClickEvent,
  CartEvent,
  ImpressionEvent,
  ActionEvent,
} from "../types";
import { cm, isDefined, makeImageUrl } from "../utils";
import { useFacetList } from "../searchHooks";
import { Eye, Flashlight, Search, ShoppingCart } from "lucide-react";
import { ResultItem } from "./ResultItem";

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

const ItemPreview = ({ id }: { id: number }) => {
  const { data } = useItemData(id);
  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <img
      src={makeImageUrl(data.img)}
      title={data.title}
      className="object-cover size-28"
    />
  );
};

const ClickEventElement = (props: ClickEvent) => {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen((p) => !p)}>
      Click ({props.item}){open && <ItemPreview id={props.item} />}
    </div>
  );
};
const CartEventElement = (props: CartEvent) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="font-bold" onClick={() => setOpen((p) => !p)}>
      <ShoppingCart className="size-5 inline-block" />
      Add to cart ({props.item} - {props.quantity})
      {open && <ItemPreview id={props.item} />}
    </div>
  );
};
const ImpressionEventElement = (props: ImpressionEvent) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="font-bold" onClick={() => setOpen((p) => !p)}>
      <Eye className="size-5 inline-block" /> Impression ({props.items.length})
      {open && (
        <div className="p-4 rounded-lg bg-white">
          <div className="flex gap-2 flex-wrap">
            {props.items.map((item) => (
              <ItemPreview id={item.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getActionName = (action: string) => {
  if (action === "exit") {
    return "Leave the page";
  }
  if (action === "lost-focus") {
    return "Tab out of the application";
  }
  if (action === "got-focus") {
    return "Got back to the application";
  }
  return action;
};

const ActionEventElement = ({ action, reason }: ActionEvent) => {
  return (
    <div className="font-bold">
      <Flashlight className="size-5 inline-block" /> {getActionName(action)} (
      {reason})
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
      return <CartEventElement {...props} />;
    case 5:
      return <ImpressionEventElement {...props} />;
    case 6:
      return <ActionEventElement {...props} />;
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
              indent === 2 && "ml-10",
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

const Session = (props: SessionData) => {
  const { user_agent, ip, language, events } = props;
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => console.log(props)}>
      <button
        className="block min-w-fit"
        onClick={() => setOpen((p) => !p)}
        title={user_agent}
      >
        <span>{ip}</span> | <span>{language}</span>
      </button>
      {open && <EventList events={events} />}
    </div>
  );
};

const byTs = (a: SessionData, b: SessionData) => {
  return a.ts - b.ts;
};

export const Sessions = () => {
  const { data, isLoading } = useSessions();
  const sessions = useMemo(() => {
    return data?.sort(byTs) ?? [];
  }, [data]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session, idx) => (
        <Session key={`session-${idx}`} {...session} />
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
