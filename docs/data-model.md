# Data Model — Emotional Intelligence AI

## Entity Relationship Diagram

```mermaid
erDiagram
    MESSAGE {
        string id PK
        string rawContent
        string rewrittenContent
        string authorId FK
        string caseId FK
        string tone "neutral | warm | firm"
        number aggressionScore
        number courtReadinessScore
        datetime createdAt
        datetime rewrittenAt
    }

    EMOTION_ANALYSIS {
        string id PK
        string messageId FK
        number sentimentScore "-1.0 to 1.0"
        number aggressionScore "0-100"
        string dominantEmotion
        string[] detectedEmotions
        json triggerMap
        datetime analyzedAt
    }

    TRIGGER {
        string id PK
        string analysisId FK
        string type "accusation | threat | manipulation | contempt"
        string severity "low | medium | high | critical"
        number startIndex
        number endIndex
        string matchedText
        string category
    }

    REWRITE_RESULT {
        string id PK
        string messageId FK
        string originalText
        string rewrittenText
        string toneTarget
        string toneAchieved
        number iterations
        boolean boundariesPreserved
        number courtReadinessScore
        json changeSummary
        datetime rewrittenAt
    }

    TONE_PROFILE {
        string id PK
        string name
        string description
        number aggressionCeiling
        number formalityFloor
        boolean childFocusRequired
        json wordSubstitutions
        json phrasePatterns
    }

    AUTHOR {
        string id PK
        string role "co-parent | attorney | mediator"
        string caseId FK
        json tonePreferences
        number avgAggressionScore
        number totalMessages
        datetime createdAt
    }

    MESSAGE ||--o{ EMOTION_ANALYSIS : "has analysis"
    EMOTION_ANALYSIS ||--o{ TRIGGER : "contains triggers"
    MESSAGE ||--o{ REWRITE_RESULT : "has rewrites"
    REWRITE_RESULT }o--|| TONE_PROFILE : "uses tone"
    AUTHOR ||--o{ MESSAGE : "writes"
```

## Key Entities

### Message
The central entity — a piece of communication (email, text, filing excerpt) submitted for analysis and potential rewriting.

### EmotionAnalysis
The result of running the EmotionDetector on a message. Contains sentiment scores, aggression levels, and dominant emotions.

### Trigger
A specific inflammatory or problematic phrase identified within a message. Includes the matched text, its type, and severity.

### RewriteResult
The output of the RewriteEngine, containing the rewritten text, tone details, and quality metrics.

### ToneProfile
A configuration template that defines how a particular tone (neutral, warm, firm) should read — word substitutions, formality levels, and constraints.

### Author
Tracks communication patterns for an individual within a case, enabling personalized de-escalation strategies over time.
