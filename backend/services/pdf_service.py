import pdfplumber
import requests
from typing import Dict, Optional
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
    def smart_truncate(text: str, max_chars: int = 15000) -> str:
        """
        Intelligently truncate text to fit within token limits
        Keeps introduction and conclusion, summarizes middle
        """
        if len(text) <= max_chars:
            return text

        # Take first 40% and last 20% of text
        first_part_len = int(max_chars * 0.4)
        last_part_len = int(max_chars * 0.2)

        first_part = text[:first_part_len]
        last_part = text[-last_part_len:]

        truncated = f"{first_part}\n\n[... middle sections omitted for brevity ...]\n\n{last_part}"

        return truncated
