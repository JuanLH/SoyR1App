# Exam Study App 🎓

A comprehensive exam preparation application built with React, TypeScript, Vite, Tailwind CSS, and Axios. Test your knowledge across various subjects with timed exams, detailed results, and progress tracking.

## 🚀 Features

### 📚 Exam Management
- **Multiple Exam Categories** - JavaScript, React, General Knowledge, and more
- **Difficulty Levels** - Easy, Medium, and Hard exams
- **Detailed Descriptions** - Clear exam information with duration and question count

### ⏱️ Exam Taking Experience
- **Timed Exams** - Real-time countdown timer with auto-submission
- **Question Navigation** - Easy navigation between questions with visual indicators
- **Mark for Review** - Flag questions to revisit later
- **Multiple Choice** - Select from multiple answer options
- **Progress Tracking** - Visual progress indicators and question status

### 📊 Results & Analytics
- **Detailed Results** - Comprehensive breakdown of performance
- **Answer Review** - See correct answers with explanations
- **Performance Metrics** - Score percentage, time spent, and question analysis
- **Visual Feedback** - Color-coded results and progress bars

### 📈 History & Progress
- **Exam History** - Complete record of all taken exams
- **Performance Statistics** - Average scores, best performance, total time spent
- **Result Comparison** - Track improvement over time
- **Detailed Analytics** - Question-by-question analysis

## 🛠️ Technology Stack

- **React 18** - Latest stable version with hooks and concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - HTTP client for potential API integration
- **Local Storage** - Persistent data storage for exam history

## 📦 Project Structure

```
src/
├── components/          # React components
│   ├── ExamList.tsx    # Available exams display
│   ├── ExamInterface.tsx # Main exam taking interface
│   ├── ExamResults.tsx # Results display and analysis
│   ├── ExamHistory.tsx # Historical results view
│   ├── Button.tsx      # Reusable button component
│   └── LoadingSpinner.tsx # Loading indicator
├── hooks/              # Custom React hooks
│   ├── useTimer.ts     # Timer functionality
│   ├── useLocalStorage.ts # Local storage management
│   └── useFetch.ts     # HTTP request handling
├── types/              # TypeScript definitions
│   ├── exam.ts         # Exam-related types
│   └── index.ts        # Common types
├── data/               # Sample data
│   └── sampleExams.ts  # Pre-built exam questions
├── services/           # External services
│   └── api.ts          # Axios configuration
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎯 Key Components

### ExamList
- Displays available exams in a responsive grid
- Shows exam metadata (duration, questions, difficulty)
- Provides exam selection and starting functionality

### ExamInterface
- Full-featured exam taking interface
- Real-time timer with auto-submission
- Question navigator with status indicators
- Mark for review functionality
- Responsive design for all screen sizes

### ExamResults
- Comprehensive results analysis
- Score breakdown and performance metrics
- Detailed question-by-question review
- Explanations for correct answers
- Options to retake or return to exam list

### ExamHistory
- Complete exam history with sorting options
- Performance statistics and trends
- Quick access to detailed results
- Progress tracking over time

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎨 Features in Detail

### Timer System
- Countdown timer for each exam
- Visual time remaining indicator
- Automatic submission when time expires
- Time tracking per question

### Question Management
- Support for multiple choice questions
- Question categories and explanations
- Randomizable question order (extensible)
- Rich text support for questions

### Data Persistence
- Local storage for exam history
- Persistent user progress
- Offline capability
- Export/import functionality (extensible)

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Accessible design patterns

## 🔧 Customization

### Adding New Exams
Edit `src/data/sampleExams.ts` to add new exams:

```typescript
{
  id: 'your-exam-id',
  title: 'Your Exam Title',
  description: 'Exam description',
  duration: 30, // minutes
  category: 'Your Category',
  difficulty: 'medium',
  totalQuestions: 10,
  questions: [
    // Your questions here
  ]
}
```

### Styling Customization
Modify `tailwind.config.js` for theme customization:
- Colors and typography
- Spacing and sizing
- Component variants
- Custom utilities

## 🚀 Future Enhancements

- **User Authentication** - Personal accounts and cloud sync
- **Question Bank Management** - Admin interface for question creation
- **Advanced Analytics** - Detailed performance insights
- **Social Features** - Leaderboards and sharing
- **Mobile App** - React Native version
- **API Integration** - Backend service integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).