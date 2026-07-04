import { insertCaptureItem, parseCapturePayload } from "./capture";

describe("parseCapturePayload", () => {
  it("validates required task title", () => {
    expect(() => parseCapturePayload({ kind: "task", title: "" })).toThrow(
      "Task title is required."
    );
  });
});

describe("insertCaptureItem", () => {
  it("inserts tasks in the tasks table", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ insert });

    await insertCaptureItem(
      { from },
      {
        kind: "task",
        title: "Revisar captura",
        priority: "medium"
      }
    );

    expect(from).toHaveBeenCalledWith("tasks");
    expect(insert).toHaveBeenCalledWith({
      title: "Revisar captura",
      priority: "medium"
    });
  });

  it("inserts finance entries in the finance_entries table", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ insert });

    await insertCaptureItem(
      { from },
      {
        kind: "finance",
        type: "expense",
        category: "Casa",
        amount: 42,
        date: "2026-07-04"
      }
    );

    expect(from).toHaveBeenCalledWith("finance_entries");
    expect(insert).toHaveBeenCalledWith({
      type: "expense",
      category: "Casa",
      amount: 42,
      date: "2026-07-04"
    });
  });
});
