import { ReadableStream } from 'stream/web'

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
})
