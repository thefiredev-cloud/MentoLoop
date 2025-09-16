// React Hooks for GPT-5 Integration
// hooks/use-gpt5.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Main GPT-5 chat hook with streaming support
export function useGPT5Chat(conversationId?: Id<'conversations'>) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { user } = useUser();
  const sendMessage = useMutation(api.conversations.sendMessage);
  const conversationHistory = useQuery(
    api.conversations.getHistory,
    conversationId ? { conversationId } : 'skip'
  );

  useEffect(() => {
    if (conversationHistory) {
      setMessages(conversationHistory);
    }
  }, [conversationHistory]);

  const sendChatMessage = useCallback(async (
    content: string,
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    setStreamingContent('');
    
    // Add user message
    const userMessage = { 
      role: 'user' as const, 
      content, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (options.stream) {
        // Streaming request
        abortControllerRef.current = new AbortController();
        
        const response = await fetch('/api/gpt5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            stream: true,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error('Stream failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save to Convex
                  if (conversationId) {
                    await sendMessage({
                      conversationId,
                      role: 'assistant',
                      content: fullContent,
                    });
                  }
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: fullContent,
                    timestamp: Date.now(),
                  }]);
                  setStreamingContent('');
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    fullContent += parsed.text;
                    setStreamingContent(fullContent);
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          }
        }
      } else {
        // Non-streaming request
        const response = await fetch('/api/gpt5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            stream: false,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          }),
        });

        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.content,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save to Convex
        if (conversationId) {
          await sendMessage({
            conversationId,
            role: 'assistant',
            content: data.content,
          });
        }

        return data.content;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, sendMessage]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage: sendChatMessage,
    stopStreaming,
    clearMessages,
  };
}

// Hook for AI-powered matching
export function useAIMatching() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const performMatch = useMutation(api.gpt5.performMentorMatch);

  const findMatches = useCallback(async (
    studentId: Id<'students'>,
    preferences: any,
    criteria: any
  ) => {
    setIsMatching(true);
    try {
      const results = await performMatch({
        studentId,
        preferences,
        matchingCriteria: criteria,
      });
      setMatchResults(results);
      return results;
    } catch (error) {
      console.error('Matching failed:', error);
      throw error;
    } finally {
      setIsMatching(false);
    }
  }, [performMatch]);

  return {
    findMatches,
    isMatching,
    matchResults,
  };
}

// Hook for generating evaluations
export function useAIEvaluation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateEval = useMutation(api.gpt5.generateEvaluation);

  const generateEvaluation = useCallback(async (params: {
    studentId: Id<'students'>;
    rotationId: Id<'rotations'>;
    evaluationType: 'midterm' | 'final' | 'weekly';
    performanceData: any;
    preceptorNotes: string;
  }) => {
    setIsGenerating(true);
    try {
      const result = await generateEval(params);
      return result;
    } catch (error) {
      console.error('Evaluation generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [generateEval]);

  return {
    generateEvaluation,
    isGenerating,
  };
}

// Hook for clinical documentation
export function useClinicalDocumentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentation, setDocumentation] = useState<string | null>(null);

  const generateDocumentation = useCallback(async (
    sessionNotes: string,
    objectives: string[],
    performance: any
  ) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gpt5/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionNotes,
          objectives,
          performance,
        }),
      });

      if (!response.ok) throw new Error('Documentation generation failed');

      const data = await response.json();
      setDocumentation(data.documentation);
      return data.documentation;
    } catch (error) {
      console.error('Documentation error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDocumentation,
    isGenerating,
    documentation,
  };
}

// Hook for learning path generation
export function useLearningPath() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const generatePath = useMutation(api.gpt5.generateLearningPath);

  const generateLearningPath = useCallback(async (
    studentId: Id<'students'>,
    assessmentResults: any,
    timeframe: any
  ) => {
    setIsGenerating(true);
    try {
      const path = await generatePath({
        studentId,
        assessmentResults,
        timeframe,
      });
      setLearningPath(path);
      return path;
    } catch (error) {
      console.error('Learning path generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [generatePath]);

  return {
    generateLearningPath,
    isGenerating,
    learningPath,
  };
}

// Hook for real-time AI suggestions
export function useAISuggestions(context: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!context || context.length < 10) {
      setSuggestions([]);
      return;
    }

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/gpt5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'Generate 3 concise suggestions for completing this thought.'
              },
              {
                role: 'user',
                content: `Context: ${context}\nGenerate 3 brief completion suggestions.`
              }
            ],
            temperature: 0.8,
            maxTokens: 150,
          }),
        });

        const data = await response.json();
        const suggestionList = data.content
          .split('\n')
          .filter((s: string) => s.trim())
          .slice(0, 3);
        
        setSuggestions(suggestionList);
      } catch (error) {
        console.error('Suggestions error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [context]);

  return { suggestions, isLoading };
}

// Hook for AI-powered search
export function useAISearch() {
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string, filters?: any) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/gpt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a search assistant. Analyze the query and return relevant structured results.'
            },
            {
              role: 'user',
              content: `Search query: ${query}\nFilters: ${JSON.stringify(filters)}\nReturn JSON array of relevant results.`
            }
          ],
          temperature: 0.3,
          maxTokens: 1000,
        }),
      });

      const data = await response.json();
      const parsedResults = JSON.parse(data.content);
      setResults(parsedResults);
      return parsedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    search,
    results,
    isSearching,
  };
}
