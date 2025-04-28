import useSWR from "swr";
import { toJson } from "../../lib/datalayer/api";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

type CspIssue = {
  firstSeen: number;
  count: number;
  [key: string]: unknown;
};

export const CspReport = () => {
  const { data } = useSWR("/tracking/csp-report", () =>
    fetch(
      "https://reporting.tornberg.me/api/v1/stats/slask-finder.tornberg.me"
    ).then((res) => toJson<Record<string, Record<string, CspIssue>>>(res))
  );
  return (
    <div className="flex flex-wrap gap-4">
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
                <li key={subKey} className="mb-2">
                  <strong>{subKey}</strong>: {issue.count} issues
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
      <h2 className="text-xl font-bold">Full Report</h2>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};
