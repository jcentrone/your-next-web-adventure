import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ChatWidget } from "./ChatWidget";
import * as chatbot from "@/integrations/chatbot";

function createStream(text: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(chatbot, "listConversations").mockResolvedValue([] as any);
    vi.spyOn(chatbot, "fetchMessages").mockResolvedValue([] as any);
  });
  it("opens dialog and streams markdown response", async () => {
    const stream = createStream("**bold**");
    const spy = vi
      .spyOn(chatbot, "sendMessage")
      .mockResolvedValue({ stream, tool: Promise.resolve({}) } as any);

    const user = userEvent.setup();
    render(<ChatWidget />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /chat/i }));
    });

    const input = await screen.findByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, "Hi");
      await user.click(screen.getByRole("button", { name: /send/i }));
    });

    expect(spy).toHaveBeenCalledWith([{ role: "user", content: "Hi" }]);

    await screen.findByText("bold", { selector: "strong" });

    const support = screen.getByRole("link", { name: /contact support/i });
    expect(support.getAttribute("href")).toBe("/support");

    spy.mockRestore();
  });

  it("renders record creation confirmation with link", async () => {
    const stream = createStream('{"id":"1","type":"company"}');
    const spy = vi
      .spyOn(chatbot, "sendMessage")
      .mockResolvedValue({
        stream,
        tool: Promise.resolve({ recordId: "1", recordType: "account" }),
      } as any);

    const user = userEvent.setup();
    render(<ChatWidget />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /chat/i }));
    });

    const input = await screen.findByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, "create an account");
      await user.click(screen.getByRole("button", { name: /send/i }));
    });

    await screen.findByText(/Account created/i);
    const link = screen.getByRole("link", { name: /view/i });
    expect(link.getAttribute("href")).toBe("/accounts/1");

    spy.mockRestore();
  });

  it("shows follow-up prompts when fields are missing", async () => {
    const stream = createStream("Missing required fields: name, address");
    const spy = vi
      .spyOn(chatbot, "sendMessage")
      .mockResolvedValue({
        stream,
        tool: Promise.resolve({ missingFields: ["name", "address"] }),
      } as any);

    const user = userEvent.setup();
    render(<ChatWidget />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /chat/i }));
    });

    const input = await screen.findByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(input, "create report");
      await user.click(screen.getByRole("button", { name: /send/i }));
    });

    await screen.findByText(/Please provide the following fields: name, address/);
    await screen.findByRole("button", { name: /name/i });
    await screen.findByRole("button", { name: /address/i });

    spy.mockRestore();
  });

  it("loads messages from selected conversation", async () => {
    const listSpy = vi
      .spyOn(chatbot, "listConversations")
      .mockResolvedValue([
        { id: "1", created_at: "2024-01-01T00:00:00Z" },
      ] as any);
    const fetchSpy = vi
      .spyOn(chatbot, "fetchMessages")
      .mockResolvedValue([
        { role: "assistant", content: "Previous reply" },
      ] as any);

    const user = userEvent.setup();
    render(<ChatWidget />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /chat/i }));
    });

    expect(listSpy).toHaveBeenCalled();

    const trigger = screen.getByRole("combobox", {
      name: /conversation history/i,
    });
    await act(async () => {
      trigger.focus();
    });
    await act(async () => {
      await user.keyboard("{Enter}");
    });

    const dateStr = new Date("2024-01-01T00:00:00Z").toLocaleString();
    await screen.findByText(dateStr);
    await act(async () => {
      await user.keyboard("{ArrowDown}{Enter}");
    });

    expect(fetchSpy).toHaveBeenCalledWith("1");
    await screen.findByText("Previous reply");

    listSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  it("speaks assistant messages and can be muted", async () => {
    const spy = vi.spyOn(chatbot, "sendMessage");
    spy.mockResolvedValueOnce({ stream: createStream("Hi there"), tool: Promise.resolve({}) } as any);
    spy.mockResolvedValueOnce({ stream: createStream("Second message"), tool: Promise.resolve({}) } as any);

    const speak = vi.fn();
    const cancel = vi.fn();
    (window as any).speechSynthesis = { speak, cancel };
    (window as any).SpeechSynthesisUtterance = function (this: any, text: string) {
      this.text = text;
    } as any;

    const user = userEvent.setup();
    render(<ChatWidget />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /chat/i }));
    });

    const input = await screen.findByPlaceholderText(/type your message/i);

    await act(async () => {
      await user.type(input, "hello");
      await user.click(screen.getByRole("button", { name: /send/i }));
    });

    await screen.findByText("Hi there");
    expect(speak).toHaveBeenCalledTimes(1);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /mute/i }));
    });

    await act(async () => {
      await user.type(input, "again");
      await user.click(screen.getByRole("button", { name: /send/i }));
    });

    await screen.findByText("Second message");
    expect(speak).toHaveBeenCalledTimes(1);

    delete (window as any).speechSynthesis;
    delete (window as any).SpeechSynthesisUtterance;
    spy.mockRestore();
  });
});
