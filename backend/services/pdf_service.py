import pdfplumber
import requests
from typing import Dict, Optional, List
import tempfile
import os

class PDFService:
    """Service for extracting text from PDFs"""

    @staticmethod
    def download_pdf(url: str) -> str:
        """Download PDF from URL to temporary file"""
        response = requests.get(url, stream=True)
        response.raise_for_status()

        # Create temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')

        for chunk in response.iter_content(chunk_size=8192):
            temp_file.write(chunk)

        temp_file.close()
        return temp_file.name

    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""

        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            raise

        return text.strip()

    @staticmethod
    def extract_text_page_by_page(file_path: str) -> Dict:
        """
        Extract text from PDF page-by-page with detailed results

        Returns:
            Dict with:
                - full_text: Complete text
                - pages: List of dicts with page_number, text, char_count
                - total_pages: Number of pages
                - total_chars: Total character count
        """
        pages_data = []
        full_text = ""

        try:
            with pdfplumber.open(file_path) as pdf:
                for i, page in enumerate(pdf.pages, start=1):
                    page_text = page.extract_text() or ""

                    pages_data.append({
                        'page_number': i,
                        'text': page_text,
                        'char_count': len(page_text),
                        'line_count': len(page_text.split('\n')) if page_text else 0
                    })

                    if page_text:
                        full_text += page_text + "\n\n"

            return {
                'full_text': full_text.strip(),
                'pages': pages_data,
                'total_pages': len(pages_data),
                'total_chars': len(full_text)
            }
        except Exception as e:
            print(f"Error extracting text page-by-page: {e}")
            raise

    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes"""
        # Save bytes to temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.write(pdf_bytes)
        temp_file.close()

        try:
            text = PDFService.extract_text_from_file(temp_file.name)
            return text
        finally:
            # Clean up temp file
            os.unlink(temp_file.name)

    @staticmethod
    def extract_text_from_bytes_detailed(pdf_bytes: bytes) -> Dict:
        """Extract text from PDF bytes with page-by-page details"""
        # Save bytes to temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.write(pdf_bytes)
        temp_file.close()

        try:
            result = PDFService.extract_text_page_by_page(temp_file.name)
            return result
        finally:
            # Clean up temp file
            os.unlink(temp_file.name)

    @staticmethod
    def extract_from_arxiv(pdf_url: str) -> str:
        """Download and extract text from arXiv PDF"""
        temp_file_path = None

        try:
            # Download PDF
            temp_file_path = PDFService.download_pdf(pdf_url)

            # Extract text
            text = PDFService.extract_text_from_file(temp_file_path)

            return text

        finally:
            # Clean up temp file
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    @staticmethod
    def smart_truncate(text: str, max_chars: int = 15000, enable_truncation: bool = True) -> str:
        """
        Intelligently truncate text to fit within token limits
        Keeps introduction and conclusion, summarizes middle

        Args:
            text: Text to truncate
            max_chars: Maximum characters to keep (default 15000 for GPT-4)
            enable_truncation: If False, returns full text regardless of length (for Gemini)
        """
        if not enable_truncation:
            return text

        if len(text) <= max_chars:
            return text

        # Take first 40% and last 20% of text
        first_part_len = int(max_chars * 0.4)
        last_part_len = int(max_chars * 0.2)

        first_part = text[:first_part_len]
        last_part = text[-last_part_len:]

        truncated = f"{first_part}\n\n[... middle sections omitted for brevity ...]\n\n{last_part}"

        return truncated
