import arxiv
import re
from typing import Dict, Optional

class ArxivService:
    """Service for fetching papers from arXiv"""

    @staticmethod
    def extract_paper_id(arxiv_url: str) -> str:
        """Extract paper ID from arXiv URL"""
        # Handle URLs like https://arxiv.org/abs/2401.12345 or https://arxiv.org/pdf/2401.12345.pdf
        pattern = r'arxiv\.org/(?:abs|pdf)/([0-9]+\.[0-9]+)'
        match = re.search(pattern, arxiv_url)

        if match:
            return match.group(1)

        # If no match, assume the input is already a paper ID
        if re.match(r'^[0-9]+\.[0-9]+$', arxiv_url):
            return arxiv_url

        raise ValueError("Invalid arXiv URL or paper ID format")

    @staticmethod
    def fetch_paper(paper_id: str) -> Optional[Dict]:
        """Fetch paper metadata from arXiv"""
        try:
            search = arxiv.Search(id_list=[paper_id])
            paper = next(search.results())

            return {
                "paper_id": paper_id,
                "title": paper.title,
                "authors": [author.name for author in paper.authors],
                "abstract": paper.summary,
                "pdf_url": paper.pdf_url,
                "published": paper.published.isoformat(),
                "categories": paper.categories
            }
        except StopIteration:
            return None
        except Exception as e:
            print(f"Error fetching paper: {e}")
            return None
