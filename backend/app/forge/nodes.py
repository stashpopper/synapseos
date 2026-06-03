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
    # Collect all findings
    all_findings: List[Dict] = []
    for key in ["reviewer_result", "quality_result", "security_result", "performance_result"]:
        result = state.get(key)
        if result and result.get("status") == "completed":
            all_findings.extend(result.get("findings", []))

    # Build summary of all agent results
    agent_summaries = []
    for key in ["reviewer_result", "quality_result", "security_result", "performance_result"]:
        result = state.get(key)
        if result:
            agent_summaries.append(f"{result.get('agent', key)}: {result.get('message', 'N/A')}")

    # Separate pattern and AI findings
    pattern_findings = [f for f in all_findings if f.get("source") == "pattern"]
    ai_findings = [f for f in all_findings if f.get("source") == "ai"]

    user_content = f"""
All agent findings ({len(all_findings)} total):

--- PATTERN-BASED FINDINGS ({len(pattern_findings)}) ---
{json.dumps(pattern_findings, indent=2) if pattern_findings else "None"}

--- AI-GENERATED FINDINGS ({len(ai_findings)}) ---
{json.dumps(ai_findings, indent=2) if ai_findings else "None"}

Please synthesize these into a unified report with health score.
Include ALL findings in your merged_findings — do not drop any.
"""

    try:
        result = _call_llm(SYNTHESIZER_PROMPT, user_content)

        score = result.get("score", 50)
        score_breakdown = result.get("score_breakdown", {"security": 50, "quality": 50, "performance": 50})
        summary = result.get("summary", "Analysis complete")
        recommendations = result.get("recommendations", [])
        merged_findings = result.get("merged_findings", all_findings)
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
        # Fallback scoring
        critical = sum(1 for f in all_findings if f.get("severity") == "critical")
        high = sum(1 for f in all_findings if f.get("severity") == "high")
        medium = sum(1 for f in all_findings if f.get("severity") == "medium")
        low = sum(1 for f in all_findings if f.get("severity") == "low")
        score = max(0, 100 - critical * 15 - high * 8 - medium * 4 - low * 2)

        # Ensure score reflects all categories
        security_findings = sum(1 for f in all_findings if f.get("category") == "security")
        quality_findings = sum(1 for f in all_findings if f.get("category") == "quality")
        performance_findings = sum(1 for f in all_findings if f.get("category") == "performance")
        if security_findings == 0 and quality_findings == 0 and performance_findings == 0:
            score = max(0, score)  # Keep computed score
        else:
            score = max(0, 100 - security_findings * 10 - quality_findings * 8 - performance_findings * 8)

        return {
            "synthesizer_result": {
                "agent": "synthesizer",
                "status": "completed",
                "message": f"Health score: {score}/100 (fallback)",
                "findings": all_findings,
                "summary": f"Analysis complete — {len(all_findings)} findings, score: {score}/100",
            },
            "all_findings": all_findings,
            "health_score": score,
            "summary": f"Analysis complete — {len(all_findings)} findings, score: {score}/100",
            "recommendations": ["Review all findings and apply recommendations"],
            "score_breakdown": {
                "security": max(0, 100 - sum(1 for f in all_findings if f.get("category") == "security") * 10),
                "quality": max(0, 100 - sum(1 for f in all_findings if f.get("category") == "quality") * 8),
                "performance": max(0, 100 - sum(1 for f in all_findings if f.get("category") == "performance") * 8),
            } if any(f.get("category") in ("security", "quality", "performance") for f in all_findings) else {
                "security": max(0, 100 - critical * 15 - high * 8),
                "quality": max(0, 100 - medium * 4 - low * 2),
                "performance": max(0, 100 - medium * 4 - low * 2),
            },
            "stream_messages": [
                f"[Synthesizer] Fallback scoring — {len(all_findings)} findings",
                f"[Synthesizer] Health score: {score}/100",
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
