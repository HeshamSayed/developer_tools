"""
LLM Service - Abstraction layer for AI assistant
CONFIDENTIAL: Never expose model details to users
"""

import time
from typing import Dict, Optional
from django.conf import settings


class LLMService:
    """
    Abstraction layer for LLM integration
    Keeps actual model implementation confidential
    """

    def __init__(self):
        """Initialize LLM service with confidential settings"""
        # These settings are never exposed via API
        self.model_name = getattr(settings, 'AI_MODEL_NAME', 'assistant')
        self.temperature = 0.7
        self.max_tokens = 2000
        self.system_prompt = "You are a helpful coding assistant. Provide clear, concise explanations."

    def generate_response(
        self,
        prompt: str,
        context_type: str = 'general_chat',
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Generate AI response for user prompt

        Args:
            prompt: User's question/prompt
            context_type: Type of context (code_explanation, error_fix, etc.)
            user_context: Additional context about the user

        Returns:
            Dict with response, tokens_used, and response_time_ms
        """
        start_time = time.time()

        # Build the full prompt with context
        full_prompt = self._build_prompt(prompt, context_type)

        # Generate response (actual LLM call would go here)
        # For now, using a mock response generator
        response_text = self._generate_mock_response(prompt, context_type)

        # Calculate metrics
        response_time_ms = int((time.time() - start_time) * 1000)
        tokens_used = self._estimate_tokens(prompt + response_text)

        return {
            'response': response_text,
            'tokens_used': tokens_used,
            'response_time_ms': response_time_ms,
            'model': 'assistant',  # Never reveal actual model name
        }

    def _build_prompt(self, user_prompt: str, context_type: str) -> str:
        """Build full prompt with system instructions"""
        context_prompts = {
            'code_explanation': (
                "The user needs help understanding code. "
                "Provide a clear, concise explanation focusing on what the code does and why."
            ),
            'error_fix': (
                "The user encountered an error. "
                "Identify the issue and suggest a fix with explanation."
            ),
            'best_practice': (
                "The user wants code improvement suggestions. "
                "Suggest best practices and modern approaches."
            ),
            'general_chat': (
                "The user has a general coding question. "
                "Provide helpful, practical advice."
            ),
        }

        context_instruction = context_prompts.get(context_type, context_prompts['general_chat'])

        full_prompt = f"{self.system_prompt}\n\n{context_instruction}\n\nUser: {user_prompt}\n\nAssistant:"

        return full_prompt

    def _generate_mock_response(self, prompt: str, context_type: str) -> str:
        """
        Mock response generator
        In production, this would call the actual LLM API
        """
        prompt_lower = prompt.lower()

        # Code explanation responses
        if context_type == 'code_explanation' or 'explain' in prompt_lower:
            if 'function' in prompt_lower or 'def' in prompt_lower:
                return (
                    "This function appears to define a reusable block of code. "
                    "Functions help organize code into logical units and enable code reuse. "
                    "The function takes input parameters, processes them, and returns a result. "
                    "This is a fundamental programming pattern that improves code maintainability."
                )
            elif 'class' in prompt_lower:
                return (
                    "This is a class definition, which is a blueprint for creating objects in object-oriented programming. "
                    "Classes encapsulate data (attributes) and behavior (methods) into a single unit. "
                    "This promotes code organization, reusability, and maintainability through principles like encapsulation and inheritance."
                )

        # Error fix responses
        elif context_type == 'error_fix' or 'error' in prompt_lower or 'fix' in prompt_lower:
            return (
                "Based on the error, it looks like there's a common issue that can be resolved. "
                "Here's what you can try:\n\n"
                "1. Check that all variables are properly defined before use\n"
                "2. Verify that function calls match their definitions\n"
                "3. Ensure proper indentation and syntax\n"
                "4. Review the error message for the specific line number\n\n"
                "Would you like me to explain any specific part of the error?"
            )

        # Best practice responses
        elif context_type == 'best_practice' or 'improve' in prompt_lower or 'better' in prompt_lower:
            return (
                "Here are some best practices to improve this code:\n\n"
                "1. Use meaningful variable names that describe their purpose\n"
                "2. Add error handling with try-catch blocks\n"
                "3. Break complex functions into smaller, focused ones\n"
                "4. Add comments for complex logic\n"
                "5. Follow language-specific style guides (PEP 8 for Python, etc.)\n"
                "6. Write unit tests to verify functionality\n\n"
                "These practices will make your code more maintainable and professional."
            )

        # Default general response
        return (
            "I'm here to help with your coding questions! "
            "I can assist with:\n"
            "- Explaining code snippets\n"
            "- Debugging errors\n"
            "- Suggesting best practices\n"
            "- Answering programming questions\n\n"
            "Feel free to share your code or describe your problem, and I'll do my best to help!"
        )

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count (rough approximation)"""
        # Simple estimation: ~4 characters per token
        return len(text) // 4

    def check_availability(self) -> bool:
        """Check if LLM service is available"""
        # In production, this would ping the actual LLM service
        return True


# Singleton instance
_llm_service = None

def get_llm_service() -> LLMService:
    """Get or create LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
