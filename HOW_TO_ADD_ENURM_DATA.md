# How to Add Your ENURM Data 📚

## Quick Setup

Your ENURM exam data is now integrated by default in the app! Here's how to add your actual exam questions:

### 1. **Locate the ENURM Data File**
Open the file: `src/data/enurmExams.ts`

### 2. **Replace Sample Data with Your ENURM Questions**

Replace the existing `enurmQuestions` array with your actual data:

```typescript
export const enurmQuestions: ENURMQuestion[] = [
  // Paste your ENURM questions here
  {
    "PreguntaId": "your-question-id",
    "Convocatoria": "Ordinaria",
    "Anualidad": 2023,
    "Numero": 1,
    "ImagenNombre": "",
    "Dificultad": 2,
    "Enunciado": "Your question text here",
    "Opcion1": "Option 1",
    "Opcion2": "Option 2",
    "Opcion3": "Option 3", 
    "Opcion4": "Option 4",
    "Opcion5": "",
    "Comentario": "Explanation of correct answer",
    "Correcta": 1,
    "Asignatura": "Subject name",
    "Tema": "Topic name", 
    "Subtema": "Subtopic name",
    "TieneVideo": false
  },
  // Add more questions...
]
```

### 3. **Data Format Requirements**

Make sure each question has these **required fields**:
- `PreguntaId` - Unique identifier
- `Enunciado` - Question text
- `Opcion1` - First answer option (required)
- `Correcta` - Correct answer number (1-5)
- `Asignatura` - Subject name

### 4. **Automatic Exam Generation**

The app will automatically create exams from your data:

- **By Subject**: Groups questions by `Asignatura` (50 questions, 90 minutes)
- **By Topic**: Groups questions by `Tema` (25 questions, 45 minutes)
- **Sample Exams**: Original demo exams are also included

### 5. **Run the App**

```bash
npm run dev
```

Your ENURM exams will be available immediately!

## Data Conversion Details

The app automatically converts your ENURM format to the internal exam format:

| ENURM Field | Converted To | Notes |
|-------------|--------------|-------|
| `Enunciado` | Question text | Main question |
| `Opcion1-5` | Answer options | Empty options filtered out |
| `Correcta` | Correct answer index | Converted from 1-based to 0-based |
| `Comentario` | Explanation | Shown in results |
| `Asignatura` | Exam category | Used for grouping |
| `Tema + Subtema` | Question category | Combined for organization |
| `Dificultad` | Difficulty level | 1-2=easy, 3=medium, 4-5=hard |

## Example Structure

If you have a JSON file with your ENURM data, you can copy it directly:

```typescript
// If your data is in a JSON file, just copy the array:
export const enurmQuestions: ENURMQuestion[] = [
  // Copy your JSON array content here
]
```

## Troubleshooting

**App shows loading forever?**
- Check the browser console for errors
- Verify your data follows the required format
- Make sure `Correcta` values are between 1-5

**No exams generated?**
- Ensure `Asignatura` field is not empty
- Check that at least `Opcion1` is provided for each question
- Verify the `enurmQuestions` array is properly exported

**Questions not displaying correctly?**
- Check that `Enunciado` field contains the question text
- Verify option fields (`Opcion1`, `Opcion2`, etc.) are strings
- Empty options are automatically filtered out

## Need Help?

The app includes sample ENURM data to show the correct format. You can reference the existing questions in `src/data/enurmExams.ts` as examples.

Your ENURM data will be automatically converted and ready to use! 🎓