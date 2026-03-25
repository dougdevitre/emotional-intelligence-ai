/**
 * @module ToneSelector
 * @description React component for selecting the target tone for message rewriting.
 * Provides neutral, warm, and firm options with descriptions.
 */

import React from 'react';
import type { ToneTarget } from '../types';

/**
 * Props for the ToneSelector component
 */
export interface ToneSelectorProps {
  /** Currently selected tone */
  value: ToneTarget;
  /** Callback when tone changes */
  onChange: (tone: ToneTarget) => void;
  /** Custom CSS class name */
  className?: string;
}

/** Descriptions for each tone option */
const TONE_DESCRIPTIONS: Record<ToneTarget, string> = {
  neutral: 'Professional and factual. Best for court communications and attorney correspondence.',
  warm: 'Empathetic and collaborative. Best for co-parenting discussions and mediation.',
  firm: 'Direct and assertive without aggression. Best for boundary-setting and enforcement.',
};

/**
 * ToneSelector provides a visual selector for choosing between
 * neutral, warm, and firm tone targets.
 *
 * @example
 * ```tsx
 * <ToneSelector value="neutral" onChange={(tone) => setTone(tone)} />
 * ```
 */
export const ToneSelector: React.FC<ToneSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const tones: ToneTarget[] = ['neutral', 'warm', 'firm'];

  return (
    <div className={className} data-testid="tone-selector" role="radiogroup" aria-label="Tone selection">
      {tones.map((tone) => (
        <label key={tone}>
          <input
            type="radio"
            name="tone"
            value={tone}
            checked={value === tone}
            onChange={() => onChange(tone)}
          />
          <span>{tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
          <p>{TONE_DESCRIPTIONS[tone]}</p>
        </label>
      ))}
    </div>
  );
};
