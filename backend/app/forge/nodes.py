"""
SynapseForge — Agent Node Implementations
==========================================
Individual agent node functions for the LangGraph pipeline.
Each node receives the shared state, performs its analysis,
and returns updated state.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage

SEVERITY_ORDER = {"critical": 4, "high": 3, "medium": 2, "low": 1}

# Canonical categories that the frontend expects
VALID_CATEGORIES = {"security", "performance", "quality", "style", "architecture"}

# Map common LLM-returned categories to canonical ones
CATEGORY_ALIASES = {
    # Security aliases
    "error_handling": "quality",
    "database": "performance",
    "concurrency": "performance",
    "resource_management": "performance",
    "memory": "performance",
    "network": "security",
    "authentication": "security",
    "authorization": "security",
    "input_validation": "security",
    "crypto": "security",
    "data": "quality",
    "testing": "quality",
    "naming": "style",
    "formatting": "style",
    "documentation": "quality",
    "maintainability": "quality",
    "reliability": "quality",
    "scalability": "performance",
    "optimization": "performance",
    "golang": "quality",
    "language": "quality",
    "general": "quality",
    "misc": "quality",
    "other": "quality",
}


def normalize_category(category: str) -> str:
    """Normalize an LLM-returned category to one of the valid categories."""
    if not category:
        return "quality"
    cat = category.lower().strip()
    if cat in VALID_CATEGORIES:
        return cat
    # Try exact alias match
    if cat in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[cat]
    # Try partial match (e.g., "error_handling" -> "quality")
    for alias, canonical in CATEGORY_ALIASES.items():
        if alias in cat or cat in alias:
            return canonical
    # Default fallback
    return "quality"


def validate_line_numbers(findings: List[Dict], code: str) -> List[Dict]:
    """Validate that AI-reported line numbers actually match the claimed finding.
    If a line doesn't match the finding's title/description, set line to None.
    Also normalizes categories to valid frontend categories."""
    code_lines = code.split('\n')
    validated = []
    for f in findings:
        # Normalize category for ALL findings (AI and pattern)
        if "category" in f:
            f = {**f, "category": normalize_category(f["category"])}
        
        if f.get("source") != "ai":
            validated.append(f)
            continue
        line = f.get("line")
        title = f.get("title", "").lower()
        desc = f.get("description", "").lower()
        if line and 0 < line <= len(code_lines):
            actual_line = code_lines[line - 1].strip().lower()
            # Check if the line content is relevant to the finding
            is_relevant = False
            # SQL injection: look for SELECT, INSERT, UPDATE, DELETE, WHERE, FROM
            if "sql" in title or "injection" in title:
                is_relevant = any(kw in actual_line for kw in ["select", "insert", "update", "delete", "where", "from", "like", "query", "execute"])
            # eval/exec: look for eval( or exec(
            elif "eval" in title or "exec" in title or "code injection" in title:
                is_relevant = "eval(" in actual_line or "exec(" in actual_line
            # hardcoded: look for = " or = '
            elif "hardcoded" in title or "secret" in title or "credential" in title:
                is_relevant = ('= "' in actual_line or "= '" in actual_line or "= '" in actual_line or "= \"" in actual_line) and not actual_line.startswith("#")
            # N+1: look for for + execute/query
            elif "n+1" in title or "batch" in title:
                is_relevant = "for " in actual_line and ("execute" in actual_line or "query" in actual_line or "fetch" in actual_line)
            # magic number: look for numeric literals
            elif "magic" in title:
                is_relevant = any(c.isdigit() for c in actual_line) and not actual_line.startswith("#") and not actual_line.startswith('"""')
            # missing return: check if function body doesn't have return
            elif "return" in title:
                is_relevant = "return" not in actual_line
            # print/logging: look for print(
            elif "print" in title or "logging" in title:
                is_relevant = "print(" in actual_line
            # indentation: check for tabs or mixed spaces
            elif "indent" in title:
                is_relevant = actual_line.startswith("\t") or ("    " in actual_line and "\t" in actual_line)
            # division: look for /
            elif "division" in title or "zero" in title:
                is_relevant = "/" in actual_line and "//" not in actual_line
            # unclosed connection: look for connect or open
            elif "connection" in title or "unclosed" in title:
                is_relevant = "connect" in actual_line or "open(" in actual_line
            # database: look for db, cursor, execute
            elif "database" in title or "cursor" in title:
                is_relevant = any(kw in actual_line for kw in ["cursor", "execute", "commit", "close", "connect"])
            # resource handling: look for commit, close, with
            elif "resource" in title:
                is_relevant = any(kw in actual_line for kw in ["commit", "close", "with", "cursor"])
            # string concatenation: look for += or + "
            elif "concatenation" in title:
                is_relevant = "+=" in actual_line or ("+ '" in actual_line) or ("+ \"" in actual_line)
            # unused variable: look for variable = ... but no use
            elif "unused" in title:
                is_relevant = "= " in actual_line and not actual_line.startswith("#")
            # else: accept if line contains any keyword from title/desc
            else:
                title_words = [w for w in title.split() if len(w) > 3]
                is_relevant = any(w in actual_line for w in title_words)
            
            if not is_relevant:
                f = {**f, "line": None}
        validated.append(f)
    return validated


