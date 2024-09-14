'use client'

import React, { useState, useRef } from 'react'

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
      <button onClick={isPlaying ? handlePause : handlePlay} className="px-4 py-2 bg-blue-500 text-white rounded">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={handleStop} className="px-4 py-2 bg-red-500 text-white rounded">
        Stop
      </button>
    </div>
  )
}

const DocumentViewer = ({ content }: { content: string }) => (
  <div className="border p-4 h-[400px] overflow-auto">
    <h2 className="text-xl font-bold mb-2">Document Viewer</h2>
    <p className="text-sm">{content}</p>
  </div>
)

const SummaryGenerator = ({ onGenerate }: { onGenerate: (level: string) => void }) => (
  <div className="border p-4">
    <h2 className="text-xl font-bold mb-2">Summary Generator</h2>
    <select onChange={(e) => onGenerate(e.target.value)} className="w-full p-2 border rounded">
      <option value="">Select summary level</option>
      <option value="basic">Basic/Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="moderate">Moderate Experience</option>
      <option value="expert">Expert</option>
    </select>
  </div>
)

const QuestionAsker = ({ onAsk }: { onAsk: (question: string) => void }) => {
  const [question, setQuestion] = useState("")

  return (
    <div className="border p-4">
      <h2 className="text-xl font-bold mb-2">Ask a Question</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={() => onAsk(question)} className="px-4 py-2 bg-green-500 text-white rounded">
          Ask
        </button>
      </div>
    </div>
  )
}

const NoteTaker = ({ notes, onNotesChange }: { notes: string, onNotesChange: (notes: string) => void }) => (
  <div className="border p-4">
    <h2 className="text-xl font-bold mb-2">Notes</h2>
    <textarea
      value={notes}
      onChange={(e) => onNotesChange(e.target.value)}
      placeholder="Take your notes here"
      className="w-full h-[200px] p-2 border rounded"
    />
  </div>
)

const EnhancedDocumentReader = () => {
  const [document, setDocument] = useState("This is a sample document content. In a real application, this would be the uploaded document's text.")
  const [summary, setSummary] = useState("")
  const [answer, setAnswer] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      // Simulating file processing
      setTimeout(() => {
        setDocument(`Content of ${file.name}: This is a placeholder for the actual file content.`)
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleGenerateSummary = async (level: string) => {
    setIsLoading(true)
    // Simulating summary generation
    setTimeout(() => {
      setSummary(`This is a ${level} summary of the document.`)
      setIsLoading(false)
    }, 1000)
  }

  const handleAskQuestion = async (question: string) => {
    setIsLoading(true)
    // Simulating question answering
    setTimeout(() => {
      setAnswer(`Here's an answer to your question: "${question}"`)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Enhanced Document Reader and Analyzer</h1>
      <div className="border p-4">
        <h2 className="text-xl font-bold mb-2">Upload Document</h2>
        <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" className="w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DocumentViewer content={document} />
          <div className="border p-4">
            <h2 className="text-xl font-bold mb-2">Text-to-Speech</h2>
            <TextToSpeech text={document} />
          </div>
        </div>
        <div className="space-y-6">
          <SummaryGenerator onGenerate={handleGenerateSummary} />
          <QuestionAsker onAsk={handleAskQuestion} />
          <NoteTaker notes={notes} onNotesChange={setNotes} />
        </div>
      </div>
      {summary && (
        <div className="border p-4">
          <h2 className="text-xl font-bold mb-2">Generated Summary</h2>
          <p>{summary}</p>
          <div className="mt-4">
            <TextToSpeech text={summary} />
          </div>
        </div>
      )}
      {answer && (
        <div className="border p-4">
          <h2 className="text-xl font-bold mb-2">Answer</h2>
          <p>{answer}</p>
          <div className="mt-4">
            <TextToSpeech text={answer} />
          </div>
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">Loading...</div>
        </div>
      )}
    </div>
  )
}

export default EnhancedDocumentReader