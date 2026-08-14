import urllib.parse
import urllib.request
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Simple in-memory cache to avoid duplicate GitHub API calls
_GITHUB_SEARCH_CACHE: Dict[str, Dict[str, Any]] = {}


class GitHubSearchEngine:
    """
    Dynamic Search Engine that queries the official GitHub REST Search API
    to discover top open-source repositories matching project titles and skills.
    """

    @staticmethod
    def search_repository(project_title: str, skills: list[str]) -> Dict[str, Any]:
        cache_key = f"{project_title.lower()}_{'_'.join(sorted(skills))}"
        if cache_key in _GITHUB_SEARCH_CACHE:
            return _GITHUB_SEARCH_CACHE[cache_key]

        # Construct clean search query
        clean_title = project_title.replace("Pipeline", "").replace("System", "").replace("Application", "").strip()
        query_terms = [clean_title]
        if skills:
            query_terms.append(skills[0])

        search_query = " ".join(query_terms)
        encoded_query = urllib.parse.quote(search_query)
        url = f"https://api.github.com/search/repositories?q={encoded_query}&sort=stars&order=desc&per_page=1"

        headers = {
            "User-Agent": "SkillForge-AI-Assistant/1.0",
            "Accept": "application/vnd.github.v3+json"
        }

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    items = data.get("items", [])
                    if items:
                        top_repo = items[0]
                        repo_url = top_repo.get("html_url")
                        full_name = top_repo.get("full_name")
                        stars = top_repo.get("stargazers_count", 0)

                        result = {
                            "url": repo_url,
                            "provider": f"GitHub ({full_name} ★ {stars})",
                            "source_reference": f"GitHub Verified Repo: {full_name}"
                        }
                        _GITHUB_SEARCH_CACHE[cache_key] = result
                        return result
        except Exception as e:
            logger.warning(f"GitHub Search API query failed for '{search_query}': {e}")

        # Fallback to direct search query URL if API limit or network error
        fallback_url = f"https://github.com/search?q={urllib.parse.quote(search_query)}"
        result = {
            "url": fallback_url,
            "provider": "GitHub Open Source",
            "source_reference": "GitHub Search Repository"
        }
        _GITHUB_SEARCH_CACHE[cache_key] = result
        return result
