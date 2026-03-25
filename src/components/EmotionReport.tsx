/**
 * @module EmotionReport
 * @description React component that visualizes the results of emotion
 * analysis, showing detected emotions, triggers, and aggression scores.
 */

import React from 'react';
import type { EmotionAnalysis } from '../types';

/**
 * Props for the EmotionReport component
 */
export interface EmotionReportProps {
  /** The emotion analysis to display */
  analysis: EmotionAnalysis | null;
  /** Whether to show detailed trigger information */
  showTriggers?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/**
 * EmotionReport visualizes emotion analysis results with color-coded
 * indicators for aggression level, dominant emotion, and triggers.
 *
 * @example
 * ```tsx
 * <EmotionReport analysis={analysisResult} showTriggers />
 * ```
 */
export const EmotionReport: React.FC<EmotionReportProps> = ({
  analysis,
  showTriggers = true,
  className,
}) => {
  if (!analysis) {
    return <div className={className}>No analysis available.</div>;
  }

  const aggressionColor =
    analysis.aggressionScore >= 70 ? 'red' :
    analysis.aggressionScore >= 40 ? 'orange' : 'green';

  return (
    <div className={className} data-testid="emotion-report">
      <h3>Emotion Analysis Report</h3>

      <div>
        <strong>Aggression Score: </strong>
        <span style={{ color: aggressionColor }}>
          {analysis.aggressionScore}/100
        </span>
      </div>

      <div>
        <strong>Dominant Emotion: </strong>
        <span>{analysis.dominantEmotion}</span>
      </div>

      <div>
        <strong>Sentiment: </strong>
        <span>{analysis.sentiment.score > 0 ? 'Positive' : analysis.sentiment.score < 0 ? 'Negative' : 'Neutral'}</span>
      </div>

      {analysis.flagged && (
        <div role="alert">
          This message has been flagged for high aggression.
        </div>
      )}

      {showTriggers && analysis.triggers.length > 0 && (
        <div>
          <h4>Triggers Identified ({analysis.triggers.length})</h4>
          <ul>
            {analysis.triggers.map((trigger) => (
              <li key={trigger.id}>
                <strong>[{trigger.severity}]</strong> {trigger.type}: &quot;{trigger.matchedText}&quot;
                {trigger.suggestion && <em> — {trigger.suggestion}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p>{analysis.summary}</p>
      </div>
    </div>
  );
};
