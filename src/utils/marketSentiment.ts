export interface SentimentData {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function calculateMarketSentiment(signalStrength: number | null | undefined): SentimentData {
  if (signalStrength === null || signalStrength === undefined) {
    return {
      label: 'Unknown',
      color: 'text-slate-400',
      bgColor: 'bg-slate-800/50',
      borderColor: 'border-slate-600',
    };
  }

  if (signalStrength > 8) {
    return {
      label: 'Extremely Positive',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-500',
    };
  } else if (signalStrength > 5) {
    return {
      label: 'Highly Positive',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600',
    };
  } else if (signalStrength > 2) {
    return {
      label: 'Positive',
      color: 'text-green-500',
      bgColor: 'bg-green-900/10',
      borderColor: 'border-green-700',
    };
  } else if (signalStrength > 0.5) {
    return {
      label: 'Slightly Positive',
      color: 'text-green-600',
      bgColor: 'bg-green-900/5',
      borderColor: 'border-green-800',
    };
  } else if (signalStrength >= -0.5) {
    return {
      label: 'Neutral',
      color: 'text-slate-400',
      bgColor: 'bg-slate-800/20',
      borderColor: 'border-slate-600',
    };
  } else if (signalStrength >= -2) {
    return {
      label: 'Slightly Negative',
      color: 'text-red-600',
      bgColor: 'bg-red-900/5',
      borderColor: 'border-red-800',
    };
  } else if (signalStrength >= -5) {
    return {
      label: 'Negative',
      color: 'text-red-500',
      bgColor: 'bg-red-900/10',
      borderColor: 'border-red-700',
    };
  } else if (signalStrength >= -8) {
    return {
      label: 'Highly Negative',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600',
    };
  } else {
    return {
      label: 'Strongly Negative',
      color: 'text-red-400',
      bgColor: 'bg-red-900/30',
      borderColor: 'border-red-500',
    };
  }
}