def deduplicate_findings(findings: List[Dict]) -> List[Dict]:
    """Deduplicate findings by normalized title + line. Keeps highest severity."""
    seen: Dict[str, Dict] = {}
    for f in findings:
        # Normalize title for matching (lowercase, strip punctuation)
        title_key = "".join(c.lower() for c in f.get("title", "") if c.isalnum())
        line_key = f.get("line") or ""
        dedup_key = f"{title_key}:{line_key}"

        if dedup_key in seen:
            # Keep the higher severity finding
            existing = seen[dedup_key]
            if SEVERITY_ORDER.get(f.get("severity", "low"), 0) > SEVERITY_ORDER.get(existing.get("severity", "low"), 0):
                seen[dedup_key] = f
        else:
            seen[dedup_key] = f

    # Sort by severity (highest first), then by category
    result = sorted(seen.values(), key=lambda x: (-SEVERITY_ORDER.get(x.get("severity", "low"), 0), x.get("category", "")))
    return result


def merge_agent_findings(state: Dict) -> List[Dict]:
    """Collect all findings from agents, deduplicate, and return clean list."""
    all_findings: List[Dict] = []
    for key in ["reviewer_result", "quality_result", "security_result", "performance_result"]:
        result = state.get(key)
        if result and result.get("status") == "completed":
            all_findings.extend(result.get("findings", []))

    # Deduplicate: same title+line → keep highest severity
    return deduplicate_findings(all_findings)
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama
from langchain_mistralai import ChatMistralAI

from .prompts import (
    PLANNER_PROMPT,
    REVIEWER_PROMPT,
    SECURITY_PROMPT,
    PERFORMANCE_PROMPT,
    SYNTHESIZER_PROMPT,
    DOCS_PROMPT,
)
from .tools import (
    extract_code_structure,
    detect_language,
    basic_security_scan,
    basic_performance_scan,
    basic_quality_scan,
)


def _get_llm(model_name: str | None = None) -> Any:
    """Create an LLM instance based on environment configuration."""
    provider = os.getenv("LLM_PROVIDER", "openai")
    model = model_name or os.getenv("ANALYSIS_MODEL", "gpt-4o")

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "sk-your-key-here":
            return None  # Signal that LLM is not configured
        return ChatOpenAI(model=model, temperature=0.1, max_tokens=4096)

    elif provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key == "sk-ant-your-key-here":
            return None
        return ChatAnthropic(model=model, temperature=0.1, max_tokens=4096)

    elif provider == "mistral":
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key or api_key == "your-mistral-key-here":
            return None  # Signal that LLM is not configured
        return ChatMistralAI(model=model, temperature=0.1, max_tokens=4096)

    elif provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        return ChatOllama(model=ollama_model, base_url=base_url, temperature=0.1, max_tokens=4096)

    return None


