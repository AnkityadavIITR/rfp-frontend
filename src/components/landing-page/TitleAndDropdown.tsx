import { useRouter } from "next/router";
import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import cx from "classnames";
import {
  MAX_NUMBER_OF_SELECTED_DOCUMENTS,
  useDocumentSelector,
} from "~/hooks/useDocumentSelector";
import { AiOutlineArrowRight} from "react-icons/ai";
import { useIntercom } from "react-use-intercom";
import { LoadingSpinner } from "~/components/basics/Loading";
import useIsMobile from "~/hooks/utils/useIsMobile";
import { CloudUpload,Trash2 } from "lucide-react";
import { useFileStore } from "~/utils/fileStore";


interface FormState {
  excelFiles: File[];
}

export const TitleAndDropdown = () => {
  const router = useRouter();
  const { isMobile } = useIsMobile();

  const files=useFileStore((state)=>state.files)
  const addFiles=useFileStore((state)=>state.addFiles)

  const [fileAvailable,setFileAvailable]=useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    setIsLoadingConversation(true);
    event.preventDefault();
    setTimeout(()=>{
      router.push(`/documents/scdkcidhc`)
    },5000)
  };

  const {
    selectedDocuments,
    isDocumentSelectionEnabled,
    isStartConversationButtonEnabled,
  } = useDocumentSelector();

  const { boot } = useIntercom();

  useEffect(() => {
    boot();
  }, []);

  const [formState, setFormState] = React.useState<FormState>({
    excelFiles: [],
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);

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
      setFormState({ excelFiles });
    } else {
      setFormState({ excelFiles: [] });
      alert("Please select only Excel or CSV files.");
    }
  }, []);

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
    const selectedFiles=useFileStore((state)=>state.selectedFiles);
    const selectFiles=useFileStore((state)=>state.selectFile);
    const deleteFile=useFileStore((state)=>state.deleteFile)

    const toggleSelectFile = (file: File) => {
      selectFiles(file);
      setFileAvailable(true);
    };
    console.log("selectedFiles",selectedFiles);
    
  
    return (
      <table className=" m-5">
      <thead>
        <tr className="flex">
          <th className="w-[100px]">Select</th>
          <th className="w-[300px]">File Name</th>
          <th className="min-w-[200px]">File Type</th>
          <th className="w-[100px]">Delete</th>
        </tr>
      </thead>
      <tbody>
        {files?.map((file, index) => (
          <tr key={index} className="flex items-center">
            <td className="w-[100px] flex">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file)}
                onChange={() => toggleSelectFile(file)}
                className="mx-auto w-fit"
              />
            </td>
            <td className="w-[300px] overflow-auto">{file.name}</td>
            <td className="min-w-[200px] text-center">{file.type}</td>
            <td className="w-[100px] text-center">
              <Trash2 onClick={()=>deleteFile(index)}  className="mx-auto" strokeWidth={1.25} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    );
  };

  return (
    <div className="landing-page-gradient-1 relative flex h-max w-screen flex-col items-center font-lora ">
      <div className="mt-28 flex flex-col items-center">
      </div>
      {isMobile ? (
        <div className="mt-12 flex h-1/5 w-11/12 rounded border p-4 text-center">
          <div className="text-xl font-bold">
            To start analyzing documents, please switch to a larger screen!
          </div>
        </div>
      ) : (
        <div className="mt-5 flex h-min w-11/12 max-w-[1200px] flex-col items-center justify-center rounded-lg border-2 bg-white sm:min-h-[400px] md:w-9/12 ">
          <div className="p-4 text-center text-xl font-bold">
            Start your conversation by selecting the documents you want to
            explore
          </div>
          {renderFiles()}

          <div className="mt-2 flex h-[200px] w-11/12 flex-col justify-start overflow-scroll px-4 ">
            {selectedDocuments.length === 0 && (
              <div
                className="m-4 flex h-full flex-col items-center justify-center rounded-xl  border border-dashed bg-gray-00 font-nunito text-gray-90"
                {...getRootProps()}
              >
                <CloudUpload strokeWidth={1.25} />
                <input
                  {...getInputProps()}
                  multiple
                  accept=".xls, .xlsx, .csv"
                />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
              </div>
            )}
          </div>

          <div className="h-1/8 mt-2 flex w-full items-center justify-center rounded-lg bg-gray-00">
            <div className="flex flex-wrap items-center justify-center">
              {isDocumentSelectionEnabled && (
                <>
                  <div className="w-48 font-nunito md:ml-8 ">
                    Add up to{" "}
                    <span className="font-bold">
                      {" "}
                      {MAX_NUMBER_OF_SELECTED_DOCUMENTS -
                        files?.length}
                    </span>{" "}
                    {isStartConversationButtonEnabled ? (
                      <>more docs</>
                    ) : (
                      <>docs</>
                    )}
                  </div>
                  <div className="ml-1 font-nunito ">
                    {isStartConversationButtonEnabled ? <>or</> : <>to</>}{" "}
                  </div>
                </>
              )}
              <div className="md:ml-12">
                <button
                  disabled={!fileAvailable}
                  onClick={handleSubmit}
                  className={cx(
                    "m-4 rounded border bg-llama-indigo px-6 py-2 font-nunito text-white hover:bg-[#3B3775] disabled:bg-gray-30 ",
                    !fileAvailable &&
                      "border-gray-300 bg-gray-300"
                  )}
                >
                  <div className="flex items-center justify-center">
                    {isLoadingConversation ? (
                      <div className="flex h-[22px] w-[180px] items-center justify-center">
                        <LoadingSpinner />
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
      )}
    </div>
  );
};
