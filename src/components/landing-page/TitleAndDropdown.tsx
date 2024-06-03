"use client";
import { useRouter } from "next/router";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Trash2, BadgeCheck, Send } from "lucide-react";
import { useFileStore } from "~/utils/store/fileStore";
import { backendClient } from "~/api/backend";
import { useQuestionStore } from "~/utils/store/questionStore";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Container from "../ui/container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { useAuth } from "@clerk/nextjs";
import Auth from "./auth";
import ExcelInput from "./ExcelInput";
import Image from "next/image";

export const TitleAndDropdown = () => {
  const router = useRouter();
  const { userId } = useAuth();

  const files = useFileStore((state) => state.files);
  const addFiles = useFileStore((state) => state.addFiles);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const queries = useQuestionStore((state) => state.queries);
  const addQuestions = useQuestionStore((state) => state.addQueries);
  const removeQuery = useQuestionStore((state) => state.removeQuery);


  const [loading, setLoading] = useState<boolean>(false);
  const [isPdfUploaded, setIsPdfUploaded] = useState<boolean>(false);
  const [value, setValue] = useState<string>("Qna");
  const [inputQuestion, setInputQuestion] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");

  const onDropPdf = useCallback(
    (acceptedFiles: File[]) => {
      const pdfs = acceptedFiles.filter((file) => {
        const fileNameParts = file.name.split(".");
        const fileExtension = fileNameParts[fileNameParts.length - 1];
        return fileExtension === "pdf";
      });

      if (pdfs.length > 0) {
        addFiles(pdfs);
        console.log("files", files);
      } else {
        alert("Please select only Excel or CSV files.");
      }
    },
    [addFiles]
  );

  const {
    getRootProps: getRootPropsPdf,
    getInputProps: getInputPropsPdf,
    isDragActive: isDragActivePdf,
  } = useDropzone({
    onDrop: onDropPdf,
    maxFiles: 10,
    accept: {
      "application/pdf": [".pdf"],
    },
  });


  const handlePdfSubmit = async ()=> {
    if (files.length > 0 && !isPdfUploaded) {
      try {
        setLoading(true);
        const pdfResponse = await backendClient.postPdfFile(
          "/upload-files/",
          files
        );
        
        console.log("PDF response:", pdfResponse);
        setIsPdfUploaded(true);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("click");
      setValue("excel");
    }
  };

  const handleSubmit =() => {
    if (!inputQuestion) {
      setInputQuestion(true);
    } else {
      if (!userId) {
        document.getElementById("auth")?.click();
      } else router.push("/documents");
    }
  };

  const className = () => {
    if (inputQuestion) {
      return queries.length > 0
        ? "min-w-[80px] text-[14px]"
        : "bg-gray-400 text-[14px] hover:bg-gray-400";
    } else {
      return "min-w-[80px] text-[14px]";
    }
  };
  return (
    <div className="landing-page-gradient-1 font-lora relative flex h-max w-screen flex-col items-center ">
      <Auth />
      <div className="absolute left-8 top-8 w-[180px]">
        <Image src="/speex.png" alt="Logo" width={180} height={20} />
      </div>

      <Container>
        <div className="mt-[72px] flex flex-col items-center">
          <h1 className="text-center text-4xl font-medium">
            Solution Consultant App
          </h1>
        </div>
      </Container>
      <Container className="mt-4">
        <div className="mx-auto flex w-[80%] gap-x-4">
          <Avatar className="mx-auto">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
              className=""
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-center text-[22px]">
            Hello! I'm Pedro, your assistant for cybersecurity, GDPR, and more.
            How can I help you today?
          </div>
        </div>
      </Container>
      <Tabs
        value={value}
        onValueChange={setValue}
        className="mx-auto mt-5 w-[400px]"
      >
        <TabsList className="w-full">
          <TabsTrigger
            value="Qna"
            className={value == "Qna" ? "w-1/2 bg-slate-800 shadow-md" : "w-1/2"}
          >
            Q & A
          </TabsTrigger>
          <TabsTrigger value="excel" className="w-1/2">
            Queries
          </TabsTrigger>
          {userId && userId === process.env.NEXT_PUBLIC_ADMIN_CLERK_USERID && (
            <TabsTrigger value="pdf" className="w-1/2">
              Docs
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="Qna">
          <div className="mt-5 flex min-h-[320px] w-full flex-col items-center justify-center rounded-[16px] border-2 bg-white shadow-xl ">
            <div className="mx-4 mb-2 mt-4 self-start">
              <h1 className="text-center text-[18px] font-medium">
                In Q&apos;A, you can ask me questions, and I'll do my best to provide
                helpful answers.
              </h1>
            </div>
            <div className="mt-2 flex  w-full flex-col justify-start gap-y-6 p-4 ">
              {inputQuestion && (
                <div className="flex gap-x-2">
                  <Input
                    type="text"
                    placeholder="ask question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      addQuestions([question]);
                      setQuestion("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
              {inputQuestion && queries.length > 0 && (
                <div className="mx-auto flex flex-col gap-y-2">
                  {queries.map((query, index) => {
                    return (
                      <div key={index} className="flex gap-x-3">
                        <p className="text-[14px] font-medium">{index + 1}</p>
                        <p className="line-clamp-2 w-[280px] text-[14px] font-medium">
                          {query}
                        </p>
                        <div className="flex">
                          <Trash2
                            onClick={() => removeQuery(index)}
                            className="my-auto"
                            size={16}
                            strokeWidth={1.25}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mx-auto flex">
                <Button
                  disabled={inputQuestion && loading}
                  className={className()}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <div className="flex  items-center justify-center">
                      <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
                    </div>
                  ) : (
                    <>{!inputQuestion ? "Ask a question" : "submit"}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        {userId && userId === process.env.NEXT_PUBLIC_ADMIN_CLERK_USERID && (
          <TabsContent value="pdf">
            <div className="mt-5 flex h-min  w-full flex-col items-center justify-center rounded-[16px] border-2 bg-white shadow-xl ">
              <div className="mx-4 mb-2 mt-4 self-start">
                <h1 className="text-[18px] font-medium">Upload files</h1>
                <p className="mt-1 text-[12px] text-gray-800">
                  Upload relevant files to the database
                </p>
              </div>
              <div className="mt-2 flex  w-full flex-col justify-start gap-y-6 p-4 ">
                {isPdfUploaded ? (
                  <div className="mt-2 flex h-[100px] w-11/12 flex-col items-center justify-center px-4 text-green-500 ">
                    <BadgeCheck strokeWidth={1.25} />
                    File is uploaded
                  </div>
                ) : (
                  <div
                    className={` flex bg-${
                      isDragActivePdf ? "gray-200" : "[#f7f8f9]"
                    } bg-gray-00 font-nunito text-gray-90 border-grey-400 h-[180px] w-full flex-col items-center justify-center rounded-[16px] border-[3px] border-dashed`}
                    {...getRootPropsPdf()}
                  >
                    {" "}
                    <div className="mb-4">
                      <svg
                        id="Layer_1"
                        enable-background="new 0 0 36 36"
                        height="36"
                        viewBox="0 0 512 512"
                        width="36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <g clip-rule="evenodd" fill-rule="evenodd">
                            <path
                              d="m168.584 0h173.398l153.062 153.091v293.98c0 35.698-29.202 64.929-64.929 64.929h-261.53c-35.698 0-64.9-29.231-64.9-64.929v-382.142c0-35.698 29.202-64.929 64.899-64.929z"
                              fill="#e5252a"
                            />
                            <path
                              d="m341.982 0 153.062 153.091h-136.559c-9.1 0-16.503-7.432-16.503-16.532z"
                              fill="#b71d21"
                            />
                            <path
                              d="m31.206 218.02h352.618c7.842 0 14.25 6.408 14.25 14.25v129.36c0 7.842-6.408 14.25-14.25 14.25h-352.618c-7.842 0-14.25-6.408-14.25-14.25v-129.36c0-7.842 6.409-14.25 14.25-14.25z"
                              fill="#b71d21"
                            />
                          </g>
                          <path
                            d="m117.759 244.399h-26.598c-4.565 0-8.266 3.701-8.266 8.266v43.598 10.738 34.206c0 4.565 3.701 8.266 8.266 8.266s8.266-3.701 8.266-8.266v-25.94h18.331c19.224 0 34.864-15.64 34.864-34.863v-1.141c.001-19.224-15.639-34.864-34.863-34.864zm18.332 36.004c0 10.108-8.224 18.331-18.332 18.331h-18.332v-2.472-35.332h18.331c10.108 0 18.332 8.224 18.332 18.331v1.142zm70.62-36.004h-26.597c-4.565 0-8.266 3.701-8.266 8.266v88.542c0 4.565 3.701 8.266 8.266 8.266h26.597c19.224 0 34.864-15.64 34.864-34.863v-35.347c0-19.224-15.64-34.864-34.864-34.864zm18.332 70.21c0 10.108-8.224 18.331-18.332 18.331h-18.331v-72.01h18.331c10.108 0 18.332 8.224 18.332 18.331zm53.897-53.678v22.882h38.317c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266h-38.317v40.862c0 4.565-3.701 8.266-8.266 8.266s-8.266-3.701-8.266-8.266v-88.542c0-4.565 3.701-8.266 8.266-8.266h53.195c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266z"
                            fill="#fff"
                          />
                        </g>
                      </svg>
                    </div>
                    <input {...getInputPropsPdf()} />
                    {isDragActivePdf ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <>
                        {loading ? (
                          <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
                        ) : (
                          <>
                            <p className="text-[14px] text-gray-700 hover:cursor-default">
                              Drag &apos; drop files(s) to upload{" "}
                            </p>
                            <p className="cursor-pointer font-semibold underline">
                              or browse
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="mx-auto flex w-fit max-w-[90%] flex-col gap-y-2">
                  {files.length > 0 &&
                    files.map((file, index) => {
                      return (
                        <div className="flex" key={index}>
                          <div>
                            <svg
                              id="Layer_1"
                              enable-background="new 0 0 20 20"
                              height="20"
                              viewBox="0 0 512 512"
                              width="20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g>
                                <g clip-rule="evenodd" fill-rule="evenodd">
                                  <path
                                    d="m168.584 0h173.398l153.062 153.091v293.98c0 35.698-29.202 64.929-64.929 64.929h-261.53c-35.698 0-64.9-29.231-64.9-64.929v-382.142c0-35.698 29.202-64.929 64.899-64.929z"
                                    fill="#e5252a"
                                  />
                                  <path
                                    d="m341.982 0 153.062 153.091h-136.559c-9.1 0-16.503-7.432-16.503-16.532z"
                                    fill="#b71d21"
                                  />
                                  <path
                                    d="m31.206 218.02h352.618c7.842 0 14.25 6.408 14.25 14.25v129.36c0 7.842-6.408 14.25-14.25 14.25h-352.618c-7.842 0-14.25-6.408-14.25-14.25v-129.36c0-7.842 6.409-14.25 14.25-14.25z"
                                    fill="#b71d21"
                                  />
                                </g>
                                <path
                                  d="m117.759 244.399h-26.598c-4.565 0-8.266 3.701-8.266 8.266v43.598 10.738 34.206c0 4.565 3.701 8.266 8.266 8.266s8.266-3.701 8.266-8.266v-25.94h18.331c19.224 0 34.864-15.64 34.864-34.863v-1.141c.001-19.224-15.639-34.864-34.863-34.864zm18.332 36.004c0 10.108-8.224 18.331-18.332 18.331h-18.332v-2.472-35.332h18.331c10.108 0 18.332 8.224 18.332 18.331v1.142zm70.62-36.004h-26.597c-4.565 0-8.266 3.701-8.266 8.266v88.542c0 4.565 3.701 8.266 8.266 8.266h26.597c19.224 0 34.864-15.64 34.864-34.863v-35.347c0-19.224-15.64-34.864-34.864-34.864zm18.332 70.21c0 10.108-8.224 18.331-18.332 18.331h-18.331v-72.01h18.331c10.108 0 18.332 8.224 18.332 18.331zm53.897-53.678v22.882h38.317c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266h-38.317v40.862c0 4.565-3.701 8.266-8.266 8.266s-8.266-3.701-8.266-8.266v-88.542c0-4.565 3.701-8.266 8.266-8.266h53.195c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266z"
                                  fill="#fff"
                                />
                              </g>
                            </svg>
                          </div>
                          <div className="ml-3 mr-[10px] line-clamp-1 w-[300px]">
                            <p className="text-[14px] ">{file.name}</p>
                          </div>
                          <div className="">
                            <Trash2
                              onClick={() => deleteFile(index)}
                              className=""
                              strokeWidth={1.25}
                              size={18}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex self-end">
                  <Button
                    disabled={loading}
                    className={
                      files.length > 0
                        ? "min-w-[80px] text-[14px]"
                        : "bg-gray-400 text-[14px] hover:bg-gray-400"
                    }
                    onClick={handlePdfSubmit}
                  >
                    {loading ? (
                      <div className="flex  items-center justify-center">
                        <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
                      </div>
                    ) : (
                      <>
                        {isPdfUploaded ? (
                          <p>next</p>
                        ) : (
                          <div className="flex">
                            <Send
                              strokeWidth={1.25}
                              size={16}
                              className="mr-1"
                            />
                            <p>Send</p>
                          </div>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="excel">
          <ExcelInput/>
        </TabsContent>
      </Tabs>
    </div>
  );
};
