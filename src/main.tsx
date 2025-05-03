import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter, Outlet } from "react-router";
import { Admin } from "./pages/Admin.tsx";
import { EditFacetsView } from "./pages/admin/EditFacetsView.tsx";
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
import { BuilderProductPage } from "./pages/builder/BuilderProductPage.tsx";
import { NotificationsProvider } from "./components/ui-notifications/notifications-provider.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { TranslationProvider } from "./lib/hooks/TranslationProvider.tsx";
import { english } from "./translations/english.ts";
import { swedish } from "./translations/swedish.ts";
import { FacetGroups } from "./pages/admin/FacetGroups.tsx";
import { getLocale } from "./utils.ts";
import { CspReport } from "./pages/tracking/csp-report.tsx";
import { SessionList } from "./components/SessionList.tsx";
import { Banner } from "./components/SearchResultList.tsx";
import { TrackingProvider } from "./lib/hooks/TrackingContext.tsx";
import { googleTracker } from "./tracking/google-tracking.ts";
import { slaskTracker } from "./tracking/slaskTracker.ts";
import { ProductConfigurator } from "./pages/ProductConfigurator.tsx";
import { EmptyQueriesView } from "./pages/tracking/empty-queries.tsx";

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
    path: "test",
    element: (
      <PageContainer>
        <Banner />
      </PageContainer>
    ),
  },
  {
    path: "config",
    element: (
      <PageContainer>
        <ProductConfigurator />
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
        path: "product/:componentId/:id",
        loader: ({ params: { id, componentId } }) =>
          id != null
            ? getRawData(id).then((d) => ({
                ...d,
                componentId: componentId,
              }))
            : Promise.resolve(null),
        element: (
          <>
            <BuilderProductPage />
            <ScrollToTop />
          </>
        ),
      },
      {
        path: "selection/:id",
        loader: ({ params: { id } }) =>
          Promise.resolve(componentRules.find((d) => d.id === id)),
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
        path: "rules",
        element: <RuleBuilder />,
      },
      {
        path: "facet_groups",
        element: <FacetGroups />,
      },
      {
        path: "facets",
        index: true,
        element: <EditFacetsView />,
      },
      {
        path: "fields",
        element: <EditFieldsView />,
      },
      {
        path: "missing_fields",
        element: <MissingFieldsView />,
      },
      {
        path: "relations",
        element: <RelationGroupEditor />,
      },
      {
        path: "csp",
        element: <CspReport />,
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
        <ScrollToTop />
      </PageContainer>
    ),
  },
  {
    path: "stats",
    element: (
      <PageContainer>
        <Outlet />
      </PageContainer>
    ),
    children: [
      { path: "sessions", element: <SessionList /> },
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
        path: "empty",
        element: <EmptyQueriesView />,
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
        <ScrollToTop />
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

const getBrowserTranslations = () => {
  const lang = getLocale();
  if (lang.startsWith("sv")) return swedish;
  return english;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{ keepPreviousData: true }}>
      <TrackingProvider
        handlers={[
          googleTracker({ list_id: "main", list_name: "search" }),
          slaskTracker(),
        ]}
      >
        <TranslationProvider language={getBrowserTranslations()}>
          <QueryProvider initialQuery={{ page: 0, pageSize: 20 }}>
            <NotificationsProvider>
              <ImpressionProvider>
                <RouterProvider router={router} />
              </ImpressionProvider>
            </NotificationsProvider>
          </QueryProvider>
        </TranslationProvider>
      </TrackingProvider>
    </SWRConfig>
  </React.StrictMode>
);
