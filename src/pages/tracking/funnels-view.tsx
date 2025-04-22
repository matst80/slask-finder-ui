import useSWR from "swr";
import { getFunnelData } from "../../lib/datalayer/api";
import { FunnelChart } from "./funnel-chart"

const byEvents = (a:{value:number}, b:{value:number}) => {
    return (b.value ?? 0) - (a.value ?? 0);
}

const useFunnelData = () => {
  return useSWR("/tracking/funnels", () =>
    getFunnelData().then((res) =>
      res.map(({ steps, ...item }) => ({
        ...item,
        steps: Object.entries(steps).map(([id,{ events,name, ...step }]) => ({
          ...step,
                    label: name,
                    id,
                    value: events.length,
          events,
        })).sort(byEvents),
      }))
    ),{refreshInterval: 5000,revalidateOnFocus: true}
  );
};

export const FunnelsView = () => {
  const { data, isLoading } = useFunnelData();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Conversion Funnels
        </h1>
        <p className="mt-2 text-lg text-gray-600">Track user journeys and optimize conversions</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data?.map((funnel) => {
          // Calculate conversion rate
          const firstStep = funnel.steps[0]?.value || 0;
          const lastStep = funnel.steps[funnel.steps.length - 1]?.value || 0;
          const conversionRate = firstStep > 0 ? (lastStep / firstStep) * 100 : 0;
          
          return (
            <div
              key={funnel.name}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 border-b border-indigo-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">{funnel.name}</h2>
                  <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Conversion:</span>
                    <span className={`ml-2 font-bold ${
                      conversionRate >= 50 ? 'text-emerald-600' : 
                      conversionRate >= 25 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <FunnelChart 
                    data={funnel.steps}
                    height={300}
                    className="w-full"
                  />
                </div>
                
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Funnel Steps</h3>
                  <ul className="space-y-3">
                    {funnel.steps.map((step, index) => {
                      const stepPercentage = firstStep > 0 ? (step.value / firstStep) * 100 : 0;
                      
                      return (
                        <li key={step.id} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-800">{step.label}</span>
                            </div>
                            <span className="text-sm font-medium">{step.value.toLocaleString()} events</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${stepPercentage}%` }}
                            ></div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {(!data || data.length === 0) && (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No funnel data available</h3>
          <p className="mt-2 text-gray-500">Create your first funnel to start tracking conversions.</p>
        </div>
      )}
    </div>
  );
};
