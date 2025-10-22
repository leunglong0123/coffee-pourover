# Timer Architecture Documentation

## Overview

This document explains the timer system architecture in the coffee pourover application, detailing how multiple time tracking systems work together to manage brewing steps.

## Time Tracking Systems

The application uses **3 independent time tracking systems** that work in coordination:

### 1. Global Timer (`currentTime`)

```
Location: src/context/TimerContext.tsx:30
Updates: Every 100ms via setInterval
Range: 0 → totalTime (e.g., 0 → 180 seconds)
Purpose: The MASTER clock that never stops
Formula: elapsedTime = (Date.now() - startTime) / 1000
```

**Key Characteristics:**
- This is the only timer that actually runs/increments
- Starts from 0 when brewing begins
- Continuously increases until it reaches `totalTime`
- Managed by `setInterval` that updates every 100ms (10 times per second)
- Never resets during a brewing session (except on full timer reset)

### 2. Step Entered Time (`stepEnteredTime`)

```
Location: src/context/TimerContext.tsx:39
Updates: Only when the displayed step changes
Range: Records the currentTime value when you enter a step
Purpose: Marks the "start point" for each step
Example: Step 1 enters at 0s, Step 2 enters at 5s (if skipped)
```

**Key Characteristics:**
- Acts as a "checkpoint" or "bookmark" in time
- Resets every time you enter a new step (naturally or by skipping)
- Used as the reference point for calculating progress within a step
- Enables independent step countdown by creating a new time baseline

### 3. Step Progress (`stepProgressPercent`)

```
Location: src/context/TimerContext.tsx:315-327
Updates: Every 100ms (calculated, not stored)
Range: 0% → 100% for EACH step
Purpose: Shows progress within current step
Formula: (currentTime - stepEnteredTime) / stepDuration × 100
```

**Key Characteristics:**
- Not stored as state - calculated on every render
- Always relative to the current step's duration
- Resets to 0% when entering a new step
- Drives the visual progress bar

## How They Work Together

### Visual Timeline Example

```
Brewing Method: Step 1 (20s) → Step 2 (30s) → Step 3 (45s)
SCENARIO: User skips from Step 1 to Step 2 at 5 seconds

┌──────────────────────────────────────────────────────────────┐
│ Time: 0s - Timer starts                                     │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        0s    [Master clock starts]             │
│ stepEnteredTime:    0s    [Entered Step 1]                  │
│ currentStep:        Step 1 (20s duration)                   │
│ stepProgressPercent: 0%   [(0-0)/20 = 0%]                   │
│ remainingTime:      20s   [20 - (0-0) = 20s]                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Time: 5s - Still in Step 1                                  │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        5s    [Master clock running]            │
│ stepEnteredTime:    0s    [Still Step 1]                    │
│ currentStep:        Step 1 (20s duration)                   │
│ stepProgressPercent: 25%  [(5-0)/20 = 25%]                  │
│ remainingTime:      15s   [20 - (5-0) = 15s]                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Time: 5s - USER CLICKS SKIP! → Jump to Step 2              │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        5s    [Master clock unchanged]          │
│ stepEnteredTime:    5s    [RESET! Entered Step 2]          │
│ currentStep:        Step 2 (30s duration)                   │
│ stepProgressPercent: 0%   [(5-5)/30 = 0%]                   │
│ remainingTime:      30s   [30 - (5-5) = 30s]                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Time: 10s - Now in Step 2                                   │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        10s   [Master clock running]            │
│ stepEnteredTime:    5s    [Still Step 2]                    │
│ currentStep:        Step 2 (30s duration)                   │
│ stepProgressPercent: 16.7% [(10-5)/30 = 16.7%]             │
│ remainingTime:      25s   [30 - (10-5) = 25s]               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Time: 35s - Step 2 completes (5s entry + 30s duration)     │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        35s   [Master clock running]            │
│ stepEnteredTime:    5s    [Still Step 2]                    │
│ stepProgressPercent: 100% [(35-5)/30 = 100%]                │
│ remainingTime:      0s    [30 - (35-5) = 0s]                │
│ → AUTO-ADVANCE to Step 3 triggered!                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Time: 35s - Auto-advanced to Step 3                         │
├──────────────────────────────────────────────────────────────┤
│ currentTime:        35s   [Master clock unchanged]          │
│ stepEnteredTime:    35s   [RESET! Entered Step 3]          │
│ currentStep:        Step 3 (45s duration)                   │
│ stepProgressPercent: 0%   [(35-35)/45 = 0%]                 │
│ remainingTime:      45s   [45 - (35-35) = 45s]              │
└──────────────────────────────────────────────────────────────┘
```

## Bugs Fixed and Why They Occurred

### Bug 1: Timer Accumulated to Next Step After Skipping

