import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export class AIService {
  private model: string = 'gpt-4'

  async generateCompletion(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate AI completion')
    }
  }

  async streamCompletion(prompt: string): Promise<AsyncIterable<string>> {
    const stream = await openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      temperature: 0.3
    })

    return this.extractContentFromStream(stream)
  }

  private async* extractContentFromStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}
