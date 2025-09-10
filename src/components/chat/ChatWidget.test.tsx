import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

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
  it("opens dialog and streams response", async () => {
    const stream = createStream("Hello from bot");
    const spy = vi.spyOn(chatbot, "sendMessage").mockResolvedValue(stream as any);

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

    await screen.findByText("Hello from bot");

    const support = screen.getByRole("link", { name: /contact support/i });
    expect(support.getAttribute("href")).toBe("/support");

    spy.mockRestore();
  });
});
