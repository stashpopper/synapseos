"""
SynapseForge — Agent System Prompts (optimized for speed)
"""

PLANNER_PROMPT = """Analyze the code structure and create a plan.

Respond in JSON:
{
    "structure": "brief description",
    "patterns": ["pattern1", "pattern2"],
    "complexity": "low" | "medium" | "high",
    "focus_areas": ["area1"],
    "estimated_issues": "number"
}"""

REVIEWER_PROMPT = """Review code for quality issues. Check: missing returns, unused vars, division by zero, magic numbers, long functions, missing error handling.

RULES: Only report issues ACTUALLY in the code. Verify line numbers. No test coverage issues.

Respond in JSON:
{
    "findings": [{"severity": "high", "category": "quality", "title": "...", "description": "...", "recommendation": "...", "line": 15}],
    "summary": "Brief summary"
}
Empty findings if none."""

SECURITY_PROMPT = """Scan for REAL security vulnerabilities: SQL injection, XSS, command injection, hardcoded secrets, insecure file ops, missing input validation.

RULES: Only report vulnerabilities ACTUALLY in the code. No generic warnings. Verify line numbers.

Respond in JSON:
{
    "findings": [{"severity": "critical", "category": "security", "title": "...", "description": "...", "recommendation": "...", "line": 42, "cwe_id": "CWE-89"}],
    "summary": "Brief summary"
}
Empty findings if none."""

PERFORMANCE_PROMPT = """Identify performance issues: inefficient algorithms, N+1 queries, unnecessary computations, missing caching, memory leaks, blocking ops in async code.

RULES: Only report issues ACTUALLY in the code. Verify line numbers.

Respond in JSON:
{
    "findings": [{"severity": "high", "category": "performance", "title": "...", "description": "...", "recommendation": "...", "line": 25}],
    "summary": "Brief summary"
}
Empty findings if none."""

SYNTHESIZER_PROMPT = """Calculate health score from these findings. Do NOT add/remove/modify findings.

Scoring: Start at 100. Subtract: critical=-15, high=-8, medium=-4, low=-2. Min 0.

Respond in JSON:
{
    "score": <number>,
    "score_breakdown": {"security": <number>, "quality": <number>, "performance": <number>},
    "summary": "<brief>",
    "recommendations": ["<actionable rec 1>", "<actionable rec 2>", "<actionable rec 3>"],
    "merged_findings": [{"severity": "...", "category": "...", "title": "...", "description": "...", "recommendation": "...", "file": "...", "line": <number>}]
}"""

DOCS_PROMPT = """Generate documentation suggestions.

Respond in JSON:
{
    "readme_suggestions": "<README content>",
    "api_docs": "<API docs>",
    "configuration_docs": "<config docs>",
    "comment_suggestions": ["Line 15: Add docstring"],
    "test_suggestions": "<test suggestions>"
}"""
