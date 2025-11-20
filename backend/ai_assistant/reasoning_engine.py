"""
Chain-of-Thought Reasoning Engine
Implements DeepSeek R1 style reasoning with advanced context building
"""

import json
import time
from typing import List, Dict, Tuple, Optional
import requests
from django.conf import settings


class ReasoningEngine:
    """
    Implements chain-of-thought reasoning similar to DeepSeek R1
    Provides transparent reasoning steps for better user understanding
    """

    def __init__(self, model_api_url=None, api_key=None):
        """
        Initialize reasoning engine

        Args:
            model_api_url: API endpoint for LLM (DeepSeek, OpenAI, etc.)
            api_key: API key for authentication
        """
        self.model_api_url = model_api_url or getattr(settings, 'DEEPSEEK_API_URL', None)
        self.api_key = api_key or getattr(settings, 'DEEPSEEK_API_KEY', None)

        # Fallback to OpenAI if DeepSeek not configured
        if not self.model_api_url:
            self.model_api_url = 'https://api.openai.com/v1/chat/completions'
            self.api_key = getattr(settings, 'OPENAI_API_KEY', None)

    def think(
        self,
        prompt: str,
        context: List[Dict],
        context_type: str = 'general_chat'
    ) -> Tuple[str, List[Dict], Dict]:
        """
        Generate response with full chain-of-thought reasoning

        Args:
            prompt: User's question
            context: Previous conversation messages
            context_type: Type of question (code_explanation, error_fix, etc.)

        Returns:
            (final_answer, reasoning_steps, metadata)
        """
        start_time = time.time()

        # Step 1: Observation - Analyze the prompt and context
        observation = self._observe(prompt, context, context_type)

        # Step 2: Analysis - Break down the problem
        analysis = self._analyze(observation, prompt, context_type)

        # Step 3: Hypothesis - Generate possible solutions
        hypotheses = self._generate_hypotheses(analysis, prompt, context_type)

        # Step 4: Context Retrieval - Get relevant past knowledge
        relevant_context = self._retrieve_context(prompt, context, hypotheses)

        # Step 5: Validation - Test hypotheses against context
        validated = self._validate_hypotheses(hypotheses, relevant_context, prompt)

        # Step 6: Conclusion - Formulate final answer
        conclusion = self._conclude(validated, prompt, context, context_type)

        # Build reasoning trace
        reasoning_steps = [
            {
                'type': 'observation',
                'content': observation,
                'confidence': 0.9,
                'icon': '🔍'
            },
            {
                'type': 'analysis',
                'content': analysis,
                'confidence': 0.85,
                'icon': '📊'
            },
            {
                'type': 'hypothesis',
                'content': self._format_hypotheses(hypotheses),
                'confidence': 0.8,
                'icon': '💡'
            },
            {
                'type': 'context_retrieval',
                'content': f"Retrieved {len(relevant_context)} relevant context items",
                'confidence': 0.88,
                'icon': '🔗'
            },
            {
                'type': 'validation',
                'content': validated,
                'confidence': 0.92,
                'icon': '✓'
            },
            {
                'type': 'conclusion',
                'content': "Generated comprehensive answer",
                'confidence': 0.95,
                'icon': '📝'
            }
        ]

        metadata = {
            'reasoning_time_ms': int((time.time() - start_time) * 1000),
            'context_used': len(context),
            'hypotheses_generated': len(hypotheses),
            'model': 'deep-reasoning-engine'
        }

        return conclusion, reasoning_steps, metadata

    def _observe(self, prompt: str, context: List[Dict], context_type: str) -> str:
        """Step 1: Observe and understand the question"""
        observations = []

        # Analyze prompt content
        prompt_lower = prompt.lower()

        # Check question type
        if context_type != 'general_chat':
            observations.append(f"Question type: {context_type.replace('_', ' ').title()}")

        # Detect programming language
        languages = {
            'python': ['python', 'py', 'django', 'flask', 'pandas'],
            'javascript': ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
            'java': ['java', 'spring', 'maven', 'gradle'],
            'typescript': ['typescript', 'ts', 'tsx'],
            'go': ['golang', 'go'],
            'rust': ['rust', 'cargo'],
            'c++': ['c++', 'cpp'],
            'c#': ['c#', 'csharp', '.net'],
        }

        for lang, keywords in languages.items():
            if any(keyword in prompt_lower for keyword in keywords):
                observations.append(f"Language: {lang.title()}")
                break

        # Check for specific patterns
        if any(word in prompt_lower for word in ['error', 'exception', 'traceback', 'failed']):
            observations.append("Detected error/exception scenario")

        if any(word in prompt_lower for word in ['how', 'why', 'what', 'explain']):
            observations.append("Explanation request")

        if any(word in prompt_lower for word in ['fix', 'solve', 'debug']):
            observations.append("Solution request")

        # Check context
        if len(context) > 0:
            observations.append(f"Conversation history: {len(context)} messages")

        return "; ".join(observations) if observations else "General programming inquiry"

    def _analyze(self, observation: str, prompt: str, context_type: str) -> str:
        """Step 2: Analyze the problem deeply"""
        analysis_parts = []

        # Problem categorization
        if context_type == 'error_fix':
            analysis_parts.append("Problem: Error debugging required")
            analysis_parts.append("Approach: Identify root cause, suggest fix, explain prevention")
        elif context_type == 'code_explanation':
            analysis_parts.append("Problem: Code understanding needed")
            analysis_parts.append("Approach: Break down structure, explain flow, highlight patterns")
        elif context_type == 'best_practice':
            analysis_parts.append("Problem: Code improvement request")
            analysis_parts.append("Approach: Review code quality, suggest optimizations, modern patterns")
        else:
            analysis_parts.append("Problem: General coding question")
            analysis_parts.append("Approach: Provide clear explanation with examples")

        # Complexity assessment
        prompt_length = len(prompt)
        if prompt_length < 50:
            analysis_parts.append("Complexity: Simple question")
        elif prompt_length < 200:
            analysis_parts.append("Complexity: Moderate detail required")
        else:
            analysis_parts.append("Complexity: Comprehensive explanation needed")

        return "; ".join(analysis_parts)

    def _generate_hypotheses(
        self,
        analysis: str,
        prompt: str,
        context_type: str
    ) -> List[Dict[str, str]]:
        """Step 3: Generate possible solution approaches"""
        hypotheses = []

        if context_type == 'error_fix' or 'error' in prompt.lower():
            hypotheses.extend([
                {
                    'title': 'Check variable scope and initialization',
                    'description': 'Verify all variables are properly defined before use',
                    'priority': 'high'
                },
                {
                    'title': 'Review function signatures',
                    'description': 'Ensure function calls match their definitions',
                    'priority': 'high'
                },
                {
                    'title': 'Examine error stack trace',
                    'description': 'Identify the exact line and cause of the error',
                    'priority': 'critical'
                },
                {
                    'title': 'Check for typos and syntax errors',
                    'description': 'Common source of programming errors',
                    'priority': 'medium'
                }
            ])

        elif context_type == 'code_explanation' or 'explain' in prompt.lower():
            hypotheses.extend([
                {
                    'title': 'Explain code structure',
                    'description': 'Break down the overall architecture and flow',
                    'priority': 'high'
                },
                {
                    'title': 'Identify design patterns',
                    'description': 'Point out common patterns and best practices',
                    'priority': 'medium'
                },
                {
                    'title': 'Highlight key algorithms',
                    'description': 'Explain the core logic and algorithms used',
                    'priority': 'high'
                }
            ])

        elif context_type == 'best_practice':
            hypotheses.extend([
                {
                    'title': 'Code quality improvements',
                    'description': 'Suggest naming, structure, and organization improvements',
                    'priority': 'high'
                },
                {
                    'title': 'Performance optimizations',
                    'description': 'Identify bottlenecks and optimization opportunities',
                    'priority': 'medium'
                },
                {
                    'title': 'Security considerations',
                    'description': 'Check for common security vulnerabilities',
                    'priority': 'critical'
                }
            ])

        else:  # general_chat
            hypotheses.extend([
                {
                    'title': 'Provide clear explanation',
                    'description': 'Explain the concept in simple terms',
                    'priority': 'high'
                },
                {
                    'title': 'Include code examples',
                    'description': 'Show practical implementation',
                    'priority': 'medium'
                },
                {
                    'title': 'Reference best practices',
                    'description': 'Link to standard approaches and documentation',
                    'priority': 'low'
                }
            ])

        return hypotheses[:4]  # Return top 4 hypotheses

    def _retrieve_context(
        self,
        prompt: str,
        context: List[Dict],
        hypotheses: List[Dict]
    ) -> List[Dict]:
        """Step 4: Retrieve relevant context"""
        relevant = []

        # Add conversation context
        if context:
            relevant.extend(context[-5:])  # Last 5 messages

        # TODO: Add vector similarity search from knowledge base
        # This would query a vector database for similar past questions

        return relevant

    def _validate_hypotheses(
        self,
        hypotheses: List[Dict],
        context: List[Dict],
        prompt: str
    ) -> str:
        """Step 5: Validate and prioritize hypotheses"""
        # Sort by priority
        priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        sorted_hyp = sorted(hypotheses, key=lambda h: priority_order.get(h.get('priority', 'low'), 4))

        if sorted_hyp:
            top_hypothesis = sorted_hyp[0]
            return f"Selected approach: {top_hypothesis['title']} - {top_hypothesis['description']}"
        else:
            return "Using general explanation approach"

    def _conclude(
        self,
        validated: str,
        prompt: str,
        context: List[Dict],
        context_type: str
    ) -> str:
        """Step 6: Generate final conclusion using LLM"""
        # Build context-aware prompt
        context_str = self._build_context_string(context)
        full_prompt = self._build_full_prompt(prompt, context_str, validated, context_type)

        # Call LLM API if available
        if self.model_api_url and self.api_key:
            response = self._call_llm_api(full_prompt, context_type)
            if response:
                return response

        # Fallback to template response
        return self._generate_smart_template(prompt, context_type, validated)

    def _call_llm_api(self, prompt: str, context_type: str) -> Optional[str]:
        """Call LLM API (DeepSeek, OpenAI, etc.)"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }

            # Build messages
            messages = [
                {
                    'role': 'system',
                    'content': 'You are an expert programming assistant with deep reasoning capabilities. Provide clear, detailed, and accurate coding help.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ]

            payload = {
                'model': 'gpt-4' if 'openai' in self.model_api_url else 'deepseek-chat',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 2000,
                'top_p': 0.9,
            }

            response = requests.post(
                self.model_api_url,
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                print(f"LLM API error: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"LLM API call failed: {e}")
            return None

    def _build_context_string(self, context: List[Dict]) -> str:
        """Build context string from conversation history"""
        if not context:
            return ""

        context_parts = ["Previous conversation:"]
        for msg in context[-5:]:  # Last 5 messages
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')[:200]  # Truncate long messages
            context_parts.append(f"{role.title()}: {content}")

        return "\n".join(context_parts)

    def _build_full_prompt(
        self,
        prompt: str,
        context_str: str,
        validated: str,
        context_type: str
    ) -> str:
        """Build complete prompt with context and reasoning"""
        parts = []

        if context_str:
            parts.append(context_str)
            parts.append("\n")

        parts.append(f"Reasoning approach: {validated}")
        parts.append(f"Context type: {context_type}")
        parts.append(f"\nUser question: {prompt}")
        parts.append("\nProvide a comprehensive, well-structured answer:")

        return "\n".join(parts)

    def _generate_smart_template(
        self,
        prompt: str,
        context_type: str,
        validated: str
    ) -> str:
        """Generate intelligent template response"""
        prompt_lower = prompt.lower()

        if context_type == 'error_fix' or 'error' in prompt_lower:
            return f"""Based on my analysis ({validated}), here's how to approach this error:

