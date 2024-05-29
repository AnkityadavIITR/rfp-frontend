import "~/styles/globals.css";
import ReactGA from "react-ga4";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { GOOGLE_ANALYTICS_ID } from "~/constants";
import Layout from "~/components/Layout";
import { type AppType } from "next/dist/shared/lib/utils";
// import { PdfFocusProvider } from "~/context/pdf";

ReactGA.initialize(GOOGLE_ANALYTICS_ID);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      {/* <PdfFocusProvider> */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
      {/* </PdfFocusProvider> */}
    </ClerkProvider>
  );
};

export default MyApp;
