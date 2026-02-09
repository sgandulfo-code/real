
import React from 'react';

interface Props {
  value: number;
  onChange?: (val: number) => void;
  interactive?: boolean;
}

const Rating: React.FC<Props> = ({ value, onChange, interactive = false }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
        >
          <svg
            className={`w-4 h-4 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default Rating;
