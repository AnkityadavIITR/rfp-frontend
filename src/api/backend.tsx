import type { Message } from "~/types/conversation";
import type { BackendDocument } from "~/types/backend/document";
import { SecDocument } from "~/types/document";
import { fromBackendDocumentToFrontend } from "./utils/documents";
import { promises } from "dns";

interface CreateConversationPayload {
  id: string;
}

const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || '';
interface GetConversationPayload {
  id: string;
  messages: Message[];
  documents: BackendDocument[];
}

interface GetConversationReturnType {
  messages: Message[];
  documents: SecDocument[];
}
type OnDataCallback = (chunk: string) => void;

class BackendClient {
  private async get(endpoint: string) {
    const url = backendUrl + endpoint;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  private async post(endpoint: string, body?: any) {
    const url = backendUrl + endpoint;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  public async postExcelFile(endpoint: string, files: File[]): Promise<Response> {
    const url = backendUrl + endpoint;
    console.log("excels",files);
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    })

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res;
  }

  public async postPdfFile(endpoint: string, files: File[]): Promise<Response> {
    const url = backendUrl + endpoint;
    const formData = new FormData();
    console.log(files);
    
    files.forEach((file) => {
      formData.append("files", file);
    })

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res;
  }

  public async saveQna(endpoint:string,query:string,newAns:string):Promise<any>{
    const url = backendUrl + endpoint;
    const qna={
      question:query,
      answer:newAns
    }
    try{
      const response=await fetch(url,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(qna)
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response;
    }catch(e){
      console.log("error saving qna",e);
    }
  }

  public async fetchQuery(endpoint: string, query: string): Promise<Response> {
    const url = backendUrl + endpoint;
    const requestData = {
      query: query
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response;

    } catch (error) {
      throw new Error(`Error fetching query: ${error}`);
    }
  }

  public async getFileUrl(endpoint:string,fileName:string):Promise<any>{
    const [file] = fileName.split('.pdf');
    const url = backendUrl + endpoint+file+'/';
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response;

    } catch (error) {
      throw new Error(`Error fetching query: ${error}`);
    }
  }


}

export const backendClient = new BackendClient();
