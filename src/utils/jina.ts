import { AutoTokenizer } from '@huggingface/transformers'
import { atom, getDefaultStore } from 'jotai'
import * as ort from 'onnxruntime-web'

// Configure ONNX Runtime Web to load WASM assets from CDN to bypass Vite's dev-server static import constraints
ort.env.wasm.wasmPaths = import.meta.env.DEV
  ? 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/'
  : '/'

// Atoms for tracking model loading state
export const modelLoadingProgressAtom = atom<number | null>(null)
export const modelLoadingStatusAtom = atom<string>('')
export const isModelLoadingAtom = atom<boolean>(false)

const store = getDefaultStore()

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
  // Fallback to 538.0 MB (564,161,696 bytes) if content-length is missing/unreported
  const total = contentLength ? parseInt(contentLength, 10) : 564161696

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

export async function preloadModel() {
  await initModel()
}

async function initModel(onProgress?: (status: string) => void) {
  if (initializerPromise) {
    return initializerPromise
  }

  store.set(isModelLoadingAtom, true)
  initializerPromise = (async () => {
    try {
      // Initialize Tokenizer
      if (!tokenizerInstance) {
        console.log('Jina Model: Loading tokenizer...')
        const status = 'Loading tokenizer...'
        onProgress?.(status)
        store.set(modelLoadingStatusAtom, status)
        tokenizerInstance = await AutoTokenizer.from_pretrained(
          'jinaai/jina-colbert-v2',
        )
        console.log('Jina Model: Tokenizer loaded successfully.')
      }

      // Initialize ONNX Session
      if (!sessionInstance) {
        const modelUrl = '/model_quantized.onnx'

        console.log('Jina Model: Fetching quantized model from local server...')
        const status = 'Downloading local quantized model...'
        onProgress?.(status)
        store.set(modelLoadingStatusAtom, status)
        const modelBuffer = await fetchWithProgress(
          modelUrl,
          (pct, loaded, total) => {
            const status = `Downloading local model: ${pct}% (${loaded}/${total} MB)`
            onProgress?.(status)
            store.set(modelLoadingStatusAtom, status)
            store.set(modelLoadingProgressAtom, pct)
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
        const initStatus = 'Initializing ONNX Runtime session...'
        onProgress?.(initStatus)
        store.set(modelLoadingStatusAtom, initStatus)
        sessionInstance = await ort.InferenceSession.create(
          new Uint8Array(modelBuffer),
          {
            executionProviders: ['wasm'],
          },
        )
        console.log('Jina Model: ONNX session initialized successfully.')
      }
    } finally {
      store.set(isModelLoadingAtom, false)
      store.set(modelLoadingProgressAtom, null)
      store.set(modelLoadingStatusAtom, '')
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
