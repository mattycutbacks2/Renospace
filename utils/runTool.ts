import { supabase } from './supabaseClient'

export type ToolName =
  | 'colorpop'
  | 'artpreview'
  | 'gardenrender'
  | 'objectswap'
  | 'roomrender'
  | 'stylesync'
  | 'surfacestyle'
  | 'canigetahottub'
  | 'virtualstager'

interface RunToolPayload {
  tool: ToolName
  imageUrl: string
  prompt: string
}

export async function runTool({
  tool,
  imageUrl,
  prompt,
}: RunToolPayload): Promise<{ resultUrl: string }> {
  const { data, error } = await supabase.functions.invoke('run-tool', {
    body: { tool, imageUrl, prompt },
  })

  if (error) {
    console.error('runTool error:', error)
    throw error
  }
  return data as { resultUrl: string }
} 