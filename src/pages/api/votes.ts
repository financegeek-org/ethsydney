import type { NextApiRequest, NextApiResponse } from "next";
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

const db = client.db("hackathon");
const collection = db.collection("ethsydney");

export async function getAllVotes() {
    const results = await collection.find({}).toArray();
    return results;
}

export const config = {
    api: {
      externalResolver: true,
    },
  };
  
  export type ResponseType = {
    votes: [];
  };

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseType>
  ) {
    getAllVotes().then((arr) => {
        res.status(200).json(arr);
    });
}
  