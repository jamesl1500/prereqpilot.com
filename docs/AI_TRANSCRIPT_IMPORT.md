# AI Transcript Import Feature

## Overview

The AI Transcript Import feature allows users to upload their official or unofficial PDF transcripts, and the system will automatically extract and import their academic data using OpenAI's GPT-4.

## How It Works

1. **Upload**: User drags and drops or selects a PDF transcript file (max 10MB)
2. **Extract**: The system extracts text content from the PDF
3. **Parse**: OpenAI GPT-4 analyzes the transcript and extracts structured data:
   - Institution name and short code
   - Academic terms/semesters
   - Courses with titles, codes, credits, and grades
4. **Import**: Data is automatically saved to the user's account:
   - Creates institution (if new)
   - Creates terms (if new)
   - Imports all courses with proper relationships
5. **Confirm**: User sees summary of imported data

## Setup

### Prerequisites

- OpenAI API key with GPT-4 access

### Environment Variables

Add to your `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependencies

The feature uses:
- `pdf-parse` for PDF text extraction
- OpenAI API (gpt-4o-mini model) for intelligent parsing

## File Structure

```
src/
├── components/
│   └── transcript/
│       └── TranscriptUpload.tsx          # Upload UI component
├── services/
│   └── transcript-service.ts             # AI parsing & import logic
├── app/
│   ├── api/
│   │   └── transcripts/
│   │       └── parse/
│   │           └── route.ts              # API endpoint
│   └── transcript/
│       └── TranscriptPage.tsx            # Main transcript page
└── styles/
    └── modules/
        └── components/
            └── transcript-upload.module.scss
```

## API Endpoint

### POST `/api/transcripts/parse`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file, max 10MB)

**Response:**
```json
{
  "success": true,
  "result": {
    "institution": {
      "name": "University of California, Berkeley",
      "short_code": "UCB"
    },
    "terms": [
      {
        "name": "Fall 2023",
        "courses": 5
      }
    ],
    "totalCourses": 15,
    "totalCredits": 45.0
  }
}
```

## AI Prompt Strategy

The system uses a structured prompt to ensure consistent data extraction:

1. **Instruction**: Clear role definition as a transcript parser
2. **Input**: Raw transcript text
3. **Output Format**: Specific JSON schema with required fields
4. **Rules**: 
   - Extract all courses
   - Convert grades to 4.0 scale
   - Standardize term names
   - Skip duplicate/retaken courses
5. **Model**: GPT-4o-mini for cost-effective parsing
6. **Temperature**: 0.1 for consistent, deterministic output

## Features

- **Drag & Drop**: Intuitive file upload
- **Real-time Feedback**: Processing status updates
- **Error Handling**: Clear error messages for invalid files
- **Data Validation**: Ensures extracted data is valid
- **Duplicate Prevention**: Won't duplicate existing institutions/terms
- **Grade Conversion**: Automatically converts letter grades to GPA values
- **Term Standardization**: Formats terms consistently (e.g., "Fall 2023")

## Limitations

- Only supports PDF files (not images)
- PDF must contain selectable text (not scanned images)
- Maximum file size: 10MB
- Accuracy depends on transcript format consistency
- May require manual verification for complex transcripts

## Future Enhancements

- Support for scanned PDFs (OCR)
- Support for image files (JPG, PNG)
- Batch upload multiple transcripts
- Manual correction interface
- Confidence scoring for parsed data
- Support for international grading scales
