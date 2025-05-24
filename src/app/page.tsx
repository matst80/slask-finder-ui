import { QueryProvider } from "../lib/hooks/QueryProvider";
import App from "../page-components/App"; // Adjust path to your existing App component

export default function HomePage() {
  return (
    <QueryProvider attachToHash>
      <App />
    </QueryProvider>
  );
}
