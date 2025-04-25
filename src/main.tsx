import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router";
import { Admin } from "./pages/Admin.tsx";
import { EditFacetsView } from "./pages/admin/EditFacetsView.tsx";
import { EditSearchView } from "./pages/admin/EditSearchView.tsx";
import { Tracking } from "./pages/Tracking.tsx";
import { SWRConfig } from "swr";
import { getRawData, getTrackingSessions } from "./lib/datalayer/api.ts";
import { getConfirmation } from "./lib/datalayer/cart-api.ts";
import { ProductPage } from "./components/ProductPage.tsx";
import { SessionView } from "./components/Sessions.tsx";
import { QueriesView } from "./pages/tracking/queries.tsx";
import { PopularItemsView } from "./pages/tracking/popular-items.tsx";
import { PopularFacetsView } from "./pages/tracking/popular-facets.tsx";
import { UpdatedItems } from "./pages/tracking/updates.tsx";
import { DashboardView } from "./pages/Dashboard.tsx";
import { PageContainer } from "./PageContainer.tsx";
import { RuleBuilder } from "./pages/admin/RuleBuilder.tsx";
// import { Builder } from "./components/Builder.tsx";
import { QueryProvider } from "./lib/hooks/QueryProvider.tsx";
import { ImpressionProvider } from "./lib/hooks/ImpressionProvider.tsx";
import {
  EditFieldsView,
  MissingFieldsView,
} from "./pages/admin/EditFieldsView.tsx";
import { RelationGroupEditor } from "./pages/admin/RelationGroupEditor.tsx";
import { Checkout } from "./pages/Checkout.tsx";
import { Confirmation } from "./pages/Confirmation.tsx";
import { FunnelsView } from "./pages/tracking/funnels-view.tsx";
import { BuilderMain } from "./pages/builder/BuilderMain.tsx";
import { BuilderStartPage } from "./pages/builder/BuilderStartPage.tsx";
import { BuilderComponentFilter } from "./pages/builder/BuilderComponentFilter.tsx";
import { BuilderOverview } from "./pages/builder/BuilderOverview.tsx";
import { componentRules } from "./pages/builder/rules.ts";
import { BuilderComponentSelector } from "./pages/builder/BuilderComponentSelector.tsx";
import { BuilderKit } from "./pages/builder/BuilderKit.tsx";

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
    element: <BuilderMain />,
    children: [
      {
        index: true,
        element: <BuilderStartPage />,
      },
      {
        path: "component/:id",
        loader: ({ params: { id } }) => Promise.resolve(id),
        element: <BuilderComponentFilter />,
      },
      {
        path: "selection/:id",
        loader: ({ params: { id } }) =>
          Promise.resolve(componentRules.find((d) => d.id === Number(id))),
        element: <BuilderComponentSelector />,
      },
      {
        path: "overview",
        element: <BuilderOverview />,
      },
      {
        path: "kit",
        element: <BuilderKit />,
      },
    ],
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
        path: "rules",
        element: <RuleBuilder />,
      },
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
            return d.find((s) => String(s.id) === id);
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
      {
        path: "funnels",
        element: <FunnelsView />,
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
