import useSWR from "swr";
import { toJson } from "../../lib/datalayer/api";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { TimeAgo } from "../../components/TimeAgo";
import { useState } from "react";
import { useClipboard } from "../../lib/hooks/useClipboard";

type CspIssue = {
  firstSeen: number;
  lastSeen: number;
  count: number;
  firstBody: unknown;
  [key: string]: unknown;
};

const splitType = (url: string) => {
  const parts = url.split(";");
  if (parts[0] === "inline" && parts[1] != null) {
    return { type: "inline", url: parts[1] };
  }
  return { type: "url", url };
};

const CspIssueView = ({
  url: initialUrl,
  count,
  lastSeen,
  firstSeen,
  firstBody,
}: CspIssue & { url: string }) => {
  const [open, setOpen] = useState(false);
  const { type, url } = splitType(initialUrl);
  return (
    <li
      key={url}
      className="mb-2 border-b border-gray-200 pb-2 last:border-b-0 last:pb-0 last:mb-0"
    >
      <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md">
        <button
          className="flex gap-4 items-center w-full cursor-pointer mr-4"
          onClick={() => setOpen(!open)}
        >
          <span className="text-sm p-1 bg-purple-700 rounded-full size-5 flex items-center justify-center text-white aspect-square">
            {count}
          </span>

          <span className="font-bold line-clamp-1 overflow-ellipsis text-left">
            {url}
          </span>
          <span className="text-sm p-1 px-2 bg-blue-900 rounded-full flex items-center justify-center text-white">
            {type}
          </span>
        </button>
        <div className="text-xs flex-nowrap shrink-0 flex gap-2 text-gray-500 bg-gray-50 p-2 rounded-sm">
          <div>
            First: <TimeAgo ts={firstSeen} />
          </div>

          {lastSeen != null && lastSeen > 0 && (
            <div>
              Last: <TimeAgo ts={lastSeen} />
            </div>
          )}
        </div>
      </div>
      <div className={open ? "" : "hidden"}>
        <JsonView data={firstBody} />
      </div>
    </li>
  );
};

const JsonView = ({ data }: { data: unknown }) => {
  const copy = useClipboard();
  return (
    <pre
      className="bg-black text-white p-4 text-sm overflow-x-hidden rounded-md"
      onClick={() => copy(JSON.stringify(data, null, 2))}
    >
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};

export const CspReport = () => {
  const { data } = useSWR("/tracking/csp-report", () =>
    fetch(
      "https://reporting.tornberg.me/api/v1/stats/slask-finder.tornberg.me"
    ).then((res) => toJson<Record<string, Record<string, CspIssue>>>(res))
  );
  return (
    <div className="max-w-[1920px] mx-auto px-4">
      <div className="flex flex-col gap-4 my-10">
        {Object.entries(data || {}).map(([key, value]) => (
          <Card key={key} className="shadow-lg">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="text-purple-500 mr-2 h-5 w-5" />
                <CardTitle>{key}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul>
                {Object.entries(value).map(([subKey, issue]) => (
                  <CspIssueView key={subKey} url={subKey} {...issue} />
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* <h2 className="text-xl font-bold">Full Report</h2>
      <JsonView data={data} /> */}
    </div>
  );
};
