'use client';

import React from 'react';
import { CompletenessResult } from '@/utils/profile-validation';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileCompletenessTrackerProps {
  data: CompletenessResult;
}

export const ProfileCompletenessTracker: React.FC<ProfileCompletenessTrackerProps> = ({ data }) => {
  const { total, sections } = data;

  const getStatusColor = (percent: number) => {
    if (percent < 40) return 'text-error';
    if (percent < 80) return 'text-amber-400';
    return 'text-success';
  };

  const getProgressColor = (percent: number) => {
    if (percent < 40) return 'bg-error/10';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-success/10';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-card/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 pointer-events-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Percentage */}
          <div className="flex flex-col items-center justify-center min-w-[80px]">
            <span className={cn("text-3xl font-bold tracking-tighter", getStatusColor(total))}>
              {total}%
            </span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">
              COMPLETENESS
            </span>
          </div>

          {/* Progress Bar & Sections */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex gap-4">
                {Object.values(sections).map((section, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        section.isComplete ? "bg-success/10 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"
                    )} />
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      section.isComplete ? "text-success" : "text-muted-foreground"
                    )}>
                      {section.title.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                {total === 100 ? (
                    <><CheckCircle2 className="w-3 h-3 text-success" /> Perfect Score</>
                ) : (
                    <><AlertCircle className="w-3 h-3 text-amber-400" /> Almost there</>
                )}
              </span>
            </div>
            
            <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={cn("absolute top-0 left-0 h-full transition-all duration-500 ease-out", getProgressColor(total))}
                    style={{ width: `${total}%` }}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
