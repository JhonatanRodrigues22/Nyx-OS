import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/capture";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn()
  }
}));

const mockFrom = supabase?.from as jest.Mock;
const mockInsert = jest.fn();

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
    setHeader: jest.fn()
  } as unknown as NextApiResponse;

  (response.status as jest.Mock).mockReturnValue(response);
  (response.json as jest.Mock).mockReturnValue(response);

  return response;
}

describe("/api/capture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: mockInsert
    });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("creates a note through the notes table", async () => {
    const request = {
      method: "POST",
      body: {
        kind: "note",
        content: "Ideia capturada"
      }
    } as NextApiRequest;
    const response = createResponse();

    await handler(request, response);

    expect(mockFrom).toHaveBeenCalledWith("notes");
    expect(mockInsert).toHaveBeenCalledWith({
      content: "Ideia capturada"
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      ok: true,
      table: "notes"
    });
  });

  it("returns 400 when the payload is invalid", async () => {
    const request = {
      method: "POST",
      body: {
        kind: "task",
        title: ""
      }
    } as NextApiRequest;
    const response = createResponse();

    await handler(request, response);

    expect(mockFrom).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      ok: false,
      error: "Task title is required."
    });
  });
});
