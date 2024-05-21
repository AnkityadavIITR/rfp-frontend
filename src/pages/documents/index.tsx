import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PdfFocusProvider } from "~/context/pdf";
import { DocumentColorEnum } from "~/utils/colors";

import DisplayMultiplePdfs from "~/components/pdf-viewer/DisplayMultiplePdfs";
import { BiArrowBack } from "react-icons/bi";
import useIsMobile from "~/hooks/utils/useIsMobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { useFileStore } from "~/utils/store/fileStore";
import { backendClient } from "~/api/backend";

export default function Conversation() {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [loading, setLoading] = useState(true);
  const selectedFiles = useFileStore((state) => state.selectedFiles);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await backendClient.postExcelFile(
          "uploadexcel/",
          selectedFiles
        );
        console.log(res);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (selectedFiles.length === 0) {
      router.push("/").catch((error) => {
        console.error(error);
      });
    } else {
      fetchData().catch((error) => {
        console.error(error);
      });
    }
  }, [selectedFiles]);

  const pdfData = [
    {
      ticker: "sacadc",
      fullName: "ankit",
      id: "kcsdc",
      url: "https://d687lz8k56fia.cloudfront.net/sec-edgar-filings/0000320193/10-K/0000320193-23-000106/primary-document.pdf",
      year: "2012",
      quarter: "2",
      color: DocumentColorEnum.purple,
    },
    {
      ticker: "dscnjsbdv",
      fullName: "ankit-2",
      id: "sdcuydvdv",
      url: "https://d687lz8k56fia.cloudfront.net/sec-edgar-filings/0000200406/10-Q/0000200406-23-000082/filing-details.pdf",
      year: "2012",
      quarter: "2",
      color: DocumentColorEnum.purple,
    },
  ];

  if (isMobile) {
    return (
      <div className="landing-page-gradient-1 relative flex h-screen w-screen items-center justify-center">
        <div className="flex h-min w-3/4 flex-col items-center justify-center rounded border bg-white p-4">
          <div className="text-center text-xl ">
            Sorry, the mobile view of this page is currently a work in progress.
            Please switch to desktop!
          </div>
          <button
            onClick={() => {
              router
                .push(`/`)
                .catch(() => console.log("error navigating to conversation"));
            }}
            className="bg-llama-indigo m-4 rounded border px-8 py-2 font-bold text-white hover:bg-[#3B3775]"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loading ? (
        <PdfFocusProvider>
          <div className="flex h-[100vh] w-full items-center">
            <div className="flex h-[100vh] w-[44vw] flex-col items-center border-r-2 bg-white">
              <div className="flex h-[44px] w-full items-center justify-between border-b-2 ">
                <div className="flex w-full items-center justify-between">
                  <button
                    onClick={() => {
                      router
                        .push("/")
                        .catch(() => console.error("error navigating home"));
                    }}
                    className="ml-4 flex items-center justify-center rounded px-2 font-light text-[#9EA2B0] hover:text-gray-900"
                  >
                    <BiArrowBack className="mr-1" /> Back to Document Selection
                  </button>
                </div>
              </div>
              <div className="flex h-full w-[44vw] flex-grow flex-col overflow-scroll ">
                <div className="mx-auto mt-5 w-[80%]">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex flex-col gap-5"
                  >
                    <AccordionItem
                      value="item-1"
                      className="rounded-md border p-2"
                    >
                      <AccordionTrigger>Is it accessible?</AccordionTrigger>
                      <AccordionContent>
                        Yes. It adheres to the WAI-ARIA design pattern.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem
                      value="item-2"
                      className="rounded-md border p-2"
                    >
                      <AccordionTrigger>Is it accessible?</AccordionTrigger>
                      <AccordionContent>
                        Yes. It adheres to the WAI-ARIA design pattern.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
            <div className="h-[100vh] w-max">
              <DisplayMultiplePdfs pdfs={pdfData} />
            </div>
          </div>
        </PdfFocusProvider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
