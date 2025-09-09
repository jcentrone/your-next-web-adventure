import { act } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

import { TagInput } from "./TagInput"

describe("TagInput", () => {
  it("adds a tag when pressing enter", async () => {
    const handleChange = vi.fn()
    render(<TagInput value={[]} onChange={handleChange} placeholder="Add tag" />)
    const input = screen.getByPlaceholderText("Add tag")
    const user = userEvent.setup()
    await act(async () => {
      await user.type(input, "test{enter}")
    })
    expect(handleChange).toHaveBeenCalledWith(["test"])
  })

  it("removes a tag when clicking the remove button", async () => {
    const handleChange = vi.fn()
    render(<TagInput value={["foo"]} onChange={handleChange} />)
    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /remove foo/i }))
    })
    expect(handleChange).toHaveBeenCalledWith([])
  })

  it("renders suggestions when provided", () => {
    render(<TagInput value={[]} onChange={() => {}} suggestions={["a", "b"]} placeholder="tags" />)
    const input = screen.getByPlaceholderText("tags")
    expect(input).toHaveAttribute("list")
    expect(document.querySelectorAll("option")).toHaveLength(2)
  })
})