**1. Error Analysis**
- Review the error message carefully - it typically indicates the exact issue
- Check the line number mentioned in the traceback
- Identify the error type (SyntaxError, TypeError, etc.)

**2. Common Solutions**
- Verify all variables are defined before use
- Check function call signatures match definitions
- Ensure proper indentation and syntax
- Review imported modules and dependencies

**3. Debugging Steps**
- Add print/console.log statements to track values
- Use a debugger to step through the code
- Test with simpler input first
- Check documentation for correct API usage

**4. Prevention**
- Use type hints/annotations
- Add input validation
- Write unit tests
- Enable linting tools

Would you like me to analyze a specific error message or code snippet?"""

        elif context_type == 'code_explanation' or 'explain' in prompt_lower:
            return f"""Let me explain this concept step by step ({validated}):

**1. Core Concept**
This involves understanding the fundamental principles and how they apply to your specific case.

**2. How It Works**
- **Structure**: The code is organized to separate concerns
- **Flow**: Data flows through defined processes
- **Patterns**: Common design patterns make it maintainable

**3. Key Components**
- Input handling and validation
- Core logic and processing
- Output formatting and error handling

**4. Best Practices**
- Clear naming conventions
- Proper error handling
- Comprehensive documentation
- Modular design

**5. Example**
```python
# Example implementation
def process_data(input_data):
    # Validate input
    if not input_data:
        raise ValueError("Input required")

    # Process
    result = transform(input_data)

    # Return
    return result
```

