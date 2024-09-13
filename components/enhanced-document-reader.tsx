'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Square } from 'lucide-react'

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
      <Button onClick={isPlaying ? handlePause : handlePlay} variant="outline" size="icon" aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button onClick={handleStop} variant="outline" size="icon" aria-label="Stop">
        <Square className="h-4 w-4" />
      </Button>
    </div>
  )
}

const DocumentViewer = ({ content }: { content: string }) => (
  <Card className="h-[400px]">
    <CardHeader>
      <CardTitle>Document Viewer</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px]">
        <p className="text-sm">{content}</p>
      </ScrollArea>
    </CardContent>
  </Card>
)

const SummaryGenerator = ({ onGenerate }: { onGenerate: (level: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Summary Generator</CardTitle>
    </CardHeader>
    <CardContent>
      <Select onValueChange={onGenerate}>
        <SelectTrigger>
          <SelectValue placeholder="Select summary level" />
        </SelectTrigger>
        <SelectContent>
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
    <Card>
      <CardHeader>
        <CardTitle>Ask a Question</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here"
          />
          <Button onClick={() => onAsk(question)}>Ask</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const NoteTaker = ({ notes, onNotesChange }: { notes: string, onNotesChange: (notes: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Notes</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Take your notes here"
        className="h-[200px]"
      />
    </CardContent>
  </Card>
)

export default function EnhancedDocumentReader() {
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
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DocumentViewer content={document} />
          <Card>
            <CardHeader>
              <CardTitle>Text-to-Speech</CardTitle>
            </CardHeader>
            <CardContent>
              <TextToSpeech text={document} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <SummaryGenerator onGenerate={handleGenerateSummary} />
          <QuestionAsker onAsk={handleAskQuestion} />
          <NoteTaker notes={notes} onNotesChange={setNotes} />
        </div>
      </div>
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{summary}</p>
            <div className="mt-4">
              <TextToSpeech text={summary} />
            </div>
          </CardContent>
        </Card>
      )}
      {answer && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{answer}</p>
            <div className="mt-4">
              <TextToSpeech text={answer} />
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">Loading...</div>
        </div>
      )}
    </div>
  )
}