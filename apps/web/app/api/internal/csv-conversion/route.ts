import { NextRequest, NextResponse } from "next/server";
import { AsyncParser } from "@json2csv/node";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { responses } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return responses.unauthorizedResponse();
  }

  const data = await request.json();
  let csv: string = "";

  const { json, fields, fileName } = data;

  const parser = new AsyncParser({
    fields,
  });

  try {
    csv = await parser.parse(json).promise();
  } catch (err) {
    console.log({ err });
    throw new Error("Failed to convert to CSV");
  }

  const headers = new Headers();
  headers.set("Content-Type", "text/csv;charset=utf-8;");
  headers.set("Content-Disposition", `attachment; filename=${fileName ?? "converted"}.csv`);

  return NextResponse.json(
    {
      fileResponse: csv,
    },
    {
      headers,
    }
  );
}
