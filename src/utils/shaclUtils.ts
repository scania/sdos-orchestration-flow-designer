const fs = require("fs");
import { Parser, Quad } from "n3";
import { Transform } from "stream";

// Function to parse TTL file
export const parseTTLFile = (filePath: string): Promise<Quad[]> => {
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const quads: Quad[] = [];

    const transform = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const strChunk = chunk.toString();
          const parsedQuads = parser.parse(strChunk);
          parsedQuads.forEach((quad) => this.push(quad));
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    fs.createReadStream(filePath)
      .pipe(transform)
      .on("data", (quad: Quad) => quads.push(quad))
      .on("error", (error: Error) => reject(error))
      .on("end", () => {
        resolve(quads);
      });
  });
};

export const convertQuadsToJson = (quads: Quad[]): any[] => {
  return quads.map((quad) => {
    return {
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: quad.object.value,
      graph: quad.graph.value, // This may be empty for most quads
    };
  });
};