**Symptom:** When skipping steps, the remaining time would show incorrectly large values (e.g., showing 95s remaining instead of 30s).

**Root Cause:**

The OLD calculation tried to determine when a step SHOULD naturally start by accumulating all previous step durations:

```typescript
// OLD CODE (BUGGY)
let stepStartTime = 0;
for (const step of brewingMethod.steps) {
  if (step.id === currentStep.id) break;
  stepStartTime += step.duration;  // Accumulates: 0, 20, 50, 95...
}

// Example: At 5s and viewing Step 2
// stepStartTime = 20s (Step 1 duration)
// stepEndTime = 20s + 30s = 50s
// remainingTime = 50s - 5s = 45s  ❌ WRONG!
```

**The Fix:**

Use the actual time when the step was entered (`stepEnteredTime`) instead of calculating when it should have started:

```typescript
// NEW CODE (FIXED)
const timeElapsedInStep = currentTime - stepEnteredTime;
const remainingTime = stepDuration - timeElapsedInStep;

// Example: At 5s and viewing Step 2 (entered at 5s)
// timeElapsedInStep = 5s - 5s = 0s
// remainingTime = 30s - 0s = 30s  ✅ CORRECT!
```

**Files Changed:**
- `src/context/TimerContext.tsx:297-308` - Updated `calculateStepProgress()`
- `src/components/StepDisplay.tsx:35-46` - Updated `remainingTime` calculation

### Bug 2: Components Didn't Sync After Skipping

**Symptom:** After skipping steps:
- Progress bar wouldn't fill correctly
- Water poured calculation was wrong
- Step wouldn't auto-advance when countdown reached 0

**Root Cause:**

All components calculated their values using different methods, creating inconsistencies:

```
OLD SYSTEM (INCONSISTENT):
┌──────────────────────────────────────────────────────────┐
│ 1. stepProgressPercent: Used accumulated time           │
│    → Wrong calculation → Wrong percentage               │
│ 2. remainingTime: Used accumulated time                 │
│    → Wrong calculation → Wrong remaining time           │
│ 3. waterPoured: Used stepProgressPercent                │
│    → Wrong percentage → Wrong water calculation         │
│ 4. No auto-advance logic                                │
│    → Timer reaches 0 but nothing happens                │
└──────────────────────────────────────────────────────────┘
```

**The Fix:**

All components now use the same source of truth: `(currentTime - stepEnteredTime)`

```
NEW SYSTEM (SYNCHRONIZED):
┌──────────────────────────────────────────────────────────┐
│ ALL components use: (currentTime - stepEnteredTime)     │
│                                                           │
│ 1. stepProgressPercent = (elapsed / duration) × 100     │
│ 2. remainingTime = duration - elapsed                    │
│ 3. waterPoured uses stepProgressPercent (now correct)   │
│ 4. Auto-advance when: elapsed >= duration               │
│                                                           │
│ All synced to the same calculation! ✅                   │
└──────────────────────────────────────────────────────────┘
```

**Files Changed:**
- `src/context/TimerContext.tsx:297-308` - Updated `calculateStepProgress()`
- `src/context/TimerContext.tsx:293-309` - Added auto-advance logic
- `src/components/StepDisplay.tsx:35-46` - Updated `remainingTime` calculation

### Bug 3: No Automatic Step Advancement

**Symptom:** When a step's countdown reached 0, it would stay on that step instead of advancing to the next one.

**Root Cause:**

There was no logic monitoring when a step completed and triggering advancement to the next step.

**The Fix:**

Added a `useEffect` hook that monitors step completion and automatically advances:

```typescript
// src/context/TimerContext.tsx:293-309
useEffect(() => {
  if (!isRunning || !currentStep || !brewingMethod) return;

  const timeElapsedInStep = currentTime - stepEnteredTime;

  // If the current step has completed, advance to the next one
  if (timeElapsedInStep >= currentStep.duration) {
    const currentStepIndex = brewingMethod.steps.findIndex(
      step => step.id === currentStep.id
    );
    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex < brewingMethod.steps.length) {
      setManualStepIndex(nextStepIndex);
    }
  }
}, [currentTime, stepEnteredTime, currentStep, brewingMethod, isRunning]);
```

## Key Implementation Details

### Step Change Detection

```typescript
// src/context/TimerContext.tsx:285-291
useEffect(() => {
  if (currentStep && currentStep.id !== previousStepId) {
    setStepEnteredTime(currentTime);  // Record when we entered this step
    setPreviousStepId(currentStep.id); // Track for next change
  }
}, [currentStep, previousStepId, currentTime]);
```

This effect:
1. Detects when `currentStep` changes (naturally or via skip)
2. Records the current time as the new baseline (`stepEnteredTime`)
3. Enables each step to count down independently

### Manual Skip Implementation

