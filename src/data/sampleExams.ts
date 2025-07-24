import { Exam } from '../types/exam'

export const sampleExams: Exam[] = [
  {
    id: 'javascript-basics',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and control structures.',
    duration: 30,
    category: 'Programming',
    difficulty: 'easy',
    totalQuestions: 10,
    questions: [
      {
        id: 'js-1',
        question: 'Which of the following is the correct way to declare a variable in JavaScript?',
        options: ['var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;'],
        correctAnswer: 0,
        explanation: 'In JavaScript, variables are declared using var, let, or const keywords.',
        category: 'Variables'
      },
      {
        id: 'js-2',
        question: 'What will be the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'boolean'],
        correctAnswer: 2,
        explanation: 'typeof null returns "object" due to a historical bug in JavaScript.',
        category: 'Data Types'
      },
      {
        id: 'js-3',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        explanation: 'The push() method adds one or more elements to the end of an array.',
        category: 'Arrays'
      },
      {
        id: 'js-4',
        question: 'What is the correct syntax for a for loop in JavaScript?',
        options: [
          'for (i = 0; i <= 5; i++)',
          'for i = 1 to 5',
          'for (i = 0; i <= 5)',
          'for (i <= 5; i++)'
        ],
        correctAnswer: 0,
        explanation: 'The correct syntax includes initialization, condition, and increment/decrement.',
        category: 'Loops'
      },
      {
        id: 'js-5',
        question: 'Which of the following is NOT a JavaScript data type?',
        options: ['String', 'Boolean', 'Float', 'Number'],
        correctAnswer: 2,
        explanation: 'JavaScript has Number type for all numeric values, not separate Float type.',
        category: 'Data Types'
      },
      {
        id: 'js-6',
        question: 'What does the "===" operator do in JavaScript?',
        options: [
          'Assigns a value',
          'Compares values only',
          'Compares values and types',
          'Compares types only'
        ],
        correctAnswer: 2,
        explanation: 'The === operator performs strict equality comparison (value and type).',
        category: 'Operators'
      },
      {
        id: 'js-7',
        question: 'How do you create a function in JavaScript?',
        options: [
          'function myFunction() {}',
          'create myFunction() {}',
          'def myFunction() {}',
          'function = myFunction() {}'
        ],
        correctAnswer: 0,
        explanation: 'Functions are declared using the function keyword followed by the function name.',
        category: 'Functions'
      },
      {
        id: 'js-8',
        question: 'What will "Hello".length return?',
        options: ['4', '5', '6', 'undefined'],
        correctAnswer: 1,
        explanation: 'The length property returns the number of characters in a string.',
        category: 'Strings'
      },
      {
        id: 'js-9',
        question: 'Which method converts a string to lowercase?',
        options: ['toLowerCase()', 'toLower()', 'lower()', 'lowerCase()'],
        correctAnswer: 0,
        explanation: 'The toLowerCase() method converts a string to lowercase letters.',
        category: 'Strings'
      },
      {
        id: 'js-10',
        question: 'What is the correct way to write a JavaScript array?',
        options: [
          'var colors = "red", "green", "blue"',
          'var colors = (1:"red", 2:"green", 3:"blue")',
          'var colors = ["red", "green", "blue"]',
          'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")'
        ],
        correctAnswer: 2,
        explanation: 'Arrays are created using square brackets with comma-separated values.',
        category: 'Arrays'
      }
    ]
  },
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Test your understanding of React concepts including components, props, state, and hooks.',
    duration: 45,
    category: 'Frontend',
    difficulty: 'medium',
    totalQuestions: 8,
    questions: [
      {
        id: 'react-1',
        question: 'What is JSX?',
        options: [
          'A JavaScript library',
          'A syntax extension for JavaScript',
          'A CSS framework',
          'A database query language'
        ],
        correctAnswer: 1,
        explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript.',
        category: 'JSX'
      },
      {
        id: 'react-2',
        question: 'Which hook is used to manage state in functional components?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useState is the primary hook for managing state in functional components.',
        category: 'Hooks'
      },
      {
        id: 'react-3',
        question: 'What is the purpose of useEffect hook?',
        options: [
          'To manage state',
          'To handle side effects',
          'To create context',
          'To optimize performance'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is used to handle side effects like API calls, subscriptions, etc.',
        category: 'Hooks'
      },
      {
        id: 'react-4',
        question: 'How do you pass data from parent to child component?',
        options: ['Through state', 'Through props', 'Through context', 'Through refs'],
        correctAnswer: 1,
        explanation: 'Props are used to pass data from parent components to child components.',
        category: 'Props'
      },
      {
        id: 'react-5',
        question: 'What is the virtual DOM?',
        options: [
          'A copy of the real DOM kept in memory',
          'A new type of HTML',
          'A CSS framework',
          'A JavaScript library'
        ],
        correctAnswer: 0,
        explanation: 'Virtual DOM is a JavaScript representation of the real DOM kept in memory.',
        category: 'Virtual DOM'
      },
      {
        id: 'react-6',
        question: 'Which method is called when a component is first created?',
        options: ['componentDidUpdate', 'componentWillUnmount', 'componentDidMount', 'render'],
        correctAnswer: 2,
        explanation: 'componentDidMount is called after the component is mounted to the DOM.',
        category: 'Lifecycle'
      },
      {
        id: 'react-7',
        question: 'What is the correct way to update state in React?',
        options: [
          'this.state.count = 1',
          'this.setState({count: 1})',
          'this.state = {count: 1}',
          'this.updateState({count: 1})'
        ],
        correctAnswer: 1,
        explanation: 'setState() is the correct method to update state in class components.',
        category: 'State'
      },
      {
        id: 'react-8',
        question: 'What is React.Fragment used for?',
        options: [
          'To create animations',
          'To group multiple elements without adding extra nodes',
          'To handle errors',
          'To manage state'
        ],
        correctAnswer: 1,
        explanation: 'React.Fragment allows you to group multiple elements without adding extra DOM nodes.',
        category: 'Components'
      }
    ]
  },
  {
    id: 'general-knowledge',
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge across various topics including history, science, and geography.',
    duration: 20,
    category: 'General',
    difficulty: 'easy',
    totalQuestions: 6,
    questions: [
      {
        id: 'gk-1',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        explanation: 'Paris is the capital and largest city of France.',
        category: 'Geography'
      },
      {
        id: 'gk-2',
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correctAnswer: 1,
        explanation: 'The Mona Lisa was painted by Leonardo da Vinci between 1503-1519.',
        category: 'Art'
      },
      {
        id: 'gk-3',
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 2,
        explanation: 'Jupiter is the largest planet in our solar system.',
        category: 'Science'
      },
      {
        id: 'gk-4',
        question: 'In which year did World War II end?',
        options: ['1944', '1945', '1946', '1947'],
        correctAnswer: 1,
        explanation: 'World War II ended in 1945 with the surrender of Japan.',
        category: 'History'
      },
      {
        id: 'gk-5',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        explanation: 'Au is the chemical symbol for gold, from the Latin word "aurum".',
        category: 'Science'
      },
      {
        id: 'gk-6',
        question: 'Which ocean is the largest?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 3,
        explanation: 'The Pacific Ocean is the largest ocean on Earth.',
        category: 'Geography'
      }
    ]
  }
]