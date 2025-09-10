import { ReadableStream } from 'stream/web'
import { vi } from 'vitest'

describe('chatbot tool call streaming', () => {
  const createSSEStream = (toolName: string) => {
    const encoder = new TextEncoder()
    const chunks = [
      `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ id: 'tool_1', type: 'function', function: { name: toolName, arguments: '{}' } }] }, index: 0, finish_reason: null }] })}\n`,
      `data: ${JSON.stringify({ choices: [{ delta: {}, index: 0, finish_reason: 'tool_calls' }] })}\n`,
      'data: [DONE]\n',
    ]
    return new ReadableStream<Uint8Array>({
      start(controller) {
        for (const c of chunks) {
          controller.enqueue(encoder.encode(c))
        }
        controller.close()
      },
    })
  }

  const extractToolCall = async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let tool: string | null = null
    outer: while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta
          if (delta?.tool_calls) {
            tool = delta.tool_calls[0]?.function?.name || null
          }
          const finish = parsed.choices?.[0]?.finish_reason
          if (finish === 'tool_calls') {
            break outer
          }
        }
      }
    }
    return tool
  }

  const tools = [
    'create_account',
    'create_contact',
    'create_report',
    'create_task',
    'create_appointment',
  ] as const

  for (const tool of tools) {
    it(`detects ${tool} tool call`, async () => {
      const stream = createSSEStream(tool)
      const found = await extractToolCall(stream)
      expect(found).toBe(tool)
    })
  }

  it('sends tools and auto tool choice', async () => {
    let captured: any
    const stream = createSSEStream('create_account')
    const fetchMock = vi.fn(async (_url, init: RequestInit) => {
      captured = JSON.parse(String(init?.body))
      return new Response(stream)
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        tools: tools.map((name) => ({ type: 'function', function: { name } })),
        tool_choice: 'auto',
      }),
    })

    expect(captured.tool_choice).toBe('auto')
    expect(captured.tools.map((t: any) => t.function.name)).toEqual([...tools])

    vi.unstubAllGlobals()
  })
})