def _parse_json_response(response: Any) -> Dict[str, Any]:
    """Parse JSON from an LLM response, handling markdown code blocks and non-JSON text."""
    content = response.content if hasattr(response, "content") else str(response)

    if not content or not content.strip():
        raise ValueError("Empty response from LLM")

    # Strip markdown code blocks if present
    if "```" in content:
        start = content.find("```")
        end = content.rfind("```")
        if start != -1 and end != -1:
            content = content[start + 3:end].strip()

    # Handle Mistral's "json\n{...}" prefix (no backticks)
    stripped = content.strip()
    first_line = stripped.split("\n")[0].strip().lower()
    if first_line in ("json", "json\n", "code", "code\n") and "{" in stripped:
        brace_start = stripped.index("{")
        content = stripped[brace_start:]

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Try to find JSON object anywhere in the response
        if "{" in content:
            start = content.index("{")
            end = content.rindex("}") + 1
            try:
                return json.loads(content[start:end])
            except json.JSONDecodeError:
                pass
        # If not valid JSON, return a dict with the raw text
        return {"summary": content.strip(), "findings": []}


def _call_llm(system_prompt: str, user_content: str, model: str | None = None) -> Dict[str, Any]:
    """Call the LLM with a system prompt and user content."""
    llm = _get_llm(model)
    if llm is None:
        raise ValueError("LLM not configured. Set LLM_PROVIDER and provide an API key in .env")

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_content),
        ])
        return _parse_json_response(response)
    except Exception as e:
        # Catch API errors (rate limits, auth errors, etc.)
        error_msg = str(e)
        if "429" in error_msg or "rate limit" in error_msg.lower():
            raise ValueError(f"API rate limit exceeded. Please wait a moment and try again. ({error_msg})")
        elif "401" in error_msg or "403" in error_msg:
            raise ValueError(f"API authentication error. Check your API key. ({error_msg})")
        else:
            raise ValueError(f"LLM API error: {error_msg}")


# ─── Planner Node ───────────────────────────────────────────────

def planner_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Planner agent: Analyzes code structure and creates analysis plan.
    """
    code = state.get("code", "")
    language = state.get("language", "unknown")
    depth = state.get("depth", "standard")

    # Quick structural analysis
    structure = extract_code_structure(code, language)

    # Build user content
    user_content = f"""
Code to analyze:
```{language}
{code}
```

Analysis depth: {depth}

Please analyze this code structure and create a plan.
"""

    try:
        result = _call_llm(PLANNER_PROMPT, user_content)

        return {
            "planner_result": {
                "agent": "planner",
                "status": "completed",
                "message": f"Analysis plan created — complexity: {result.get('complexity', 'unknown')}, focus areas: {len(result.get('focus_areas', []))}",
                "findings": [],
                "summary": json.dumps(result, indent=2),
            },
            "stream_messages": [
                f"[Planner] Analyzing code structure... ✓ Done",
                f"[Planner] Detected {len(structure.get('functions', []))} functions, {len(structure.get('classes', []))} classes",
                f"[Planner] Complexity: {result.get('complexity', 'unknown')}, Focus areas: {', '.join(result.get('focus_areas', [])[:3])}",
            ],
        }
    except Exception as e:
        return {
            "planner_result": {
                "agent": "planner",
                "status": "error",
                "message": str(e),
                "findings": [],
                "summary": None,
            },
            "stream_messages": [f"[Planner] Error: {str(e)}"],
        }


# ─── Code Reviewer Node ─────────────────────────────────────────

def reviewer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Code Reviewer agent: Reviews code quality and patterns.
    """
    code = state.get("code", "")
    filename = state.get("filename", "unknown")

    user_content = f"""
Code to review:
```{state.get('language', 'code')}
{code}
```

File: {filename}

Please review this code for quality issues, anti-patterns, and style problems.
"""

    try:
        result = _call_llm(REVIEWER_PROMPT, user_content)

        findings = result if isinstance(result, list) else result.get("findings", [])
        summary = result.get("summary", "No findings") if isinstance(result, dict) else "Review complete"

        # Tag AI findings with source
        ai_findings = [{**f, "source": "ai"} for f in (findings or [])]

        return {
            "reviewer_result": {
                "agent": "reviewer",
                "status": "completed",
                "message": f"Found {len(ai_findings)} quality issues",
                "findings": ai_findings,
                "summary": summary,
            },
            "stream_messages": [
                f"[Reviewer] Analyzing code quality... ✓ Found {len(findings)} issues",
            ],
        }
    except Exception as e:
        return {
            "reviewer_result": {
                "agent": "reviewer",
                "status": "error",
                "message": str(e),
                "findings": [],
                "summary": None,
            },
            "stream_messages": [f"[Reviewer] Error: {str(e)}"],
        }


