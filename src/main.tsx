import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Admin, EditFacetsView, EditSearchView } from "./pages/Admin.tsx";
import { Tracking } from "./pages/Tracking.tsx";
import { Navbar } from "./components/NavBar.tsx";
import { SWRConfig } from "swr";
import { getRawData, getTrackingSessions } from "./api.ts";
import { ProductPage } from "./components/ProductPage.tsx";
import { SessionView } from "./components/Sessions.tsx";
import { QueriesView } from "./pages/tracking/queries.tsx";
import { PopularItemsView } from "./pages/tracking/popular-items.tsx";
import { PopularFacetsView } from "./pages/tracking/popular-facets.tsx";

const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageContainer>
        <App />
      </PageContainer>
    ),
  },
  {
    path: "dashboard",
    element: (
      <PageContainer>
        <div></div>
      </PageContainer>
    ),
  },
  {
    path: "edit",
    element: (
      <PageContainer>
        <Admin />
      </PageContainer>
    ),
    children: [
      {
        index: true,
        element: <EditSearchView />,
      },
      { path: "bulk", element: <EditSearchView /> },
      {
        path: "product/:id",
        element: <ProductPage />,
      },
      {
        path: "facets",
        element: <EditFacetsView />,
      },
    ],
  },
  {
    path: "product/:id",
    loader: ({ params: { id } }) =>
      id != null ? getRawData(id) : Promise.resolve(null),
    element: (
      <PageContainer>
        <ProductPage />
      </PageContainer>
    ),
  },
  {
    path: "stats",
    element: (
      <PageContainer>
        <Tracking />
      </PageContainer>
    ),
    children: [
      {
        path: "session/:id",
        loader: ({ params: { id } }) =>
          getTrackingSessions().then((d) => {
            console.log(d, id);
            return d.find((s) => String(s.session_id) === id);
          }),
        errorElement: <div>Session not found</div>,
        element: <SessionView />,
      },
      {
        path: "queries",
        element: <QueriesView />,
      },
      {
        path: "popular",
        element: <PopularItemsView />,
      },
      {
        path: "facets",
        element: <PopularFacetsView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{}}>
      <RouterProvider router={router} />
    </SWRConfig>
  </React.StrictMode>
);
