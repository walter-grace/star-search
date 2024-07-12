'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Search, TrendingUp, AlertCircle, ChevronDown, Film, Monitor } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ModeToggle } from './ui/mode-toggle'

type FormData = {
  name: string
}

interface Person {
  name: string;
  known_for_department: string;
  known_for: Array<{
    title: string;
    media_type: string;
    release_date?: string;
  }>;
}

function formatSearchResults(data: any): JSX.Element {
  const results = data.results as Person[];

  return (
    <div className="space-y-6">
      {results.map((person, index) => (
        <div key={index} className="bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{person.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">Known for: {person.known_for_department}</p>
          {person.known_for && person.known_for.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-1">Famous works:</h4>
              <ul className="list-disc list-inside space-y-1">
                {person.known_for.map((work, workIndex) => (
                  <li key={workIndex} className="text-sm">
                    {work.media_type === 'movie' ? 
                      <Film className="inline-block w-4 h-4 mr-1" /> : 
                      <Monitor className="inline-block w-4 h-4 mr-1" />}
                    {work.title} ({work.media_type})
                    {work.release_date && ` - Released: ${work.release_date}`}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No famous works listed.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function StarSearch() {
  const [searchResult, setSearchResult] = useState<JSX.Element | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, watch } = useForm<FormData>()
  const searchTerm = watch('name')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setSearchResult(formatSearchResults(result))
    } catch (e) {
      console.error('Search error:', e)
      setError(`An error occurred while searching: ${(e as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePopularList = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/popular', {
        method: 'GET',
      })
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json()
        if (result.error) {
          throw new Error(result.error)
        }
        setSearchResult(formatSearchResults(result))
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error('Received non-JSON response from server')
      }
    } catch (e) {
      console.error('Popular list error:', e)
      setError(`An error occurred while fetching the popular list: ${(e as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className='max-w-2xl mx-auto flex justify-end mb-4'>
        <ModeToggle /> 
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Search for a Star</CardTitle>
          <CardDescription>
            Enter a name to search for information about a star or celebrity, 
            or check out who's on the top famous list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                {...register('name', { required: true })}
                placeholder="Enter a name"
                className="flex-grow"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-[160px]" disabled={isLoading}>
                    {isLoading ? (
                      'Loading...'
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handleSubmit(onSubmit)()}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handlePopularList}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Popular List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mt-4 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {searchResult && (
        <Card className="mt-4 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {searchResult}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}