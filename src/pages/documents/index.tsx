import React, { useEffect, useState, memo } from "react";
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
import { useQuestionStore, clearData } from "~/utils/store/questionStore";
import { v4 as uuid } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { chunk } from "lodash";

interface PdfViewerProps {
  pdfData: any[];
}

export default function Conversation() {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses)
  const addResponse = useQuestionStore((state) => state.addResponse)
  const fileUrls = useQuestionStore((state) => state.fileUrls)
  const addFileUrls = useQuestionStore((state) => state.addFileUrl);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const setActiveQuery = useQuestionStore((state) => state.setActiveQuery);
  const addApiResponse = useQuestionStore((state) => state.addApiResponse);
  const apiResponse = useQuestionStore((state) => state.apiResponse);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        await Promise.all(
          queries.map(async (question, index) => {
            const res = await backendClient.fetchQuery("/processquery/", question);
            const responseData = await res.json();
            console.log("res", responseData);

            console.log("message", responseData.message);
            const response = formatMarkdown(responseData.message)
            addResponse(response);
            console.log("reponse chunks",responseData.Chunks);
            console.log("respose fiels",responseData.pdfNames);
            
            
            addApiResponse({
              reponseMessage:response,
              chunks:responseData.Chunks,
              files: responseData.pdfNames.map((pdfName: string, index: number) => ({
                id: uuid(),
                filename: pdfName,
                url: responseData.fileUrls[index],
              })),
            })

            // responseData.pdfNames.forEach((pdfName: string, index: number) => {
            //   const existingFile = fileUrls.find(file => file.filename === pdfName);
            //   if (!existingFile) {
            //     addFileUrls({
            //       id: uuid(),
            //       filename: pdfName,
            //       url: responseData.fileUrls[index]
            //     });
            //   }
            // });
            setLoading(false);
          }))
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    };

    if (queries.length > responses.length) {
      fetchData();
    }
  }, []);
  // console.log("fileUrls",fileUrls);
  console.log("apiresponse",apiResponse);
  
  useEffect(()=>{
    if(apiResponse[0] && apiResponse.length>0){
      setLoading(false)
    }
  },[])
 

  const formatMarkdown = (message: string): string => {
    const lines: string[] = message.split('\n');
    let formattedMessage: string = '';

    let currentHeadingLevel: number = 2;
    let currentNumber: number | null = null;
    let currentSubheadingLetter: string = 'a';

    lines.forEach((line: string, index: number) => {
      const numberMatch = line.match(/^\d+\./);
      if (numberMatch && numberMatch[0]) {
        const number: string | undefined = numberMatch[0].match(/^\d+/)?.[0];
        if (number) {
          const newNumber = parseInt(number, 10);
          if (currentNumber === null || newNumber !== currentNumber) {
            currentNumber = newNumber;
            formattedMessage += `### ${currentNumber}. ${line.slice(line.indexOf('.') + 1).trim()}\n\n`;
            currentSubheadingLetter = 'a';
          } else {
            formattedMessage += `   ${currentSubheadingLetter}. ${line.slice(line.indexOf('.') + 1).trim()}\n`;
            currentSubheadingLetter = String.fromCharCode(currentSubheadingLetter.charCodeAt(0) + 1);
          }
        }
      } else if (line.startsWith('- **')) {
        formattedMessage += `      - ${line.slice(4).trim()}\n`;
      } else if (line.startsWith('   - ')) {
        formattedMessage += `         - ${line.slice(5).trim()}\n`;
      } else if (line.trim() !== '') {
        formattedMessage += `${line.trim()}\n\n`;
        currentHeadingLevel = 2;
      }
    });

    return formattedMessage;
  };

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
      <PdfFocusProvider>
        <div className="flex h-[100vh] w-full items-center">
          <div className="flex h-[100vh] w-[44vw] flex-col items-center border-r-2 bg-white">
            <div className="flex h-[44px] w-full items-center justify-between border-b-2 ">
              <div className="flex w-full items-center justify-between">
                <button
                  onClick={() => {
                    clearData();
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
              <div className="mx-auto  w-[100%] flex flex-col text-left">
                {
                  <Accordion type="single" collapsible className="flex flex-col" defaultValue={`item-0`}>
                  {queries.map((query, i) => (
                    <AccordionItem value={`item-${i}`} className="bg-gray-200 text-left" key={i}>
                      <AccordionTrigger className="text-left p-[10px]" onClick={() => setActiveQuery(i)}>
                        {query}
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-[10px] mb-0 text-gray-700">
                        {responses[i] ? (<>
                          <ReactMarkdown className="leading-1">{responses[i]}</ReactMarkdown>
                          <div className="flex gap-x-2 overflow-x-auto mt-1">
                            {
                              apiResponse[activeQuery]?.chunks.map((chunk)=>{
                                return <div className="max-w-[200px] line-clamp-2 hover:cursor-pointer border p-1 rounded-md bg-gray-200 hover:bg-slate-200 text-gray-700 text-[12px]">
                                  <p className="border-l-4 border-yellow-400 pl-1">{chunk}</p>
                                </div>
                              })
                            }
                          </div>
                        </>
                        ) : (
                          <>
                            <div className="loader h-4 w-4 rounded-full border-2 border-gray-200 ease-linear"></div>
                            <p className="mr-1">processing</p>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                }
              </div>

            </div>
          </div>
          <div className="h-[100vh] w-full">
            {
              loading ? <div className="w-full h-full flex justify-center items-center "><h1>loading...</h1></div> : <DisplayMultiplePdfs fileUrls={apiResponse[activeQuery]?.files || []} />
            }

          </div>
        </div>
      </PdfFocusProvider>


    </>
  );
}