# ─── Quality Auditor Node ───────────────────────────────────────

def quality_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Code Quality agent: Scans for code quality issues.
    """
    code = state.get("code", "")
    language = state.get("language", "unknown")
    filename = state.get("filename", "unknown")

    # Pattern-based quality scan
    quick_findings = basic_quality_scan(code, language)

    user_content = f"""
Code to review for quality issues:
```{language}
{code}
```

File: {filename}

Quick scan found {len(quick_findings)} potential issues.
Please perform a thorough code quality analysis.
"""

    try:
        result = _call_llm(REVIEWER_PROMPT, user_content)

        findings = result if isinstance(result, list) else result.get("findings", [])
        summary = result.get("summary", "Quality review complete") if isinstance(result, dict) else "Review complete"

        all_findings = []
        # Tag pattern findings with source
        for qf in quick_findings:
            all_findings.append({
                "severity": qf.get("severity", "medium"),
                "category": "quality",
                "title": qf.get("message", "Quality issue"),
                "file": filename,
                "line": None,
                "description": qf.get("message", ""),
                "recommendation": "Review and fix quality issue",
                "code_snippet": None,
                "cwe_id": None,
                "source": "pattern",
            })
        # Tag AI findings with source
        for af in (findings or []):
            all_findings.append({**af, "source": "ai"})

        return {
            "quality_result": {
                "agent": "quality",
                "status": "completed",
                "message": f"Found {len(all_findings)} quality issues",
                "findings": all_findings,
                "summary": summary,
            },
            "stream_messages": [
                f"[Quality] Analyzing code quality... ✓ {len(quick_findings)} quick findings",
                f"[Quality] Deep analysis complete — {len(findings)} LLM findings",
            ],
        }
    except Exception as e:
        return {
            "quality_result": {
                "agent": "quality",
                "status": "completed",
                "message": f"Pattern scan complete (LLM unavailable): {len(quick_findings)} findings",
                "findings": [
                    {
                        "severity": f.get("severity", "medium"),
                        "category": "quality",
                        "title": f.get("message", "Quality issue"),
                        "file": filename,
                        "line": None,
                        "description": f.get("message", ""),
                        "recommendation": "Review and fix",
                        "code_snippet": None,
                        "cwe_id": None,
                        "source": "pattern",
                    }
                    for f in quick_findings
                ],
                "summary": f"Pattern scan found {len(quick_findings)} issues",
            },
            "stream_messages": [
                f"[Quality] Pattern scan complete — {len(quick_findings)} findings",
                f"[Quality] LLM analysis skipped (not configured)",
            ],
        }


# ─── Security Auditor Node ──────────────────────────────────────

def security_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Security Auditor agent: Scans for vulnerabilities.
    """
    code = state.get("code", "")
    language = state.get("language", "unknown")
    filename = state.get("filename", "unknown")

    # Quick pattern-based scan (always runs)
    quick_findings = basic_security_scan(code, language)

    user_content = f"""
Code to scan for security vulnerabilities:
```{language}
{code}
```

File: {filename}

Quick pattern scan found {len(quick_findings)} potential issues.
Please perform a thorough security analysis.
"""

    try:
        result = _call_llm(SECURITY_PROMPT, user_content)

        findings = result if isinstance(result, list) else result.get("findings", [])
        summary = result.get("summary", "Security scan complete") if isinstance(result, dict) else "Scan complete"

        # Merge quick findings with LLM findings
        all_findings = []
        # Tag pattern findings with source
        for qf in quick_findings:
            all_findings.append({
                "severity": qf.get("severity", "medium"),
                "category": "security",
                "title": qf.get("message", "Security issue"),
                "file": filename,
                "line": None,
                "description": qf.get("message", ""),
                "recommendation": "Review and fix this security issue",
                "code_snippet": None,
                "cwe_id": None,
                "source": "pattern",
            })
        # Tag AI findings with source
        for af in (findings or []):
            all_findings.append({**af, "source": "ai"})

        return {
            "security_result": {
                "agent": "security",
                "status": "completed",
                "message": f"Found {len(all_findings)} security findings",
                "findings": all_findings,
                "summary": summary,
            },
            "stream_messages": [
                f"[Security] Running pattern-based scan... ✓ {len(quick_findings)} quick findings",
                f"[Security] Deep analysis complete — {len(findings)} LLM findings",
            ],
        }
    except Exception as e:
        # Fallback to quick scan only
        return {
            "security_result": {
                "agent": "security",
                "status": "completed",
                "message": f"Pattern scan complete (LLM unavailable): {len(quick_findings)} findings",
                "findings": [
                    {
                        "severity": f.get("severity", "medium"),
                        "category": "security",
                        "title": f.get("message", "Security issue"),
                        "file": filename,
                        "line": None,
                        "description": f.get("message", ""),
                        "recommendation": "Review and fix",
                        "code_snippet": None,
                        "cwe_id": None,
                        "source": "pattern",
                    }
                    for f in quick_findings
                ],
                "summary": f"Pattern scan found {len(quick_findings)} issues",
            },
            "stream_messages": [
                f"[Security] Pattern scan complete — {len(quick_findings)} findings",
                f"[Security] LLM analysis skipped (not configured)",
            ],
        }


