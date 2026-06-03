"""
SynapseForge — Agent Tools
============================
Tool definitions that agents can use during analysis.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List


def extract_code_structure(code: str, language: str) -> Dict[str, Any]:
    """Extract basic code structure information."""
    result = {
        "total_lines": len(code.split("\n")),
        "non_empty_lines": len([l for l in code.split("\n") if l.strip()]),
        "functions": [],
        "classes": [],
        "imports": [],
        "complexity_indicators": {},
    }

    if language in ("python",):
        # Extract function definitions
        func_pattern = re.findall(r"def\s+(\w+)\s*\(([^)]*)\)", code)
        result["functions"] = [{"name": f[0], "params": f[1]} for f in func_pattern]

        # Extract class definitions
        class_pattern = re.findall(r"class\s+(\w+)", code)
        result["classes"] = class_pattern

        # Extract imports
        import_pattern = re.findall(r"^(?:import|from)\s+(\S+)", code, re.MULTILINE)
        result["imports"] = import_pattern

    elif language in ("javascript", "typescript"):
        # Extract function declarations
        func_pattern = re.findall(r"(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:function|\(|async)", code)
        result["functions"] = [{"name": f, "params": ""} for f in func_pattern]

        # Extract class definitions
        class_pattern = re.findall(r"class\s+(\w+)", code)
        result["classes"] = class_pattern

        # Extract imports
        import_pattern = re.findall(r"import\s+.*?\s+from\s+['\"](.+?)['\"]", code)
        result["imports"] = import_pattern

    # Count cyclomatic complexity indicators
    result["complexity_indicators"] = {
        "if_statements": len(re.findall(r"\bif\b", code)),
        "else_statements": len(re.findall(r"\belse\b", code)),
        "for_loops": len(re.findall(r"\bfor\b", code)),
        "while_loops": len(re.findall(r"\bwhile\b", code)),
        "try_blocks": len(re.findall(r"\btry\b", code)),
        "return_statements": len(re.findall(r"\breturn\b", code)),
    }

    return result


def detect_language(code: str) -> str:
    """Detect programming language from code content."""
    code_lower = code.lower()

    indicators = {
        "python": ["import ", "def ", "class ", "print(", "self.", "pip", "requirements"],
        "javascript": ["function ", "const ", "let ", "var ", "console.log", "document.", "require("],
        "typescript": ["interface ", "type ", "enum ", "implements ", "extends ", "namespace "],
        "java": ["public class ", "private ", "protected ", "System.out", "import java."],
        "go": ["package ", "func ", "fmt.", "import (", "go run"],
        "rust": ["fn ", "struct ", "impl ", "use ", "pub ", "let mut "],
        "c": ["#include ", "int main", "printf(", "malloc("],
        "c++": ["#include ", "std::", "cout <<", "new ", "delete "],
        "ruby": ["def ", "end", "require ", "puts ", "class <"],
        "php": ["<?php", "function ", "$_", "->", "echo "],
    }

    scores = {}
    for lang, keywords in indicators.items():
        score = sum(1 for kw in keywords if kw in code_lower)
        if score > 0:
            scores[lang] = score

    return max(scores, key=scores.get) if scores else "unknown"


def basic_security_scan(code: str, language: str) -> List[Dict[str, Any]]:
    """Quick security scan using pattern matching."""
    findings = []

    # SQL injection patterns — broader detection
    if language == "python":
        sql_patterns = [
            (r'f["\']SELECT\s+.*\{', "Potential SQL injection in f-string query"),
            (r'["\']SELECT\s+.*%s', "SQL string formatting detected"),
            (r'\.execute\(.*\+.*\)', "String concatenation in SQL execute"),
            (r'exec\(|executescript\(', "Direct SQL execution"),
            # Detect string concatenation with SQL keywords in any variable assignment
            (r'["\']\s*\+\s*str\(', "String concatenation with str() — potential SQL injection if used in queries"),
            (r'["\']\s*\+\s*user\[', "User input concatenated into string — potential injection"),
            (r'["\']\s*\+\s*request\.', "User request data concatenated into string — potential injection"),
            (r'["\']\s*\+\s*\w+\[', "Dynamic string built from variable index — potential injection"),
        ]
        for pattern, msg in sql_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                findings.append({"severity": "critical", "message": msg})

    # Hardcoded secrets
    secret_patterns = [
        (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded password detected"),
        (r'api_key\s*=\s*["\'][^"\']+["\']', "Hardcoded API key detected"),
        (r'secret\s*=\s*["\'][^"\']+["\']', "Hardcoded secret detected"),
        (r'token\s*=\s*["\'][^"\']+["\']', "Hardcoded token detected"),
        (r'apikey\s*=\s*["\'][^"\']+["\']', "Hardcoded API key detected"),
        (r'ACCESS_KEY\s*=\s*["\'][^"\']+["\']', "Hardcoded access key detected"),
    ]
    for pattern, msg in secret_patterns:
        if re.search(pattern, code, re.IGNORECASE):
            findings.append({"severity": "critical", "message": msg})

    # XSS patterns
    if language in ("javascript", "typescript"):
        xss_patterns = [
            (r'\.innerHTML\s*=', "Potential XSS via innerHTML"),
            (r'document\.write\(', "Direct document write detected"),
            (r'\.outerHTML\s*=', "Potential XSS via outerHTML"),
            (r'eval\(', "eval() usage — potential code injection"),
            (r'new Function\(', "Function constructor — potential code injection"),
            (r'\$\{.*\}\s*=', "Template literal in assignment — potential XSS"),
        ]
        for pattern, msg in xss_patterns:
            if re.search(pattern, code):
                findings.append({"severity": "high", "message": msg})

    # Command injection
    cmd_patterns = [
        (r'subprocess\.call\(.*shell\s*=\s*True', "Command injection risk with shell=True"),
        (r'os\.system\(', "Direct OS command execution"),
        (r'os\.popen\(', "OS pipe execution"),
        (r'subprocess\.run\(.*shell\s*=\s*True', "Command injection risk with shell=True"),
    ]
    for pattern, msg in cmd_patterns:
        if re.search(pattern, code, re.IGNORECASE):
            findings.append({"severity": "critical", "message": msg})

    # Missing input validation (generic)
    if language == "python":
        # Detect functions that accept user-like input without validation
        func_defs = re.findall(r'def\s+(\w+)\s*\(([^)]*)\)', code)
        for func_name, params in func_defs:
            if any(p in params for p in ['request', 'user', 'input', 'data', 'body', 'payload']):
                # Check if function has type hints or validation
                func_start = code.find(f'def {func_name}')
                func_body = code[func_start:func_start+500]
                if 'isinstance' not in func_body and 'assert' not in func_body and 'if not' not in func_body:
                    findings.append({"severity": "medium", "message": f"Function '{func_name}' accepts user input without validation"})

    return findings


def basic_performance_scan(code: str, language: str) -> List[Dict[str, Any]]:
    """Quick performance scan using pattern matching."""
    findings = []

    # Python-specific checks
    if language == "python":
        # String concatenation in loops
        if re.search(r"for.*:.*\n.*\S\s*\+=\s*['\"]", code, re.MULTILINE):
            findings.append({"severity": "medium", "message": "String concatenation in loop — consider using join()"})

        # Missing type hints
        func_count = len(re.findall(r"def\s+\w+", code))
        typed_count = len(re.findall(r"def\s+\w+\s*\([^)]*\)\s*->", code))
        if func_count > 3 and typed_count == 0:
            findings.append({"severity": "low", "message": "No type hints found — consider adding for maintainability"})

        # N+1 query pattern — loop with database calls
        if re.search(r"for\s+\w+\s+in\s+.*:\s*\n.*\.execute\(|\.query\(|\.get\(|\.filter\(", code, re.DOTALL):
            findings.append({"severity": "high", "message": "Potential N+1 query pattern — consider batch fetching"})

        # Missing error handling
        func_defs = re.findall(r'def\s+(\w+)\s*\(([^)]*)\)', code)
        for func_name, params in func_defs:
            func_start = code.find(f'def {func_name}')
            func_end = code.find('\n\ndef ', func_start + 1)
            if func_end == -1:
                func_end = len(code)
            func_body = code[func_start:func_end]
            if 'try' not in func_body and 'except' not in func_body:
                # Only flag if function has external calls
                ext_patterns = [
                    '.execute(', '.query(', '.get(', '.post(', '.fetch(',
                    'open(', 'requests.', 'urllib',
                ]
                if any(pat in func_body for pat in ext_patterns):
                    findings.append({"severity": "medium", "message": f"Function '{func_name}' makes external calls without error handling"})

        # Inefficient list operations
        if re.search(r'\[\s*\w+\s+for\s+\w+\s+in\s+\w+\s*\]\s*\[', code):
            findings.append({"severity": "low", "message": "Chained list comprehensions — consider using itertools or a single pass"})

        # Global variable usage
        if re.search(r'\bglobal\b', code):
            findings.append({"severity": "medium", "message": "Global variable usage — consider using class attributes or dependency injection"})

    # JavaScript/TypeScript checks
    if language in ("javascript", "typescript"):
        # String concatenation in loops
        if re.search(r"for.*\{.*\S\s*\+=\s*['\"]", code, re.DOTALL):
            findings.append({"severity": "medium", "message": "String concatenation in loop — consider using Array.join()"})

        # Missing null checks
        if re.search(r'\w+\.\w+\s*\([^)]*\)', code) and not re.search(r'if\s*\(\s*\w+\s*!==\s*null', code):
            findings.append({"severity": "low", "message": "Potential null reference — consider adding null checks"})

        # Inefficient DOM operations in loops
        if re.search(r"for.*\{.*\.\w+\s*=|\.\w+\.\w+\s*=", code, re.DOTALL):
            findings.append({"severity": "medium", "message": "DOM manipulation in loop — consider batch updates"})

    return findings


def basic_quality_scan(code: str, language: str) -> List[Dict[str, Any]]:
    """Quick code quality scan using pattern matching."""
    findings = []

    if language == "python":
        # Missing docstrings
        func_defs = re.findall(r'def\s+(\w+)\s*\(([^)]*)\)', code)
        for func_name, params in func_defs:
            func_start = code.find(f'def {func_name}')
            func_end = code.find('\n\ndef ', func_start + 1)
            if func_end == -1:
                func_end = len(code)
            func_body = code[func_start:func_end]
            if '"""' not in func_body and "'''" not in func_body and len(func_body) > 100:
                findings.append({"severity": "low", "message": f"Function '{func_name}' missing docstring"})

        # Magic numbers
        magic_numbers = re.findall(r'(?<!\w)(\d+\.?\d*)(?!\s*[=,)]*\s*[a-zA-Z_])', code)
        if len(magic_numbers) > 5:
            findings.append({"severity": "low", "message": f"Multiple magic numbers detected ({len(magic_numbers)}) — consider using named constants"})

        # Bare except clauses
        if re.search(r'except\s*:', code):
            findings.append({"severity": "high", "message": "Bare except clause — specify exception types"})

        # print statements in production code
        if re.search(r'\bprint\s*\(', code):
            findings.append({"severity": "low", "message": "print() statement found — consider using logging module"})

        # Mutable default arguments
        if re.search(r'def\s+\w+\s*\([^)]*=[\[\{]', code):
            findings.append({"severity": "high", "message": "Mutable default argument — use None and initialize inside function"})

        # Too long lines
        lines = code.split('\n')
        long_lines = [l for l in lines if len(l) > 120]
        if long_lines:
            findings.append({"severity": "low", "message": f"{len(long_lines)} line(s) exceed 120 characters — consider breaking into multiple lines"})

    if language in ("javascript", "typescript"):
        # console.log statements
        if re.search(r'console\.log\(', code):
            findings.append({"severity": "low", "message": "console.log() found — consider using a logging library"})

        # eval usage
        if re.search(r'\beval\s*\(', code):
            findings.append({"severity": "high", "message": "eval() usage — consider safer alternatives"})

        # var usage (should use const/let)
        if re.search(r'\bvar\s+\w+', code):
            findings.append({"severity": "low", "message": "var keyword used — prefer const or let"})

        # TODO/FIXME comments
        todos = re.findall(r'//\s*(TODO|FIXME|HACK|XXX)', code, re.IGNORECASE)
        if todos:
            findings.append({"severity": "low", "message": f"{len(todos)} TODO/FIXME comment(s) found — address before production"})

    return findings