```typescript
// src/context/TimerContext.tsx:413-421
const skipToNextStep = () => {
  if (!currentStep || !nextStep || !brewingMethod) return;

  const currentDisplayIndex = brewingMethod.steps.findIndex(
    step => step.id === currentStep.id
  );

  // Set manual step to the next step
  setManualStepIndex(currentDisplayIndex + 1);
};
```

When user clicks skip:
1. Sets `manualStepIndex` to next step
2. This changes `currentStep` (via `getCurrentStep()`)
3. Step change detection fires
4. `stepEnteredTime` gets updated to current time
5. New step starts counting from its full duration

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TIMER ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────┘

                    setInterval (100ms)
                           │
                           ▼
                   ┌───────────────┐
                   │  currentTime  │ ◄── MASTER CLOCK
                   │  (0 → 180s)   │     Never stops
                   └───────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   Step     │  │  Progress  │  │  Remaining │
    │  Entered   │  │    Bar     │  │    Time    │
    │   Time     │  │  (0-100%)  │  │  (X secs)  │
    └─────┬──────┘  └────────────┘  └────────────┘
          │
          │ Updates on step change
          ▼
    Step changes? → YES → Record currentTime
                  → NO  → Keep existing value

All calculations use: (currentTime - stepEnteredTime)
```

## State Variables Summary

| Variable | Type | Purpose | Updates When |
|----------|------|---------|--------------|
| `currentTime` | number | Master clock | Every 100ms |
| `stepEnteredTime` | number | Step start marker | Step changes |
| `previousStepId` | string\|null | Track step changes | Step changes |
| `manualStepIndex` | number\|null | Manual step override | User skips |
| `stepProgressPercent` | number | Calculated progress | Every render |
| `isRunning` | boolean | Timer active | Start/stop |
| `isPaused` | boolean | Timer paused | Pause/resume |
| `totalTime` | number | Total duration | Timer starts |

## Critical Insights

### 1. The Master Clock Never Stops

```
currentTime is the ONLY timer that actually runs
         ↓
    0s → 1s → 2s → 3s → 4s → 5s → ... → 180s
         ↓
    Everything else is CALCULATED from it:

    • stepEnteredTime = "checkpoint" values
    • stepProgressPercent = calculated every 100ms
    • remainingTime = calculated every 100ms
    • waterPoured = calculated every 100ms
```

### 2. stepEnteredTime Creates Independence

By recording when each step is entered, we create a new baseline for calculations. This allows:
- Each step to count down its full duration
- Progress bar to reset to 0% on new steps
- Water calculations to track correctly
- Natural and skipped steps to work identically

### 3. Single Source of Truth

All time-based calculations derive from:
```
timeElapsedInStep = currentTime - stepEnteredTime
```

This ensures perfect synchronization across:
- Remaining time display
- Progress bar
- Water poured calculation
- Auto-advancement logic

## Testing Scenarios

### Scenario 1: Normal Flow (No Skipping)
```
✓ Step 1: 20s countdown → Auto-advance
✓ Step 2: 30s countdown → Auto-advance
✓ Step 3: 45s countdown → Complete
```

### Scenario 2: Skip Forward
```
✓ Step 1: At 5s, skip to Step 2
✓ Step 2: Shows 30s, counts down correctly
✓ Progress bar: Resets to 0%, fills to 100%
✓ Water poured: Updates based on Step 2 progress
✓ Auto-advance: Works when Step 2 completes
```

### Scenario 3: Multiple Skips
```
✓ Step 1: At 3s, skip to Step 2
✓ Step 2: At 8s, skip to Step 3
✓ Step 3: Shows 45s, counts down correctly
✓ All components sync correctly
```

## Future Considerations

### Potential Enhancements

1. **Pause during step transitions**
   - Could add a brief pause between steps for user preparation
   - Would require additional state tracking

2. **Skip backward**
   - Currently only supports forward skipping
   - Would need to handle water calculation adjustments

3. **Custom step durations**
   - Allow users to adjust durations mid-brew
   - Would require recalculating total time and step entered times

4. **Step history tracking**
   - Record actual time spent in each step
   - Useful for post-brew analysis

### Known Limitations

1. **Water calculation assumes linear progress**
   - Water is calculated proportionally to time elapsed
   - Real brewing may not always pour linearly

2. **No validation of skip timing**
   - Users can skip at any time
   - May skip before intended actions are complete

3. **Auto-advance timing**
   - Advances immediately when timer reaches 0
   - No grace period or warning

## References

- `src/context/TimerContext.tsx` - Main timer logic
- `src/components/StepDisplay.tsx` - Step UI and remaining time
- `src/components/Timer.tsx` - Overall timer display
- `src/models/index.ts` - Type definitions for BrewingStep, BrewingMethod
