import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Admin } from "./pages/Admin.tsx";
import { EditFacetsView } from "./pages/admin/EditFacetsView.tsx";
import { EditSearchView } from "./pages/admin/EditSearchView.tsx";
import { Tracking } from "./pages/Tracking.tsx";
import { SWRConfig } from "swr";
import {
  getConfirmation,
  getRawData,
  getTrackingSessions,
} from "./lib/datalayer/api.ts";
import { ProductPage } from "./components/ProductPage.tsx";
import { SessionView } from "./components/Sessions.tsx";
import { QueriesView } from "./pages/tracking/queries.tsx";
import { PopularItemsView } from "./pages/tracking/popular-items.tsx";
import { PopularFacetsView } from "./pages/tracking/popular-facets.tsx";
import { UpdatedItems } from "./pages/tracking/updates.tsx";
import { DashboardView } from "./pages/Dashboard.tsx";
import { PageContainer } from "./PageContainer.tsx";
import { RuleBuilder } from "./pages/admin/RuleBuilder.tsx";
import { Builder } from "./components/Builder.tsx";
import { QueryProvider } from "./lib/hooks/QueryProvider.tsx";
import { ImpressionProvider } from "./lib/hooks/ImpressionProvider.tsx";
import {
  EditFieldsView,
  MissingFieldsView,
} from "./pages/admin/EditFieldsView.tsx";
import { RelationGroupEditor } from "./pages/admin/RelationGroupEditor.tsx";
import { Checkout } from "./pages/Checkout.tsx";
import { Confirmation } from "./pages/Confirmation.tsx";

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
        <DashboardView />
      </PageContainer>
    ),
  },
  {
    path: "builder",
    element: (
      <PageContainer>
        <Builder />
      </PageContainer>
    ),
  },
  {
    path: "rules",
    element: (
      <PageContainer>
        <RuleBuilder />
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
        loader: ({ params: { id } }) =>
          id != null ? getRawData(id) : Promise.resolve(null),
        element: <ProductPage />,
      },
      {
        path: "facets",
        element: <EditFacetsView />,
      },
      {
        path: "fields",
        element: <EditFieldsView />,
      },
      {
        path: "missing-fields",
        element: <MissingFieldsView />,
      },
      {
        path: "relations",
        element: <RelationGroupEditor />,
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
  {
    path: "checkout",
    element: (
      <PageContainer>
        <Checkout />
      </PageContainer>
    ),
  },
  {
    path: "confirmation/:id",

    loader: ({ params: { id } }) =>
      id != null ? getConfirmation(id) : Promise.reject(),
    errorElement: <div>Confirmation not found</div>,
    element: (
      <PageContainer>
        <Confirmation />
      </PageContainer>
    ),
  },
  {
    path: "updated",
    element: (
      <PageContainer>
        <UpdatedItems />
      </PageContainer>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ImpressionProvider>
        <SWRConfig value={{}}>
          <RouterProvider router={router} />
        </SWRConfig>
      </ImpressionProvider>
    </QueryProvider>
  </React.StrictMode>
);