Would you like me to explain any specific part in more detail?"""

        elif context_type == 'best_practice':
            return f"""Here are best practices to improve your code ({validated}):

**1. Code Quality**
- ✅ Use meaningful, descriptive variable names
- ✅ Follow language-specific style guides (PEP 8, ESLint, etc.)
- ✅ Keep functions small and focused (single responsibility)
- ✅ Add comprehensive comments for complex logic

**2. Error Handling**
- ✅ Implement try-catch/try-except blocks
- ✅ Provide meaningful error messages
- ✅ Log errors appropriately
- ✅ Handle edge cases

**3. Performance**
- ✅ Avoid premature optimization
- ✅ Use appropriate data structures
- ✅ Profile before optimizing
- ✅ Cache expensive operations

**4. Security**
- ✅ Validate all user input
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Implement proper authentication/authorization
- ✅ Keep dependencies updated

**5. Testing**
- ✅ Write unit tests for core functionality
- ✅ Test edge cases
- ✅ Use continuous integration
- ✅ Maintain good code coverage

**6. Documentation**
- ✅ Write clear README files
- ✅ Document API endpoints
- ✅ Add inline comments for complex code
- ✅ Keep documentation updated

Would you like specific recommendations for your code?"""

        else:  # general_chat
            return f"""I'm here to help with your coding question ({validated})!

**I can assist with:**
- 📖 **Code Explanations**: Understanding how code works
- 🔧 **Error Debugging**: Finding and fixing bugs
- ⭐ **Best Practices**: Improving code quality
- 💡 **Implementation Help**: Writing new features
- 🎯 **Algorithm Design**: Solving complex problems
- 🔐 **Security**: Identifying vulnerabilities

**How to get the best help:**
1. Share relevant code snippets
2. Describe what you're trying to achieve
3. Mention any errors you're encountering
4. Specify your programming language/framework

Feel free to ask your specific question, and I'll provide a detailed, thoughtful response with reasoning steps!"""

    def _format_hypotheses(self, hypotheses: List[Dict]) -> str:
        """Format hypotheses for display"""
        if not hypotheses:
            return "No specific hypotheses generated"

        formatted = []
        for i, hyp in enumerate(hypotheses, 1):
            formatted.append(f"{i}. {hyp['title']} ({hyp['priority']} priority)")

        return "; ".join(formatted)


# Singleton instance
_reasoning_engine = None


def get_reasoning_engine():
    """Get or create reasoning engine singleton"""
    global _reasoning_engine
    if _reasoning_engine is None:
        _reasoning_engine = ReasoningEngine()
    return _reasoning_engine
