import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
    const { message, context, reviewId } = await request.json()

    const systemPrompt = `You are an expert code reviewer assistant. 
    Help explain code review suggestions and answer questions about the codebase.
    
    Context: ${context || 'General code review discussion'}
    
    Be concise, helpful, and focus on actionable advice.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Chat response failed' }, 
      { status: 500 }
    )
  }
}
