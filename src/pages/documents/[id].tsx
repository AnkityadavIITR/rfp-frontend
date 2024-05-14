import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { PdfFocusProvider } from "~/context/pdf";

import type { ChangeEvent } from "react";
import DisplayMultiplePdfs from "~/components/pdf-viewer/DisplayMultiplePdfs";
import useMessages from "~/hooks/useMessages";
import { backendClient } from "~/api/backend";
import { RenderConversations as RenderConversations } from "~/components/conversations/RenderConversations";
import { BiArrowBack } from "react-icons/bi";
import { SecDocument } from "~/types/document";
import { useModal } from "~/hooks/utils/useModal";
import { useIntercom } from "react-use-intercom";
import useIsMobile from "~/hooks/utils/useIsMobile";

export default function Conversation() {
  const router = useRouter();
  const { id } = router.query;

  const { shutdown } = useIntercom();
  useEffect(() => {
    shutdown();
  }, []);

  const { isOpen: isShareModalOpen, toggleModal: toggleShareModal } =
    useModal();

  const { isMobile } = useIsMobile();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMessagePending, setIsMessagePending] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<SecDocument[]>([]);
  const { messages, userSendMessage, systemSendMessage, setMessages } =
    useMessages(conversationId || "");

  const textFocusRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // router can have multiple query params which would then return string[]
    if (id && typeof id === "string") {
      setConversationId(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchConversation = async (id: string) => {
      const result = await backendClient.fetchConversation(id);
      if (result.messages) {
        setMessages(result.messages);
      }
      if (result.documents) {
        setSelectedDocuments(result.documents);
      }
    };
    if (conversationId) {
      fetchConversation(conversationId).catch(() =>
        console.error("Conversation Load Error")
      );
    }
  }, [conversationId, setMessages]);

const pdfData=[
  {
    ticker:"sacadc",
    fullName:"ankit",
    id:"kcsdc",
    url:"https://d687lz8k56fia.cloudfront.net/sec-edgar-filings/0000320193/10-K/0000320193-23-000106/primary-document.pdf",
    year:"2012",
  },  
  {
    ticker:"dscnjsbdv",
    fullName:"ankit-2",
    id:"sdcuydvdv",
    url:"https://d687lz8k56fia.cloudfront.net/sec-edgar-filings/0000200406/10-Q/0000200406-23-000082/filing-details.pdf",
    year:"2012",
  },  
]

  const setSuggestedMessage = (text: string) => {
    setUserMessage(text);
    if (textFocusRef.current) {
      textFocusRef.current.focus();
    }
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
            className="m-4 rounded border bg-llama-indigo px-8 py-2 font-bold text-white hover:bg-[#3B3775]"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
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
                className="ml-4 flex items-center justify-center rounded px-2 font-light text-[#9EA2B0] hover:text-gray-90"
              >
                <BiArrowBack className="mr-1" /> Back to Document Selection
              </button>

            </div>
          </div>
          <div className="flex max-h-[calc(100vh-114px)] w-[44vw] flex-grow flex-col overflow-scroll ">
            <RenderConversations
              messages={messages}
              documents={selectedDocuments}
              setUserMessage={setSuggestedMessage}
            />
          </div>
        </div>
        <div className="h-[100vh] w-max">
          <DisplayMultiplePdfs pdfs={pdfData} />
        </div>
      </div>
    </PdfFocusProvider>
  );
}
