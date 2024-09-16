'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Square, FileUp, Send } from 'lucide-react'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production
})

const TextToSpeech = ({ text }: { text: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handlePlay = () => {
    if (!utteranceRef.current) {
      utteranceRef.current = new SpeechSynthesisUtterance(text)
    }
    speechSynthesis.speak(utteranceRef.current)
    setIsPlaying(true)
  }

  const handlePause = () => {
    speechSynthesis.pause()
    setIsPlaying(false)
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

  return (
    <div className="flex space-x-2">
      <Button
        onClick={isPlaying ? handlePause : handlePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        variant="outline"
        className="bg-green-500 text-white hover:bg-green-600"
      >
        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button
        onClick={handleStop}
        aria-label="Stop"
        variant="outline"
        className="bg-red-500 text-white hover:bg-red-600"
      >
        <Square className="h-4 w-4 mr-2" />
        Stop
      </Button>
    </div>
  )
}

const DocumentViewer = ({ content }: { content: string }) => (
  <Card className="h-[400px] bg-purple-100">
    <CardHeader className="bg-purple-200">
      <CardTitle className="text-purple-800">Document Viewer</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px]">
        <p className="text-purple-900">{content}</p>
      </ScrollArea>
    </CardContent>
  </Card>
)

const SummaryGenerator = ({ onGenerate }: { onGenerate: (level: string) => void }) => (
  <Card className="bg-blue-100">
    <CardHeader className="bg-blue-200">
      <CardTitle className="text-blue-800">Summary Generator</CardTitle>
    </CardHeader>
    <CardContent>
      <Select onValueChange={onGenerate}>
        <SelectTrigger className="w-full bg-blue-50 border-blue-300 focus:ring-blue-500">
          <SelectValue placeholder="Select summary level" />
        </SelectTrigger>
        <SelectContent className="bg-blue-50 border border-blue-300 shadow-md rounded-md">
          <SelectItem value="basic">Basic/Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="moderate">Moderate Experience</SelectItem>
          <SelectItem value="expert">Expert</SelectItem>
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
)

const QuestionAsker = ({ onAsk }: { onAsk: (question: string) => void }) => {
  const [question, setQuestion] = useState("")

  return (
    <Card className="bg-green-100">
      <CardHeader className="bg-green-200">
        <CardTitle className="text-green-800">Ask a Question</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here"
            className="flex-grow bg-green-50 border-green-300 focus:ring-green-500"
          />
          <Button
            onClick={() => onAsk(question)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Ask
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const NoteTaker = ({ notes, onNotesChange }: { notes: string, onNotesChange: (notes: string) => void }) => (
  <Card className="bg-yellow-100">
    <CardHeader className="bg-yellow-200">
      <CardTitle className="text-yellow-800">Notes</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Take your notes here"
        className="h-[200px] bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
      />
    </CardContent>
  </Card>
)

export default function Component() {
  const [document, setDocument] = useState("")
  const [summary, setSummary] = useState("")
  const [answer, setAnswer] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      setError(null)
      try {
        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type)

        if (file.type === 'application/pdf') {
          const formData = new FormData()
          formData.append('file', file)
          console.log('Sending request to parse PDF')
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData,
          })
          console.log('Response received:', response.status, response.statusText)

          const contentType = response.headers.get('content-type')
          console.log('Content-Type:', contentType)

          let data
          try {
            data = await response.json()
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError)
            const text = await response.text()
            console.error('Raw response:', text)
            throw new Error('Invalid JSON response from server')
          }

          console.log('Response data:', data)

          if (response.ok && data.text) {
            setDocument(data.text)
          } else {
            throw new Error(data.error || 'Error parsing PDF')
          }
        } else if (file.type === 'text/plain') {
          const text = await file.text()
          setDocument(text)
        } else {
          throw new Error('Unsupported file type. Please upload a PDF or text file.')
        }
      } catch (err) {
        console.error('Error in handleFileUpload:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while processing the file.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleGenerateSummary = async (level: string) => {
    setIsLoading(true)
    setError(null)

    if (!document.trim()) {
      setError("The document is empty. Please upload or enter some text before generating a summary.")
      setIsLoading(false)
      return
    }

    try {
      console.log('Generating summary for level:', level)

      // Split the document into chunks of approximately 25000 characters
      const chunkSize = 25000
      const chunks = []
      for (let i = 0; i < document.length; i += chunkSize) {
        chunks.push(document.slice(i, i + chunkSize))
      }

      let fullSummary = ""

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log(`Processing chunk ${i + 1} of ${chunks.length}`)

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k", // Using a model with larger context window
          messages: [
            { role: "system", content: `You are a helpful assistant that generates ${level} summaries of documents. This is part ${i + 1} of ${chunks.length} of the document.` },
            { role: "user", content: `Please provide a ${level} summary of the following part of the document: ${chunk}` }
          ],
        })

        console.log(`Received response for chunk ${i + 1}`)

        if (response.choices && response.choices.length > 0 && response.choices[0].message) {
          fullSummary += response.choices[0].message.content + "\n\n"
        } else {
          throw new Error(`Unexpected response structure from OpenAI API for chunk ${i + 1}`)
        }
      }

      // Final summarization of all chunks
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          { role: "system", content: `You are a helpful assistant that generates ${level} summaries of documents.` },
          { role: "user", content: `Please provide a final ${level} summary of the entire document based on these chunk summaries: ${fullSummary}` }
        ],
      })

      if (finalResponse.choices && finalResponse.choices.length > 0 && finalResponse.choices[0].message) {
        setSummary(finalResponse.choices[0].message.content || "Failed to generate summary.")
      } else {
        throw new Error('Unexpected response structure from OpenAI API for final summary')
      }

    } catch (err) {
      console.error("Error generating summary:", err)
      setError(`An error occurred while generating the summary: ${err instanceof Error ? err.message : String(err)}. This may be due to API rate limits or network issues. Please try again in a few moments.`)

      // Fallback to a simple summary
      const fallbackSummary = `Unable to generate a ${level} summary due to an error. Here's a basic summary: This document contains approximately ${document.split(' ').length} words.`
      setSummary(fallbackSummary)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAskQuestion = async (question: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          { role: "system", content: "You are a helpful assistant that answers questions about documents." },
          { role: "user", content: `Given the following document: ${document}\n\nPlease answer this question: ${question}` }
        ],
      })
      setAnswer(response.choices[0].message?.content || "Failed to generate an answer.")
    } catch (err) {
      console.error("Error answering question:", err)
      setError(`An error occurred while answering the question: ${err instanceof Error ? err.message : String(err)}. This may be due to API rate limits or network issues. Please try again in a few moments.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4 bg-gray-100">
      <style jsx global>{`
        .select-content {
          background-color: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
        }
      `}</style>
      <h1 className="text-3xl font-bold text-center text-purple-800">Enhanced Document Reader and Analyzer</h1>
      <div className="space-y-4">
        <Card className="bg-orange-100">
          <CardHeader className="bg-orange-200">
            <CardTitle className="text-orange-800">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <Button
                variant="outline"
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleButtonClick}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Choose file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.txt"
                className="hidden"
              />
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <DocumentViewer content={document} />
            <Card className="bg-teal-100">
              <CardHeader className="bg-teal-200">
                <CardTitle className="text-teal-800">Text-to-Speech</CardTitle>
              </CardHeader>
              <CardContent>
                <TextToSpeech text={document} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <SummaryGenerator onGenerate={handleGenerateSummary} />
            <QuestionAsker onAsk={handleAskQuestion} />
            <NoteTaker notes={notes} onNotesChange={setNotes} />
          </div>
        </div>
        {summary && (
          <Card className="bg-indigo-100">
            <CardHeader className="bg-indigo-200">
              <CardTitle className="text-indigo-800">Generated Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-900">{summary}</p>
              <TextToSpeech text={summary} />
            </CardContent>
          </Card>
        )}
        {answer && (
          <Card className="bg-pink-100">
            <CardHeader className="bg-pink-200">
              <CardTitle className="text-pink-800">Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pink-900">{answer}</p>
              <TextToSpeech text={answer} />
            </CardContent>
          </Card>
        )}
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded text-center">
            <p className="mb-2">Processing...</p>
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  )
}
