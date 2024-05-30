// "use client"
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
import { v4 as uuid } from "uuid";
import ReactMarkdown from "react-markdown";
import { usePdfFocus } from "~/context/pdf";
import { Citation } from "~/types/conversation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

interface PdfViewerProps {
  pdfData: any[];
}

export default function Conversation() {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [loading, setLoading] = useState(true);

  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses);
  const addResponse = useQuestionStore((state) => state.addResponse);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const setActiveQuery = useQuestionStore((state) => state.setActiveQuery);
  const addApiResponse = useQuestionStore((state) => state.addApiResponse);
  const apiResponse = useQuestionStore((state) => state.apiResponse);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all(
          queries.map(async (question, index) => {
            const res = await backendClient.fetchQuery(
              "/processquery/",
              question
            );
            const responseData = await res.json();
            console.log("res", responseData);
            //format the response before saving
            const response = formatMarkdown(responseData.message);
            addResponse(response);
            //save the response
            addApiResponse({
              reponseMessage: response,
              chunks: responseData.Chunks,
              files: responseData.pdfNames.map(
                (pdfName: string, index: number) => ({
                  id: pdfName,
                  filename: pdfName,
                  url: responseData.fileUrls[index],
                })
              ),
            });
            setLoading(false);
          })
        );
      } catch (e) {
        console.error(e);
      }
    };

    if (queries.length > responses.length) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (apiResponse[0] && apiResponse.length > 0) {
      setLoading(false);
    }
  }, []);

  const formatMarkdown = (message: string): string => {
    const lines: string[] = message.split("\n");
    let formattedMessage: string = "";

    let currentHeadingLevel: number = 2;
    let currentNumber: number | null = null;
    let currentSubheadingLetter: string = "a";

    lines.forEach((line: string, index: number) => {
      const numberMatch = line.match(/^\d+\./);
      if (numberMatch && numberMatch[0]) {
        const number: string | undefined = numberMatch[0].match(/^\d+/)?.[0];
        if (number) {
          const newNumber = parseInt(number, 10);
          if (currentNumber === null || newNumber !== currentNumber) {
            currentNumber = newNumber;
            formattedMessage += `### ${currentNumber}. ${line
              .slice(line.indexOf(".") + 1)
              .trim()}\n\n`;
            currentSubheadingLetter = "a";
          } else {
            formattedMessage += `   ${currentSubheadingLetter}. ${line
              .slice(line.indexOf(".") + 1)
              .trim()}\n`;
            currentSubheadingLetter = String.fromCharCode(
              currentSubheadingLetter.charCodeAt(0) + 1
            );
          }
        }
      } else if (line.startsWith("- **")) {
        formattedMessage += `      - ${line.slice(4).trim()}\n`;
      } else if (line.startsWith("   - ")) {
        formattedMessage += `         - ${line.slice(5).trim()}\n`;
      } else if (line.trim() !== "") {
        formattedMessage += `${line.trim()}\n\n`;
        currentHeadingLevel = 2;
      }
    });

    return formattedMessage;
  };

  const ChunkDisplay = () => {
    const { setPdfFocusState } = usePdfFocus();

    const handleCitationClick = (
      documentId: string,
      pageNumber: number,
      citation: Citation
    ) => {
      console.log("documentid", documentId);
      console.log("pgn", pageNumber);
      console.log("cita", citation);
      setPdfFocusState({ documentId, pageNumber, citation });
    };

    return (
      <div className="mt-1 flex gap-x-2 overflow-scroll">
        {apiResponse[activeQuery] &&
          apiResponse[activeQuery]?.chunks.map((d, i) => {
            return (
              <div
                onClick={() =>
                  handleCitationClick(
                    d.pdfName || "",
                    d.pageno,
                    {
                      documentId:
                        d.pdfName || "",
                      snippet: d.chunk || "",
                      pageNumber: d.pageno,
                      highlightColor: "yellow",
                    } as Citation
                  )
                }
                className="line-clamp-2 max-w-[200px] rounded-md border bg-gray-200 p-1 text-[12px] text-gray-700 hover:cursor-pointer hover:bg-slate-200"
              >
                <p className="border-l-4 border-yellow-400 pl-1">{d.chunk}</p>
              </div>
            );
          })}
      </div>
    );
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

  const [isEditing, setIsEditing] = useState(false);
  const [editableResponse, setEditableResponse] = useState("");
  const handleSaveResponse = async() => {
    if(queries[activeQuery] && editableResponse!=""){
      try{
        const res=await backendClient.saveQna("/save-qna/",queries[activeQuery] || "",editableResponse);
        console.log("Res",res);
        setIsEditing(false)
      }catch(e){
        console.log("error saving response", e)
      }
    }
  };
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
              <div className="mx-auto  flex w-[100%] flex-col text-left">
                {
                  <Accordion
                    type="single"
                    collapsible
                    className="flex flex-col gap-y-1"
                    defaultValue={`item-0`}
                  >
                    {queries.map((query, i) => (
                      <AccordionItem
                        value={`item-${i}`}
                        className="bg-gray-200 text-left"
                        key={i}
                      >
                        <AccordionTrigger
                          className="p-[10px] text-left"
                          onClick={() => setActiveQuery(i)}
                        >
                          {query}
                        </AccordionTrigger>
                        <AccordionContent className="mb-0 bg-white p-[10px] text-gray-700">
                          {responses[i] ? (
                            <>
                              {!isEditing ? (
                                <>
                                  <ReactMarkdown className="leading-1">
                                    {responses[i]}
                                  </ReactMarkdown>
                                  <div className="mt-2 flex w-full">
                                    <Button
                                      className="self-end"
                                      onClick={() => {
                                        setIsEditing(true);
                                        setEditableResponse(responses[i] || "");
                                      }}
                                    >
                                      Edit response
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                <div className="w-full">
                                  <Textarea
                                    value={editableResponse}
                                    onChange={(e) =>
                                      setEditableResponse(e.target.value)
                                    }
                                    className="h-32 w-full rounded border p-2"
                                  />
                                </div>
                                  <div className="mt-2 flex w-full">
                                    <Button
                                      className="self-end"
                                      onClick={() => {
                                        handleSaveResponse();
                                      }}
                                    >
                                      Edit response
                                    </Button>
                                  </div>
                                </>
                              )}
                              <ChunkDisplay />
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
            {loading ? (
              <div className="flex h-full w-full items-center justify-center ">
                <h1>loading...</h1>
              </div>
            ) : (
              <DisplayMultiplePdfs
                fileUrls={apiResponse[activeQuery]?.files || []}
              />
            )}
          </div>
        </div>
      </PdfFocusProvider>
    </>
  );
}
