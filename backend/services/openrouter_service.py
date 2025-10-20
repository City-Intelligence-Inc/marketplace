import os
import json
import requests
from typing import Dict, Optional

class OpenRouterService:
    """Service for using OpenRouter API to parse PDFs and extract metadata"""

    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = "https://openrouter.ai/api/v1"
        self.default_model = "anthropic/claude-3.5-sonnet"  # Best for structured extraction

        if not self.api_key:
            print("⚠ No OPENROUTER_API_KEY found - OpenRouter unavailable")

    def extract_paper_metadata(self, text: str, max_chars: int = 50000) -> Dict:
        """
        Use LLM to extract structured metadata from paper text

        Args:
            text: Full paper text
            max_chars: Max characters to send (default 50k for long papers)

        Returns:
            Dict with: title, authors (list), abstract, keywords
        """
        if not self.api_key:
            raise Exception("OpenRouter API key not configured")

        # Truncate if too long (take beginning which has metadata)
        if len(text) > max_chars:
            text = text[:max_chars]

        prompt = f"""Extract metadata from this research paper text. Return a JSON object with these fields:

- title: The paper title (string)
- authors: List of author names (array of strings)
- abstract: The abstract/summary (string, can be empty if not found)
- keywords: Key topics/terms (array of strings, 3-5 keywords)

Paper text:
{text}

Return ONLY valid JSON, no other text."""

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.default_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.1,  # Low temp for consistent extraction
                    "max_tokens": 1000
                },
                timeout=30
            )

            response.raise_for_status()
            result = response.json()

            # Extract the response text
            content = result['choices'][0]['message']['content']

            # Parse JSON from response
            # Handle markdown code blocks if present
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()

            metadata = json.loads(content)

            print(f"✓ Extracted metadata via OpenRouter:")
            print(f"  Title: {metadata.get('title', 'N/A')}")
            print(f"  Authors: {len(metadata.get('authors', []))} found")
            print(f"  Abstract: {len(metadata.get('abstract', ''))} chars")

            return metadata

        except Exception as e:
            print(f"⚠ OpenRouter extraction failed: {e}")
            # Return fallback structure
            return {
                'title': 'Untitled Paper',
                'authors': ['Unknown'],
                'abstract': text[:500] if text else '',
                'keywords': []
            }

    def improve_abstract(self, full_text: str, max_chars: int = 100000) -> str:
        """
        Generate a clear abstract if one is missing or unclear

        Args:
            full_text: Full paper text
            max_chars: Max characters to analyze

        Returns:
            Generated abstract string
        """
        if not self.api_key:
            return full_text[:500] + "..."

        if len(full_text) > max_chars:
            # Take first 60% and last 20%
            first_part = int(max_chars * 0.6)
            last_part = int(max_chars * 0.2)
            text = full_text[:first_part] + "\n\n[...]\n\n" + full_text[-last_part:]
        else:
            text = full_text

        prompt = f"""Summarize this research paper in 2-3 sentences. Focus on:
1. What problem is being solved
2. What method/approach is used
3. Key findings or contributions

Paper text:
{text}

Write a clear, concise abstract (max 300 words):"""

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.default_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 500
                },
                timeout=30
            )

            response.raise_for_status()
            result = response.json()
            abstract = result['choices'][0]['message']['content'].strip()

            print(f"✓ Generated abstract via OpenRouter: {len(abstract)} chars")
            return abstract

        except Exception as e:
            print(f"⚠ Abstract generation failed: {e}")
            return text[:500] + "..."
