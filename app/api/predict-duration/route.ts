import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const predictionSchema = z.object({
  partySize: z.number().min(1).max(20),
  dayOfWeek: z.number().min(0).max(6),
  timeOfDay: z.number().min(0).max(23),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = predictionSchema.parse(body)

    // Try to call external ML API if configured
    const mlApiUrl = process.env.ML_PREDICTION_API_URL
    const mlApiKey = process.env.ML_PREDICTION_API_KEY

    if (mlApiUrl) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

        const response = await fetch(mlApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(mlApiKey && { Authorization: `Bearer ${mlApiKey}` }),
          },
          body: JSON.stringify(validatedData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            duration: data.duration || data.predictedDuration || 120,
            source: 'ml-model',
          })
        }
      } catch (error) {
        console.warn('ML API call failed, using fallback:', error)
      }
    }

    // Fallback: 2 hours (120 minutes)
    // Could be enhanced with simple heuristics based on party size
    let fallbackDuration = 120

    // Simple heuristic: larger parties tend to stay longer
    if (validatedData.partySize >= 6) {
      fallbackDuration = 150
    } else if (validatedData.partySize <= 2) {
      fallbackDuration = 90
    }

    return NextResponse.json({
      duration: fallbackDuration,
      source: 'fallback',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error', duration: 120, source: 'fallback' },
      { status: 500 }
    )
  }
}

