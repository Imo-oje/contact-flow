import { AsyncParser } from "@json2csv/node";

interface JsonContacts {
  name: string;
  phone: string;
}

export const convertToCsv = async (
  contacts: JsonContacts[]
): Promise<string> => {
  const parser = new AsyncParser();

  // AsyncParser.parse() returns a Node.js readable stream
  const csvStream = parser.parse(contacts);

  // Collect chunks from the stream into a string
  return new Promise((resolve, reject) => {
    let csv = "";
    csvStream.on("data", (chunk) => (csv += chunk.toString()));
    csvStream.on("end", () => resolve(csv));
    csvStream.on("error", reject);
  });
};
