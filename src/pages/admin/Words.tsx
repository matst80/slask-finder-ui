import { X } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { getWordConfig, WordConfig } from '../../lib/datalayer/api'

const useWordConfig = () => {
  return useSWR('/admin/words', getWordConfig, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })
}

const useWordConfigMutation = () => {
  return useSWRMutation('/admin/words', (_, { arg }: { arg: WordConfig }) => {
    return fetch('/admin/words', {
      method: 'POST',
      body: JSON.stringify(arg),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  })
}

const SplitWordsEditor = ({
  splitWords,
  onChange,
}: {
  splitWords: string[]
  onChange: (data: string[]) => void
}) => {
  const [inputValue, setInputValue] = useState<string>('')

  return (
    <>
      <ul className="mb-4">
        {splitWords.map((word) => (
          <li key={word} className="flex items-center justify-between">
            <span>{word}</span>
            <button
              onClick={() => {
                onChange(splitWords.filter((w) => w !== word))
              }}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete word"
            >
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          placeholder="Enter a word"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={() => {
            if (inputValue.trim() === '') return
            onChange([...splitWords, inputValue])
            setInputValue('')
          }}
          disabled={inputValue.trim() === ''}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Add
        </Button>
      </div>
    </>
  )
}

const WordMappingsEditor = ({
  wordMappings,
  onChange,
}: {
  wordMappings: Record<string, string>
  onChange: (data: Record<string, string>) => void
}) => {
  const [fromValue, setFromValue] = useState<string>('')
  const [toValue, setToValue] = useState<string>('')

  return (
    <>
      <table className="mb-4 w-full table">
        <thead>
          <tr>
            <th className="text-left">From</th>
            <th className="text-left">To</th>
            <th className="text-right">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(wordMappings).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
              <td>
                <button
                  onClick={() => {
                    const updatedMappings = { ...wordMappings }
                    delete updatedMappings[key]
                    onChange(updatedMappings)
                  }}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete mapping"
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="From"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="To"
          value={toValue}
          onChange={(e) => setToValue(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={() => {
            if (fromValue.trim() && toValue.trim()) {
              onChange({ ...wordMappings, [fromValue]: toValue })
              setFromValue('')
              setToValue('')
            }
          }}
          disabled={!fromValue.trim() || !toValue.trim()}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Add
        </Button>
      </div>
    </>
  )
}

export const Words = () => {
  const { data, isLoading, error, mutate } = useWordConfig()
  const { trigger } = useWordConfigMutation()
  if (isLoading)
    return <div className="text-center text-gray-500">Loading...</div>
  if (error)
    return (
      <div className="text-center text-red-500">Error: {error.message}</div>
    )
  if (!data) return <div className="text-center text-gray-500">No data</div>

  const onChange =
    (key: keyof WordConfig) => (value: WordConfig[typeof key]) => {
      mutate(
        (prev) => {
          return {
            splitWords: [],
            wordMappings: {},
            ...prev,
            [key]: value,
          }
        },
        { revalidate: false },
      )
    }

  const { splitWords, wordMappings } = data
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader>
          <h1 className="text-3xl font-bold">Words Management</h1>
          <p className=" text-gray-600">Manage your words and mappings here.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Split Words</h2>
            <p className="text-gray-600 mb-4">
              Words that should be split into multiple words.
            </p>
            <SplitWordsEditor
              splitWords={splitWords}
              onChange={onChange('splitWords')}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Word Mappings</h2>
            <p className="text-gray-600 mb-4">
              Words that should be mapped to other words.
            </p>
            <WordMappingsEditor
              wordMappings={wordMappings}
              onChange={onChange('wordMappings')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end items-center gap-4 p-6 w-full">
            <Button
              onClick={() => {
                if (data != null) {
                  trigger(data)
                }
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
