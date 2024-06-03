import React from 'react'
import { useState, useCallback } from 'react';
import { BadgeCheck,Upload,Trash2,Send } from 'lucide-react';
import { useFileStore } from '~/utils/store/fileStore';
import { useDropzone } from "react-dropzone";
import { backendClient } from '~/api/backend';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/router';
import { useQuestionStore } from '~/utils/store/questionStore';
import { Button } from '../ui/button';


const ExcelInput = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isExcelUploaded, setIsExcelUploaded] = useState<boolean>(false);
    
    const { userId } = useAuth();
    const router = useRouter();


    const excels = useFileStore((state) => state.excels);
    const addQuestions = useQuestionStore((state) => state.addQueries);

    const addExcels = useFileStore((state) => state.addExcels);
    const removeExcel = useFileStore((state) => state.removeExcel);

    const addFiles = useFileStore((state) => state.addFiles);


    const onDropExcel = useCallback(
        (acceptedFiles: File[]) => {
          const excelFile = acceptedFiles.filter((file) => {
            const fileNameParts = file.name.split(".");
            const fileExtension = fileNameParts[fileNameParts.length - 1];
            return (
              fileExtension === "xlsx" ||
              fileExtension === "xls" ||
              fileExtension === "xlsm" ||
              fileExtension === "xlsb" ||
              fileExtension === "xlt" ||
              fileExtension === "xltx" ||
              fileExtension === "xltm" ||
              fileExtension === "csv"
            );
          });
    
          if (excelFile.length > 0) {
            addExcels(excelFile);
            console.log("files", excelFile);
          } else {
            alert("Please select only Excel or CSV files.");
          }
        },
        [addFiles]
      );

      const {
        getRootProps: getRootPropsExcel,
        getInputProps: getInputPropsExcel,
        isDragActive: isDragActiveExcel,
      } = useDropzone({
        onDrop: onDropExcel,
        maxFiles: 10,
        accept: {
          "application/vnd.ms-excel": [".xls"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "text/csv": [".csv"],
        },
      });

      const handleExcelSubmit = async ()=> {
        if (!userId) {
          document.getElementById("auth")?.click();
        } else {
          if (excels.length > 0 && !isExcelUploaded) {
            try {
              setLoading(true);
              const excelResponse = await backendClient.postExcelFile(
                "/uploadexcel/",
                excels
              );
              if(excelResponse){
                console.log("Excel response:", excelResponse);
                addQuestions(excelResponse.details);
                setIsExcelUploaded(true);
              }
            } catch (e) {
              console.log(e);
            } finally {
              setLoading(false);
            }
          } else {
            router.push("/documents").catch((e) => {
              console.log(e);
            });
          }
        }
      };

  return (
    <div className="mt-5 flex h-min flex-col items-center justify-center rounded-[16px] border-2 bg-white shadow-xl ">
    <div className="mx-4 mb-2 mt-4 self-start">
      <h1 className="text-[18px] font-medium">
        Here, you can upload incomplete questionnaires. I will detect
        the questions and provide answers for each of them.
      </h1>
    </div>
    <div className="mt-2 flex  w-full flex-col justify-start gap-y-3 p-4 ">
      {isExcelUploaded ? (
        <div className="mt-2 flex h-[100px] w-11/12 flex-col items-center justify-center px-4 text-green-500 ">
          <BadgeCheck strokeWidth={1.25} />
          File is uploaded
        </div>
      ) : (
        <div
          className={` flex bg-${
            isDragActiveExcel ? "gray-200" : "[#f7f8f9]"
          } bg-gray-00 font-nunito text-gray-90 border-grey-400 h-[180px] w-full flex-col items-center justify-center rounded-[16px] border-[3px] border-dashed`}
          {...getRootPropsExcel()}
        >
          <Upload strokeWidth={1.25} size={36} className="mb-4" />
          <input {...getInputPropsExcel()} />
          {isDragActiveExcel ? (
            <p>Drop the files here ...</p>
          ) : (
            <>
              {loading ? (
                <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
              ) : (
                <>
                  <p className="text-[14px] text-gray-700 hover:cursor-default">
                    Drag & drop files(s) to upload{" "}
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
        {excels.length > 0 &&
          excels.map((excel, index) => {
            return (
              <div className="flex">
                <div className="w-[20px]">
                  <img src="/excel.svg" alt="Excel SVG" />
                </div>
                <div className="ml-3 mr-[10px] line-clamp-1 w-[300px]">
                  <p className="text-[14px] ">p{excel.name}</p>
                </div>
                <div className="">
                  <Trash2
                    onClick={() => removeExcel(index)}
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
            excels.length > 0
              ? "min-w-[80px] text-[14px]  "
              : "bg-gray-400 text-[14px] hover:bg-gray-400"
          }
          onClick={handleExcelSubmit}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
            </div>
          ) : (
            <>
              {isExcelUploaded ? (
                <p>next</p>
              ) : (
                <div className="flex">
                  <Send strokeWidth={1.25} size={16} className="mr-1" />
                  <p>Send</p>
                </div>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
  )
}

export default ExcelInput
