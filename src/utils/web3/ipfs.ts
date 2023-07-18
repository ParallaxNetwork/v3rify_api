import { ThirdwebStorage } from "@thirdweb-dev/storage";
import axios from "axios";

const storage = new ThirdwebStorage();

export const getIPFSLink = (ipfsLink:string) => {
  const cid = ipfsLink.replace("ipfs://", "");

  const url = storage.resolveScheme(`ipfs://${cid}`);
  return url;
}

export const getIPFSData = async (cid:string) => {
  const url = getIPFSLink(cid);
  const response = await axios.get(url);

  // get filename
  const filename = response.headers["x-ipfs-path"].split("/").pop();

  // convert it to file
  const file = new File([response.data], filename, { type: response.headers["content-type"] });

  console.log(file);
}


// get file size from ipfs without downloading it
export const getIPFSFileSize = async (cid:string) => {
  const url = getIPFSLink(cid);
  const response = await axios.head(url);

  const size = response.headers["content-length"];
  
  return size;
}