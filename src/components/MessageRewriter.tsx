/**
 * @module MessageRewriter
 * @description React component providing a message input/output interface
 * with tone selection for rewriting hostile communications.
 */

import React, { useState, useCallback } from 'react';
import type { ToneTarget, RewriteResult } from '../types';

/**
 * Props for the MessageRewriter component
 */
export interface MessageRewriterProps {
  /** Callback when a rewrite is completed */
  onRewrite?: (result: RewriteResult) => void;
  /** Default tone selection */
  defaultTone?: ToneTarget;
  /** Maximum message length */
  maxLength?: number;
  /** Custom CSS class name */
  className?: string;
}

/**
 * MessageRewriter provides a side-by-side input/output interface
 * for rewriting hostile messages with tone selection.
 *
 * @example
 * ```tsx
 * <MessageRewriter
 *   defaultTone="neutral"
 *   onRewrite={(result) => console.log(result.rewrittenText)}
 * />
 * ```
 */
export const MessageRewriter: React.FC<MessageRewriterProps> = ({
  onRewrite,
  defaultTone = 'neutral',
  maxLength = 5000,
  className,
}) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneTarget>(defaultTone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [courtScore, setCourtScore] = useState<number | null>(null);

  const handleRewrite = useCallback(async () => {
    if (!inputText.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      // RewriteEngine would be injected via context or props in production
      // Placeholder for demonstration
      setOutputText('Rewritten message would appear here.');
      setCourtScore(85);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, selectedTone, isProcessing, onRewrite]);

  return (
    <div className={className} data-testid="message-rewriter">
      <div>
        <label htmlFor="input-message">Original Message</label>
        <textarea
          id="input-message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, maxLength))}
          placeholder="Paste the message you want to de-escalate..."
          rows={6}
        />
        <span>{inputText.length}/{maxLength}</span>
      </div>

      <div>
        <label>Tone</label>
        <select
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value as ToneTarget)}
        >
          <option value="neutral">Neutral</option>
          <option value="warm">Warm</option>
          <option value="firm">Firm</option>
        </select>
        <button onClick={handleRewrite} disabled={isProcessing || !inputText.trim()}>
          {isProcessing ? 'Rewriting...' : 'Rewrite Message'}
        </button>
      </div>

      <div>
        <label>Rewritten Message</label>
        <textarea id="output-message" value={outputText} readOnly rows={6} />
        {courtScore !== null && (
          <span>Court Readiness Score: {courtScore}/100</span>
        )}
      </div>
    </div>
  );
};
