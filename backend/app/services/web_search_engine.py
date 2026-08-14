import urllib.parse
import urllib.request
import re
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# In-memory search cache
_WEB_SEARCH_CACHE: Dict[str, Dict[str, Any]] = {}


class InternetSearchEngine:
    """
    Full-Web Search Engine Service.
    Searches across the entire internet (web & open source repositories)
    using live HTTP web search queries to discover authentic project source links,
    documentation sites, GitLab/GitHub repos, and production implementation guides.
    """

    @classmethod
    def search_project_source(cls, project_title: str, skills: List[str]) -> Dict[str, Any]:
        cache_key = f"{project_title.lower()}_{'_'.join(sorted(skills))}"
        if cache_key in _WEB_SEARCH_CACHE:
            return _WEB_SEARCH_CACHE[cache_key]

        # Clean search query targeting whole-internet project references
        query_terms = [project_title]
        if skills:
            query_terms.extend(skills[:2])

        raw_query = " ".join(query_terms) + " project source tutorial documentation"
        encoded_query = urllib.parse.quote(raw_query)

        # Query DuckDuckGo Web Search Engine (HTML web results across whole internet)
        web_url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        try:
            req = urllib.request.Request(web_url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    html_content = response.read().decode("utf-8", errors="ignore")
                    
                    # Extract external URLs from DuckDuckGo web result links (uddg=...)
                    raw_links = re.findall(r'uddg=([^&"\']+)', html_content)
                    valid_urls = []
                    for link in raw_links:
                        decoded_link = urllib.parse.unquote(link)
                        # Filter out search engines and ad tracking links
                        if decoded_link.startswith("http") and not any(ignored in decoded_link for ignored in ["duckduckgo.com", "bing.com", "google.com", "yandex"]):
                            valid_urls.append(decoded_link)

                    if valid_urls:
                        top_url = valid_urls[0]
                        domain = urllib.parse.urlparse(top_url).netloc.replace("www.", "")
                        
                        provider_name = f"Web Search ({domain})"
                        if "github.com" in domain:
                            provider_name = f"GitHub ({top_url.split('/')[-2]}/{top_url.split('/')[-1]})" if len(top_url.split('/')) >= 5 else "GitHub Repository"
                        elif "gitlab.com" in domain:
                            provider_name = "GitLab Open Source"
                        elif "docs." in domain or "developer." in domain:
                            provider_name = f"{domain.capitalize()} Documentation"

                        result = {
                            "url": top_url,
                            "provider": provider_name,
                            "source_reference": f"Web Source: {domain}"
                        }
                        _WEB_SEARCH_CACHE[cache_key] = result
                        return result
        except Exception as e:
            logger.warning(f"Internet search engine query failed for '{raw_query}': {e}")

        # Dynamic Fallback: Map primary skill to verified official documentation or repository
        first_skill = skills[0].lower() if skills else "python"
        skill_web_map = {
            "fastapi": ("https://fastapi.tiangolo.com/tutorial/", "FastAPI Official Documentation"),
            "pandas": ("https://pandas.pydata.org/docs/user_guide/index.html", "Pandas Official Documentation"),
            "machine learning": ("https://scikit-learn.org/stable/user_guide.html", "Scikit-Learn Documentation"),
            "git": ("https://git-scm.com/book/en/v2", "Git Official Documentation & Pro Git Book"),
            "docker": ("https://docs.docker.com/get-started/", "Docker Official Documentation"),
            "react": ("https://react.dev/learn", "React Official Documentation"),
            "python": ("https://docs.python.org/3/tutorial/", "Python Official Documentation"),
        }

        fallback_url, fallback_provider = skill_web_map.get(first_skill, (f"https://github.com/search?q={urllib.parse.quote(project_title)}", "Web Source"))
        result = {
            "url": fallback_url,
            "provider": fallback_provider,
            "source_reference": f"Verified Web Source: {fallback_provider}"
        }
        _WEB_SEARCH_CACHE[cache_key] = result
        return result
