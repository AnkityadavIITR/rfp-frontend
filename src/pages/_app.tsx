import "~/styles/globals.css";
import ReactGA from "react-ga4";
import Layout from "~/components/Layout";
import { ClerkProvider } from "@clerk/nextjs";

import { GOOGLE_ANALYTICS_ID } from "~/constants";
import { type AppType } from "next/dist/shared/lib/utils";

ReactGA.initialize(GOOGLE_ANALYTICS_ID);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ClerkProvider>
  );
};

export default MyApp;
