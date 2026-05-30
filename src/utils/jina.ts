import { AutoTokenizer } from '@huggingface/transformers'
import * as ort from 'onnxruntime-web'

// Configure ONNX Runtime Web to load WASM assets from CDN to bypass Vite's dev-server static import constraints
ort.env.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/'

// biome-ignore lint/suspicious/noExplicitAny: tokenizer return type is complex
let tokenizerInstance: any = null
let sessionInstance: ort.InferenceSession | null = null
// biome-ignore lint/suspicious/noExplicitAny: complex promise chain
let runPromiseLock: Promise<any> = Promise.resolve()

export interface LocalEmbeddingResult {
  shape: readonly number[]
  data: number[]
  outputNames: string[]
}

async function fetchWithProgress(
  url: string,
  onProgress: (percent: number, loadedMB: string, totalMB: string) => void,
): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.statusText}`)
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  if (!response.body) {
    return response.arrayBuffer()
  }

  const reader = response.body.getReader()
  let loaded = 0
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      loaded += value.length
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0
      const loadedMB = (loaded / (1024 * 1024)).toFixed(1)
      const totalMB = total > 0 ? (total / (1024 * 1024)).toFixed(1) : 'unknown'
      onProgress(percent, loadedMB, totalMB)
    }
  }

  const result = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result.buffer
}

let initializerPromise: Promise<void> | null = null

async function initModel(onProgress?: (status: string) => void) {
  if (initializerPromise) {
    return initializerPromise
  }

  initializerPromise = (async () => {
    // Initialize Tokenizer
    if (!tokenizerInstance) {
      console.log('Jina Model: Loading tokenizer...')
      onProgress?.('Loading tokenizer...')
      tokenizerInstance = await AutoTokenizer.from_pretrained(
        'jinaai/jina-colbert-v2',
      )
      console.log('Jina Model: Tokenizer loaded successfully.')
    }

    // Initialize ONNX Session
    if (!sessionInstance) {
      const modelUrl = '/model_quantized.onnx'

      console.log('Jina Model: Fetching quantized model from local server...')
      onProgress?.('Downloading local quantized model...')
      const modelBuffer = await fetchWithProgress(
        modelUrl,
        (pct, loaded, total) => {
          const status = `Downloading local model: ${pct}% (${loaded}/${total} MB)`
          onProgress?.(status)
          if (pct % 10 === 0) {
            console.log(`Jina Model: ${status}`)
          }
        },
      )
      console.log(
        'Jina Model: Model download complete. File size:',
        (modelBuffer.byteLength / (1024 * 1024)).toFixed(1),
        'MB',
      )

      console.log('Jina Model: Initializing ONNX Runtime Web session...')
      onProgress?.('Initializing ONNX Runtime session...')
      sessionInstance = await ort.InferenceSession.create(
        new Uint8Array(modelBuffer),
        {
          executionProviders: ['wasm'],
        },
      )
      console.log('Jina Model: ONNX session initialized successfully.')
    }
  })()

  return initializerPromise
}

/**
 * Runs embeddings locally in the browser using WASM by fetching custom split ONNX model files.
 */
export async function getJinaColbertEmbeddingLocal(
  text: string,
  onProgress?: (status: string) => void,
): Promise<LocalEmbeddingResult> {
  await initModel(onProgress)

  onProgress?.('Tokenizing input...')
  const tokenized = await tokenizerInstance(text, {
    padding: true,
    truncation: true,
    max_length: 32,
  })

  onProgress?.('Running ONNX model inference...')
  const inputIds = BigInt64Array.from(
    Array.from(tokenized.input_ids.data as (number | bigint | string)[]).map(
      (x) => BigInt(x),
    ),
  )
  const attentionMask = BigInt64Array.from(
    Array.from(
      tokenized.attention_mask.data as (number | bigint | string)[],
    ).map((x) => BigInt(x)),
  )

  const feeds: Record<string, ort.Tensor> = {
    input_ids: new ort.Tensor('int64', inputIds, tokenized.input_ids.dims),
    attention_mask: new ort.Tensor(
      'int64',
      attentionMask,
      tokenized.attention_mask.dims,
    ),
  }

  if (!sessionInstance) {
    throw new Error('ONNX session is not initialized')
  }

  const results = await (runPromiseLock = runPromiseLock
    .catch(() => {
      // ignore previous errors to keep chain alive
    })
    .then(() => sessionInstance!.run(feeds)))
  const outputNames = Object.keys(results)
  // Typically 'last_hidden_state' or the first output tensor contains embeddings
  const primaryOutputKey = outputNames[0]
  const primaryOutput = results[primaryOutputKey]

  // Truncate query embeddings to only include active (non-padding) tokens,
  // matching the Python sidecar truncation behavior to save 80%+ of backend CPU time.
  const attentionMaskData = Array.from(tokenized.attention_mask.data) as (
    | number
    | bigint
  )[]
  const numTokens = attentionMaskData.reduce(
    (sum: number, val) => sum + Number(val),
    0,
  )
  const dim = primaryOutput.dims[2]

  const fullData = primaryOutput.data as Float32Array
  const truncatedData = Array.from(fullData.subarray(0, numTokens * dim))

  return {
    shape: [1, numTokens, dim],
    data: truncatedData,
    outputNames,
  }
}