# ─── Performance Expert Node ────────────────────────────────────

def performance_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performance Expert agent: Identifies bottlenecks.
    """
    code = state.get("code", "")
    language = state.get("language", "unknown")
    filename = state.get("filename", "unknown")

    # Quick pattern-based scan
    quick_findings = basic_performance_scan(code, language)

    user_content = f"""
Code to analyze for performance issues:
```{language}
{code}
```

File: {filename}

Quick scan found {len(quick_findings)} potential issues.
Please perform a thorough performance analysis.
"""

    try:
        result = _call_llm(PERFORMANCE_PROMPT, user_content)

        findings = result if isinstance(result, list) else result.get("findings", [])
        summary = result.get("summary", "Performance analysis complete") if isinstance(result, dict) else "Analysis complete"

        all_findings = []
        # Tag pattern findings with source
        for qf in quick_findings:
            all_findings.append({
                "severity": qf.get("severity", "medium"),
                "category": "performance",
                "title": qf.get("message", "Performance issue"),
                "file": filename,
                "line": None,
                "description": qf.get("message", ""),
                "recommendation": "Review and optimize",
                "code_snippet": None,
                "cwe_id": None,
                "source": "pattern",
            })
        # Tag AI findings with source
        for af in (findings or []):
            all_findings.append({**af, "source": "ai"})

        return {
            "performance_result": {
                "agent": "performance",
                "status": "completed",
                "message": f"Found {len(all_findings)} performance issues",
                "findings": all_findings,
                "summary": summary,
            },
            "stream_messages": [
                f"[Performance] Analyzing performance... ✓ {len(quick_findings)} quick findings",
                f"[Performance] Deep analysis complete — {len(findings)} LLM findings",
            ],
        }
    except Exception as e:
        return {
            "performance_result": {
                "agent": "performance",
                "status": "completed",
                "message": f"Pattern scan complete (LLM unavailable): {len(quick_findings)} findings",
                "findings": [
                    {
                        "severity": f.get("severity", "medium"),
                        "category": "performance",
                        "title": f.get("message", "Performance issue"),
                        "file": filename,
                        "line": None,
                        "description": f.get("message", ""),
                        "recommendation": "Review and optimize",
                        "code_snippet": None,
                        "cwe_id": None,
                        "source": "pattern",
                    }
                    for f in quick_findings
                ],
                "summary": f"Pattern scan found {len(quick_findings)} issues",
            },
            "stream_messages": [
                f"[Performance] Pattern scan complete — {len(quick_findings)} findings",
                f"[Performance] LLM analysis skipped (not configured)",
            ],
        }


# ─── Synthesizer Node ───────────────────────────────────────────

def synthesizer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Synthesizer agent: Combines all findings into unified report.
    """
    code = state.get("code", "")
    
    # Collect all findings from agents
    raw_findings: List[Dict] = []
    for key in ["reviewer_result", "quality_result", "security_result", "performance_result"]:
        result = state.get(key)
        if result and result.get("status") == "completed":
            raw_findings.extend(result.get("findings", []))
    
    # Validate line numbers for AI findings before deduplication
    raw_findings = validate_line_numbers(raw_findings, code)
    
    # Deduplicate
    all_findings = deduplicate_findings(raw_findings)

    # Build summary of all agent results
    agent_summaries = []
    for key in ["reviewer_result", "quality_result", "security_result", "performance_result"]:
        result = state.get(key)
        if result:
            agent_summaries.append(f"{result.get('agent', key)}: {result.get('message', 'N/A')}")

    # Separate pattern and AI findings (from the deduplicated set)
    pattern_findings = [f for f in all_findings if f.get("source") == "pattern"]
    ai_findings = [f for f in all_findings if f.get("source") == "ai"]

    user_content = f"""
Deduplicated agent findings ({len(all_findings)} total):

--- PATTERN-BASED FINDINGS ({len(pattern_findings)}) ---
{json.dumps(pattern_findings, indent=2) if pattern_findings else "None"}

--- AI-GENERATED FINDINGS ({len(ai_findings)}) ---
{json.dumps(ai_findings, indent=2) if ai_findings else "None"}

Please synthesize these into a unified report with health score.
Return the EXACT same findings you received — do NOT add new findings that were not in the input.
Do NOT invent findings about random modules, deserialization, or anything not present in the code.
"""

    try:
        result = _call_llm(SYNTHESIZER_PROMPT, user_content)

        # Validate LLM response has required fields
        if "score" not in result or "score_breakdown" not in result:
            raise ValueError("LLM response missing required fields")

        score = result["score"]
        score_breakdown = result["score_breakdown"]
        summary = result.get("summary", "")
        recommendations = result.get("recommendations", [])
        merged_findings = result.get("merged_findings", all_findings)

        # Validate score is a number between 0-100
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            raise ValueError(f"Invalid score: {score}")

        # Preserve source field on merged findings
        if merged_findings:
            merged_findings = [{**f, "source": f.get("source", "ai")} for f in merged_findings]

        return {
            "synthesizer_result": {
                "agent": "synthesizer",
                "status": "completed",
                "message": f"Health score: {score}/100",
                "findings": merged_findings,
                "summary": summary,
            },
            "all_findings": merged_findings,
            "health_score": score,
            "summary": summary,
            "recommendations": recommendations,
            "score_breakdown": score_breakdown,
            "stream_messages": [
                f"[Synthesizer] Merging all findings... ✓ {len(merged_findings)} total findings",
                f"[Synthesizer] Health score: {score}/100",
            ],
        }
    except Exception as e:
        # If LLM fails, show analysis failed — no hardcoded scores
        return {
            "synthesizer_result": {
                "agent": "synthesizer",
                "status": "error",
                "message": "Failed to analyze — LLM analysis unavailable",
                "findings": [],
                "summary": None,
            },
            "all_findings": [],
            "health_score": None,
            "summary": "Failed to analyze — LLM analysis unavailable",
            "recommendations": [],
            "score_breakdown": None,
            "stream_messages": [
                f"[Synthesizer] Analysis failed: {str(e)}",
            ],
        }


