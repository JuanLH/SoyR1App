# ENURM Data Integration Guide 🎓

## Overview
Your Exam Study App now supports loading ENURM exam data! The app can automatically convert your ENURM JSON data into the exam format and generate multiple exam configurations.

## How to Use Your ENURM Data

### 1. **Prepare Your JSON Data**
Make sure your ENURM data follows this structure:
```json
[
  {
    "PreguntaId": "123e4567-e89b-12d3-a456-426614174000",
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
    "Opcion5": "Option 5 (optional)",
    "Comentario": "Explanation of the correct answer",
    "Correcta": 1,
    "Asignatura": "Subject name",
    "Tema": "Topic name",
    "Subtema": "Subtopic name",
    "TieneVideo": false
  }
]
```

### 2. **Load Your Data**
1. Run your app: `npm run dev`
2. Click **"Load ENURM Data"** in the navigation
3. Either:
   - **Upload a JSON file** with your ENURM data
   - **Paste JSON data** directly into the text area

### 3. **Automatic Exam Generation**
Once loaded, the app will automatically generate exams grouped by:

#### **By Subject (Default)**
- 50 questions per exam
- 90 minutes duration
- Groups questions by `Asignatura` field

#### **By Topic**
- 30 questions per exam  
- 60 minutes duration
- Groups questions by `Tema` field

#### **By Year/Convocatoria**
- 40 questions per exam
- 75 minutes duration
- Groups questions by `Convocatoria` and `Anualidad`

## Data Mapping Details

### **Field Mapping**
| ENURM Field | App Field | Notes |
|-------------|-----------|-------|
| `PreguntaId` | `id` | Unique question identifier |
| `Enunciado` | `question` | Question text |
| `Opcion1-5` | `options[]` | Answer options (empty options filtered out) |
| `Correcta` | `correctAnswer` | Converted from 1-based to 0-based index |
| `Comentario` | `explanation` | Answer explanation |
| `Tema + Subtema` | `category` | Combined as "Topic - Subtopic" |
| `Asignatura` | Exam `category` | Subject becomes exam category |
| `Dificultad` | `difficulty` | Mapped: 1-2=easy, 3=medium, 4-5=hard |

### **Image Support**
- If `ImagenNombre` contains base64 data, it's noted in the question text
- Format: `[Image: base64data...]`
- Future enhancement: Full image display support

### **Video Support**
- `TieneVideo` field is preserved for future video integration
- Currently noted in question metadata

## Advanced Usage

### **Custom Exam Creation**
You can create custom exams with specific filters:

```typescript
import { createCustomENURMExam } from './utils/enurm-mapper'

const customExam = createCustomENURMExam(
  enurmData,
  {
    asignatura: "Anatomía",
    tema: "Sistema Nervioso", 
    dificultad: [2, 3], // Medium difficulty
    limit: 25
  },
  {
    title: "Anatomía - Sistema Nervioso",
    description: "Examen personalizado de anatomía",
    duration: 45
  }
)
```

### **Filter Options**
Get available filter values:
```typescript
import { getENURMFilterOptions } from './utils/enurm-mapper'

const options = getENURMFilterOptions(enurmData)
// Returns: { asignaturas, temas, subtemas, convocatorias, anualidades, dificultades }
```

## Example Data
Check `src/data/enurm-example.json` for a sample of properly formatted ENURM data.

## Features Supported

✅ **Multiple choice questions** (2-5 options)  
✅ **Difficulty mapping** (1-5 scale to easy/medium/hard)  
✅ **Subject/topic organization**  
✅ **Answer explanations**  
✅ **Image references** (noted in question text)  
✅ **Automatic exam generation**  
✅ **Data persistence** (saved in localStorage)  
✅ **Flexible grouping** (by subject, topic, or year)  

## Troubleshooting

### **"Missing required fields" Error**
Ensure your JSON includes these required fields:
- `PreguntaId`
- `Enunciado` 
- `Opcion1`
- `Correcta`
- `Asignatura`

### **"Invalid JSON" Error**
- Check JSON syntax with a validator
- Ensure the data is an array of question objects
- Verify all quotes are properly escaped

### **Empty Exams Generated**
- Check that `Correcta` values are between 1-5
- Verify `Asignatura` and `Tema` fields are not empty
- Ensure at least one option (`Opcion1`) is provided

## Next Steps

1. **Load your ENURM data** using the interface
2. **Take practice exams** generated from your data
3. **Review detailed results** with explanations
4. **Track your progress** in the history section

Your ENURM data is now fully integrated with the exam study app! 🚀