import { type AppType } from "next/dist/shared/lib/utils";
import Layout from "~/components/Layout";
import "~/styles/globals.css";
import ReactGA from "react-ga4";
import { GOOGLE_ANALYTICS_ID} from "~/constants";
import React from "react";
// import { PdfFocusProvider } from "~/context/pdf";
ReactGA.initialize(GOOGLE_ANALYTICS_ID);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
    {/* <PdfFocusProvider> */}
        <Layout>
          <Component {...pageProps} />
        </Layout>

    {/* </PdfFocusProvider> */}

    </>
  );
};

export default MyApp;
