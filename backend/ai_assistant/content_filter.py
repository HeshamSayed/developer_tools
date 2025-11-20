"""
Content filtering and safety classifier for AI assistant
Filters political, pornographic, hacking, and other inappropriate content
"""

import re
from typing import Tuple, Optional


class ContentFilter:
    """
    Content safety filter to prevent inappropriate AI assistant usage
    """

    # Keywords for different violation categories
    POLITICAL_KEYWORDS = [
        r'\b(trump|biden|election|democrat|republican|liberal|conservative)\b',
        r'\b(politics|political|politician|government|congress|senate)\b',
        r'\b(vote|voting|campaign|party politics)\b',
    ]

    PORNOGRAPHIC_KEYWORDS = [
        r'\b(porn|pornography|xxx|adult content|nsfw)\b',
        r'\b(explicit|sexual|nude|naked)\b',
    ]

    HACKING_KEYWORDS = [
        r'\b(hack|hacking|exploit|vulnerability|malware)\b',
        r'\b(ddos|dos attack|sql injection|xss|csrf)\b',
        r'\b(crack|cracking|keygen|warez|piracy)\b',
        r'\b(backdoor|rootkit|trojan|ransomware)\b',
        r'\b(phishing|social engineering|password crack)\b',
    ]

    SPAM_KEYWORDS = [
        r'(click here|buy now|limited offer|act now){2,}',
        r'(!!!|===|\*\*\*){3,}',
        r'\b(viagra|cialis|pills|supplements)\b.*\b(buy|order|cheap)\b',
    ]

    def __init__(self, strict_mode: bool = False):
        """
        Initialize content filter

        Args:
            strict_mode: If True, use more aggressive filtering
        """
        self.strict_mode = strict_mode

    def check_content(self, text: str) -> Tuple[bool, Optional[str], str]:
        """
        Check if content violates content policy

        Args:
            text: The text to check

        Returns:
            Tuple of (is_safe, violation_type, severity)
        """
        text_lower = text.lower()

        # Check for political content
        for pattern in self.POLITICAL_KEYWORDS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                severity = 'high' if self.strict_mode else 'medium'
                return False, 'political', severity

        # Check for pornographic content
        for pattern in self.PORNOGRAPHIC_KEYWORDS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return False, 'pornographic', 'high'

        # Check for hacking/malicious content
        hacking_matches = sum(1 for pattern in self.HACKING_KEYWORDS
                             if re.search(pattern, text_lower, re.IGNORECASE))

        if hacking_matches >= 2:
            severity = 'high'
            return False, 'hacking', severity
        elif hacking_matches == 1 and self.strict_mode:
            return False, 'hacking', 'low'

        # Check for spam
        for pattern in self.SPAM_KEYWORDS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return False, 'spam', 'low'

        return True, None, ''

    def is_code_related(self, text: str) -> bool:
        """Check if text appears to be code-related"""
        code_indicators = [
            r'\b(function|class|def|const|let|var|import|export)\b',
            r'\b(python|javascript|java|c\+\+|ruby|go|rust)\b',
            r'\b(debug|error|bug|exception|syntax)\b',
            r'\b(api|database|frontend|backend|server)\b',
            r'[{}\[\]();]',
            r'(=>|->|==|!=|&&|\|\|)',
        ]

        matches = sum(1 for pattern in code_indicators
                     if re.search(pattern, text, re.IGNORECASE))

        return matches >= 2

    def sanitize_prompt(self, text: str) -> str:
        """Sanitize prompt by removing potentially harmful patterns"""
        text = re.sub(r'([!?.]){3,}', r'\1\1', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


content_filter = ContentFilter()

def check_prompt_safety(prompt: str, strict_mode: bool = False) -> Tuple[bool, Optional[str], str]:
    """Convenience function to check prompt safety"""
    filter_instance = ContentFilter(strict_mode=strict_mode)
    return filter_instance.check_content(prompt)