# ─── Docs Generator Node ────────────────────────────────────────

def docs_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Docs Generator agent: Generates documentation suggestions.
    """
    code = state.get("code", "")
    filename = state.get("filename", "unknown")
    language = state.get("language", "unknown")

    user_content = f"""
Code to document:
```{language}
{code}
```

File: {filename}

Please generate documentation suggestions for this code.
"""

    try:
        result = _call_llm(DOCS_PROMPT, user_content)
        return {
            "docs_result": {
                "agent": "docs",
                "status": "completed",
                "message": "Documentation suggestions generated",
                "findings": [],
                "summary": result.get("summary", "Documentation suggestions generated"),
                "readme_suggestions": result.get("readme_suggestions", ""),
                "api_docs": result.get("api_docs", ""),
                "configuration_docs": result.get("configuration_docs", ""),
                "comment_suggestions": result.get("comment_suggestions", []),
                "test_suggestions": result.get("test_suggestions", ""),
            },
            "stream_messages": [
                f"[Docs] Generating documentation suggestions... ✓ Done",
            ],
        }
    except Exception as e:
        return {
            "docs_result": {
                "agent": "docs",
                "status": "error",
                "message": str(e),
                "findings": [],
                "summary": None,
            },
            "stream_messages": [f"[Docs] Error: {str(e)}"],
        }
