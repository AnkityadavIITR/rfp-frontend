import { useRouter } from "next/router";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import cx from "classnames";
import { AiOutlineArrowRight } from "react-icons/ai";
import { CloudUpload, Trash2 } from "lucide-react";
import { useFileStore } from "~/utils/store/fileStore";
import { backendClient } from "~/api/backend";
import Link from "next/link";

export const TitleAndDropdown = () => {
  const router = useRouter();

  const files = useFileStore((state) => state.files);
  const addFiles = useFileStore((state) => state.addFiles);
  const selectedFiles = useFileStore((state) => state.selectedFiles);
  const selectFiles = useFileStore((state) => state.selectFile);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const removeSelectedFile = useFileStore((state) => state.removeSelectedFile);

  const [fileAvailable, setFileAvailable] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);


  const onDrop = useCallback(
    (acceptedFiles: File[]) => {

      const excelFiles = acceptedFiles.filter((file) => {
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

      if (excelFiles.length > 0) {
        addFiles(excelFiles);
      } else {
        alert("Please select only Excel or CSV files.");
      }
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
    },
  });

  const renderFiles = () => {
    const toggleSelectFile = (file: File) => {
      if (selectedFiles.includes(file)) {
        if (selectedFiles.length == 1) {
          setFileAvailable(false);
        }
        removeSelectedFile(file.name);
      } else {
        selectFiles(file);
        setFileAvailable(true);
      }
    };

    return (
      <table className=" m-5">
        <thead>
          <tr className="flex">
            <th className="w-[60px] xl:w-[100px]">Select</th>
            <th className="w-[200px] xl:w-[300px]">File Name</th>
            <th className="w-[150px] xl:w-[200px]">File Type</th>
            <th className="w-[50px] xl:w-[100px]">Delete</th>
          </tr>
        </thead>
        <tbody>
          {files?.map((file, index) => (
            <tr key={index} className="flex items-center">
              <td className="flex w-[60px] xl:w-[100px]">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file)}
                  onChange={() => toggleSelectFile(file)}
                  className="mx-auto w-fit"
                />
              </td>
              <td className="w-[200px] overflow-auto xl:w-[300px]">
                {file.name}
              </td>
              <td className=" w-[150px] text-center xl:w-[200px]">
                {file.type}
              </td>
              <td className="w-[60px] text-center xl:w-[100px]">
                <Trash2
                  onClick={() => deleteFile(index)}
                  className="mx-auto"
                  strokeWidth={1.25}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault();
    router.push("/conversation").catch((error) => {
      console.error(error);
    });
  };

  return (
    <div className="landing-page-gradient-1 font-lora relative flex h-max w-screen flex-col items-center ">
      <div className="mt-28 flex flex-col items-center"></div>
      <div className="mt-5 flex h-min w-11/12 max-w-[1200px] flex-col items-center justify-center rounded-lg border-2 bg-white sm:min-h-[400px] md:w-9/12 ">
        <div className="p-4 text-center text-xl font-bold">
          Start your conversation by selecting the documents you want to explore
        </div>
        {renderFiles()}

        <div className="mt-2 flex h-[200px] w-11/12 flex-col justify-start overflow-scroll px-4 ">
          <div
            className={`m-4 flex bg-${
              isDragActive ? "gray-300" : "gray-200"
            } bg-gray-00 font-nunito text-gray-90 h-full flex-col items-center justify-center rounded-xl border border-dashed`}
            {...getRootProps()}
          >
            <CloudUpload strokeWidth={1.25} />
            <input {...getInputProps()} multiple accept=".xls, .xlsx, .csv" />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p className="hover:cursor-default">Drag&apos;n drop excel files here, or click to select files</p>
            )}
          </div>
        </div>

        <div className="h-1/8 bg-gray-00 mt-2 flex w-full items-center justify-center rounded-lg">
          <div className="flex flex-wrap items-center justify-center">
            <>
              <div className="font-nunito w-48 md:ml-8 ">
                Add up to{" "}
                <span className="font-bold"> {10 - files?.length}</span>{" "}
                <>docs</>
              </div>
              <div className="font-nunito ml-1 ">
                <>to</>
              </div>
            </>
            <div className="md:ml-12">
              <button
                disabled={!fileAvailable}
                onClick={()=>{
                  router.push("/conversation").catch((error) => {
                    console.error(error);
                  })
                }}
                className={cx(
                  "bg-llama-indigo font-nunito disabled:bg-gray-30 m-4 rounded border px-6 py-2 text-white hover:bg-[#3B3775] ",
                  !fileAvailable
                    ? "border-gray-300  bg-gray-300"
                    : "bg-[#3B3775]"
                )}
              >
                <div className="flex items-center justify-center">
                  {isLoadingConversation ? (
                    <div className="flex h-[22px] w-[180px] items-center justify-center">
                      <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
                    </div>
                  ) : (
                    <>
                      start your conversation
                      <div className="ml-2">
                        <AiOutlineArrowRight />
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
