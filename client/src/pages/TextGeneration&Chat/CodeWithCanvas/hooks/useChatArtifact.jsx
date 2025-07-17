//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/hooks/useChatArtifact.jsx

import { useState, useRef, useEffect } from 'react';
import { getPartialMarkerMatch, extractStartMarkerInfo } from '../helpers/streamingHelpers';

export const useChatArtifact = ({ onArtifactStart } = {}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');

  const [currentArtifact, setCurrentArtifact] = useState(null);
  const [artifactCollection, setArtifactCollection] = useState([]);

  const messagesEndRef = useRef(null);
  const artifactRef = useRef({
    collecting: false,
    language: '',
    content: '',
    id: null
  });

  const chatTextRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  const completeArtifact = (buffer, endPattern) => {
    const endIndex = buffer.indexOf(endPattern);
    const contentBeforeEnd = buffer.substring(0, endIndex);
    artifactRef.current.content += contentBeforeEnd;

    setArtifactCollection(prev =>
      prev.map(artifact =>
        artifact.id === artifactRef.current.id
          ? { ...artifact, content: artifactRef.current.content }
          : artifact
      )
    );

    artifactRef.current.collecting = false;
    return buffer.substring(endIndex + endPattern.length);
  };

  const processStreamChunk = (chunk) => {
    let buffer = chatTextRef.current + chunk;
    const startPattern = '[CODE_START:';
    const endPattern = '[CODE_END]';

    if (artifactRef.current.collecting) {
      if (buffer.includes(endPattern)) {
        buffer = completeArtifact(buffer, endPattern);
        chatTextRef.current = buffer;
        setStreamedText(buffer);
        return;
      }

      const partialEndMatch = getPartialMarkerMatch(buffer, endPattern);
      if (partialEndMatch > 0) {
        const contentUpToMarker = buffer.substring(0, buffer.length - partialEndMatch);
        artifactRef.current.content += contentUpToMarker;

        setArtifactCollection(prev =>
          prev.map(artifact =>
            artifact.id === artifactRef.current.id
              ? { ...artifact, content: artifactRef.current.content }
              : artifact
          )
        );

        setCurrentArtifact(prev =>
          !prev || prev.id !== artifactRef.current.id
            ? prev
            : { ...prev, content: artifactRef.current.content }
        );

        chatTextRef.current = buffer.substring(buffer.length - partialEndMatch);
        return;
      }

      artifactRef.current.content += chunk;

      setArtifactCollection(prev =>
        prev.map(artifact =>
          artifact.id === artifactRef.current.id
            ? { ...artifact, content: artifactRef.current.content }
            : artifact
        )
      );

      setCurrentArtifact(prev =>
        !prev || prev.id !== artifactRef.current.id
          ? prev
          : { ...prev, content: artifactRef.current.content }
      );

      return;
    }

    const markerInfo = extractStartMarkerInfo(buffer, startPattern);
    if (markerInfo) {
      const { startIndex, closingBracketIndex, language } = markerInfo;

      chatTextRef.current = buffer.substring(0, startIndex);
      setStreamedText(chatTextRef.current + `[Code: ${language}]`);

      artifactRef.current = {
        collecting: true,
        language,
        content: '',
        id: Date.now()
      };

      const newArtifact = {
        id: artifactRef.current.id,
        type: 'code',
        language,
        content: '',
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code`
      };

      setArtifactCollection(prev => [...prev, newArtifact]);
      setCurrentArtifact(newArtifact);
      onArtifactStart?.();

      const remainingContent = buffer.substring(closingBracketIndex + 1);
      chatTextRef.current = '';
      if (remainingContent) {
        processStreamChunk(remainingContent);
      }
      return;
    }

    const partialStartMatch = getPartialMarkerMatch(buffer, startPattern);
    if (partialStartMatch > 0) {
      chatTextRef.current = buffer;
      setStreamedText(buffer);
      return;
    }

    chatTextRef.current = buffer;
    setStreamedText(buffer);
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    console.clear();
    console.log('Starting new message request...');

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    chatTextRef.current = '';
    artifactRef.current = { collecting: false, language: '', content: '', id: null };
    setStreamedText('');
    setCurrentArtifact(null);

    try {
      const queryParams = encodeURIComponent(
        JSON.stringify({ messages: [...messages, userMessage] })
      );
      const eventSource = new EventSource(
        `http://localhost:8000/code?message=${queryParams}`
      );

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          console.log('Stream complete!');
          eventSource.close();

          const finalContent = artifactRef.current.collecting
            ? chatTextRef.current + `[Code: ${artifactRef.current.language}]`
            : chatTextRef.current;

          setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
          setStreamedText('');
          setIsLoading(false);
          return;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.content) {
            processStreamChunk(data.content);
          }
        } catch (error) {
          console.error('Error processing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);

        if (!chatTextRef.current) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
          ]);
        }
      };
    } catch (error) {
      console.error('Error setting up event source:', error);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ]);
    }
  };

  const clearAllArtifacts = () => {
    setArtifactCollection([]);
    setCurrentArtifact(null);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    streamedText,
    currentArtifact,
    artifactCollection,
    messagesEndRef,
    sendMessage,
    clearAllArtifacts,
    setCurrentArtifact
  };
};

/**
 * useChatArtifact.jsx
 *
 * A custom React hook for managing real-time chat interactions with support for streamed
 * code artifact extraction. It tracks streaming messages, user inputs, assistant responses,
 * and detects `[CODE_START:<language>]... [CODE_END]` markers to extract and manage code blocks.
 *
 * Key Features:
 * - Handles Server-Sent Events (SSE) with auto-parsing of streamed data
 * - Extracts code artifacts from custom markers and tracks them with metadata
 * - Maintains full chat history, streamed text, and auto-scroll references
 * - Emits event when code artifact begins (to trigger UI updates like opening side panels)
 * - Allows dynamic update of current artifact while it's streaming
 * - Supports recovery from malformed JSON, partial markers, or chunk boundaries
 *
 * Dependencies:
 * - `streamingHelpers.js` with `getPartialMarkerMatch` and `extractStartMarkerInfo`
 * - Uses native EventSource API (SSE)
 * - Tailored for use with `CodeWithCanvas` page and `ArtifactPanel`
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/hooks/useChatArtifact.jsx
 */
