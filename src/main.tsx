import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import {
  createBrowserRouter,
  Outlet,
  useLoaderData,
  useRouteError,
} from "react-router";
import { Admin } from "./pages/Admin.tsx";
import { EditFacetsView } from "./pages/admin/EditFacetsView.tsx";
import { SWRConfig } from "swr";
import { getRawData, getTrackingSession } from "./lib/datalayer/api.ts";
import { ProductPage } from "./components/ProductPage.tsx";
import { SessionView } from "./components/Sessions.tsx";
import { QueriesView } from "./pages/tracking/queries.tsx";
import { PopularItemsView } from "./pages/tracking/popular-items.tsx";
import { PopularFacetsView } from "./pages/tracking/popular-facets.tsx";
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
import { Banner } from "./components/Banner.tsx";
import { TrackingProvider } from "./lib/hooks/TrackingContext.tsx";
import { slaskTracker } from "./tracking/slaskTracker.ts";
import { ProductConfigurator } from "./pages/ProductConfigurator.tsx";
import { EmptyQueriesView } from "./pages/tracking/empty-queries.tsx";
import { CompareProvider } from "./lib/hooks/CompareProvider.tsx";
import { GroupDesignerProvider } from "./lib/hooks/GroupDesignerProvider.tsx";
import { SidebarMenu } from "./components/SidebarMenu.tsx";
import { JsonView } from "./pages/tracking/JsonView.tsx";
import { AiShopper } from "./pages/AiShopper.tsx";
import { CookieConsent } from "./CookieConsent.tsx";
import { Words } from "./pages/admin/Words.tsx";
import { OrdersView } from "./pages/admin/OrdersView.tsx";
import { useItemData } from "./hooks/trackingHooks.ts";
import { GiftAssistant } from "./pages/gifts.tsx";
import { Shipping } from "./pages/Shipping.tsx";
import { NaturalLanguageSearch } from "./pages/natural-language-search.tsx";
import { DatasetViewer } from "./pages/admin/DatasetViewer.tsx";
import Register from "./pages/Register.tsx";
import { UsersView } from "./pages/admin/UsersView.tsx";
import PWAInstallPrompt from "./components/PWAInstallPrompt.tsx";
import OfflineIndicator from "./components/OfflineIndicator.tsx";
// Import the functions you need from the SDKs you need

const BubbleError = () => {
  const error = useRouteError();
  return (
    <PageContainer>
      <SidebarMenu />
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <div>
          <h1 className="text-xl font-bold my-6">Något gick snett...</h1>
          <JsonView data={error} />
        </div>
      </div>
    </PageContainer>
  );
};

const BannerLoader = () => {
  const id = useLoaderData();
  const { data } = useItemData(id);
  if (data == null) {
    return null;
  }
  return <Banner item={data} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageContainer>
        <QueryProvider attachToHash>
          <App />
        </QueryProvider>
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "/register",
    element: (
      <PageContainer>
        <Register />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "/natural",
    element: (
      <PageContainer>
        <NaturalLanguageSearch />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "/gifts",
    element: (
      <PageContainer>
        <GiftAssistant />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "/shipping",
    element: (
      <PageContainer>
        <Shipping />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "banner/:id",
    loader: ({ params }) => {
      return Promise.resolve(params.id);
    },

    element: (
      <PageContainer>
        <BannerLoader />
      </PageContainer>
    ),

    errorElement: <BubbleError />,
  },
  {
    path: "ai",
    element: (
      <PageContainer>
        <AiShopper />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "config",
    element: (
      <PageContainer>
        <ProductConfigurator />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "dashboard",
    element: (
      <PageContainer>
        <DashboardView />
      </PageContainer>
    ),
    errorElement: <BubbleError />,
  },
  {
    path: "builder",
    element: <BuilderMain />,
    errorElement: <BubbleError />,
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
    errorElement: <BubbleError />,
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
        path: "words",
        element: <Words />,
      },
      {
        path: "relations",
        element: <RelationGroupEditor />,
      },
      {
        path: "dataset",
        element: <DatasetViewer />,
      },
      {
        path: "orders",
        element: <OrdersView />,
      },
      {
        path: "csp",
        element: <CspReport />,
      },
      {
        path: "users",
        element: <UsersView />,
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
    errorElement: <BubbleError />,
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
        loader: ({ params: { id } }) => {
          return id != null ? getTrackingSession(id) : Promise.reject();
        },
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
    errorElement: <BubbleError />,
  },
  // {
  //   path: "checkout",
  //   element: (
  //     <PageContainer>
  //       <Checkout />
  //       <ScrollToTop />
  //     </PageContainer>
  //   ),
  //   errorElement: <BubbleError />,
  // },
  // {
  //   path: "confirmation/:id",

  //   loader: ({ params: { id } }) =>
  //     id != null ? getConfirmation(id) : Promise.reject(),
  //   errorElement: <BubbleError />,
  //   element: (
  //     <PageContainer>
  //       <Confirmation />
  //     </PageContainer>
  //   ),
  // },
  // {
  //   path: "updated",
  //   errorElement: <BubbleError />,
  //   element: (
  //     <PageContainer>
  //       <UpdatedItems />
  //     </PageContainer>
  //   ),
  // },
]);

const getBrowserTranslations = () => {
  const lang = getLocale();
  if (lang.startsWith("sv")) return swedish;
  return english;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{ keepPreviousData: true }}>
      <TrackingProvider handlers={[slaskTracker()]}>
        <GroupDesignerProvider>
          <CompareProvider compareAllFacets={true}>
            <TranslationProvider language={getBrowserTranslations()}>
              <NotificationsProvider>
                <ImpressionProvider>
                  <RouterProvider router={router} />
                  <OfflineIndicator />
                  <PWAInstallPrompt />
                  <CookieConsent />
                </ImpressionProvider>
              </NotificationsProvider>
            </TranslationProvider>
          </CompareProvider>
        </GroupDesignerProvider>
      </TrackingProvider>
    </SWRConfig>
  </React.StrictMode>
);
