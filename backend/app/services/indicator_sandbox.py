"""Module 20: Indicator Code Quality Sandbox

Validates and safely dry-runs user-supplied indicator code.

Security policy — the following names are **banned**:
    os, sys, subprocess, eval, exec, __import__, open, compile,
    builtins, globals, locals, vars, getattr, setattr, delattr

Usage::

    from app.services.indicator_sandbox import IndicatorSandbox
    import pandas as pd

    sb = IndicatorSandbox()
    result = sb.check_quality(code)
    if result["score"] >= 60:
        run_result = sb.dry_run(code, sample_df=pd.DataFrame(...))
"""
from __future__ import annotations

import ast
import logging
import time
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

_BANNED_NAMES = {
    "os", "sys", "subprocess", "eval", "exec", "__import__",
    "open", "compile", "builtins", "globals", "locals", "vars",
    "getattr", "setattr", "delattr", "__builtins__",
}

_BANNED_ATTRS = {"system", "popen", "run", "call", "Popen"}


# ---------------------------------------------------------------------------
# AST-based static analysis
# ---------------------------------------------------------------------------

class _SecurityVisitor(ast.NodeVisitor):
    """AST visitor that collects security violations."""

    def __init__(self) -> None:
        self.issues: List[str] = []

    def visit_Name(self, node: ast.Name) -> None:  # noqa: N802
        if node.id in _BANNED_NAMES:
            self.issues.append(
                f"Line {node.lineno}: use of banned name '{node.id}'"
            )
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:  # noqa: N802
        for alias in node.names:
            root = alias.name.split(".")[0]
            if root in _BANNED_NAMES:
                self.issues.append(
                    f"Line {node.lineno}: import of banned module '{alias.name}'"
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:  # noqa: N802
        module = (node.module or "").split(".")[0]
        if module in _BANNED_NAMES:
            self.issues.append(
                f"Line {node.lineno}: from-import of banned module '{node.module}'"
            )
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute) -> None:  # noqa: N802
        if node.attr in _BANNED_ATTRS:
            self.issues.append(
                f"Line {node.lineno}: use of banned attribute '{node.attr}'"
            )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:  # noqa: N802
        # Detect eval("...") / exec("...") patterns
        if isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec", "compile"}:
            self.issues.append(
                f"Line {node.lineno}: call to banned function '{node.func.id}'"
            )
        self.generic_visit(node)


def _check_syntax(code: str) -> List[str]:
    try:
        ast.parse(code)
        return []
    except SyntaxError as exc:
        return [f"SyntaxError at line {exc.lineno}: {exc.msg}"]


def _check_security(code: str) -> List[str]:
    try:
        tree = ast.parse(code)
        visitor = _SecurityVisitor()
        visitor.visit(tree)
        return visitor.issues
    except SyntaxError:
        return []


def _check_output_completeness(code: str) -> List[str]:
    """Warn when there is no obvious return statement or result variable."""
    issues: List[str] = []
    try:
        tree = ast.parse(code)
        has_return = any(isinstance(n, ast.Return) for n in ast.walk(tree))
        has_result_assign = any(
            isinstance(n, ast.Assign)
            and any(
                isinstance(t, ast.Name) and t.id in {"result", "signal", "output", "indicator"}
                for t in n.targets
            )
            for n in ast.walk(tree)
        )
        if not has_return and not has_result_assign:
            issues.append(
                "No return statement or result/signal/output/indicator assignment found"
            )
    except SyntaxError:
        pass
    return issues


def _estimate_complexity(code: str) -> str:
    """Very rough complexity estimate by LOC."""
    loc = len([l for l in code.splitlines() if l.strip() and not l.strip().startswith("#")])
    if loc < 20:
        return "low"
    if loc < 100:
        return "medium"
    return "high"


# ---------------------------------------------------------------------------
# Sandbox class
# ---------------------------------------------------------------------------

class IndicatorSandbox:
    """Static analysis and safe dry-run sandbox for indicator code."""

    def check_quality(self, code: str) -> Dict:
        """Analyse *code* without executing it.

        Returns:
            Dict with ``score`` (0–100), ``issues``, and ``suggestions``.
        """
        issues: List[str] = []
        suggestions: List[str] = []

        syntax_issues = _check_syntax(code)
        issues.extend(syntax_issues)

        if not syntax_issues:
            sec_issues = _check_security(code)
            issues.extend(sec_issues)
            out_issues = _check_output_completeness(code)
            issues.extend(out_issues)

        complexity = _estimate_complexity(code)
        if complexity == "high":
            suggestions.append(
                "Code is long (>100 LOC). Consider breaking it into smaller functions."
            )

        # Scoring: start 100, deduct per issue
        deductions = len(issues) * 15
        score = max(0, 100 - deductions)

        return {
            "score": score,
            "issues": issues,
            "suggestions": suggestions,
            "complexity": complexity,
        }

    def dry_run(self, code: str, sample_df: Any = None) -> Dict:
        """Execute *code* against a small *sample_df* in a restricted namespace.

        Args:
            code:      Indicator source code.
            sample_df: Small pandas DataFrame for testing.

        Returns:
            Dict with ``success``, ``output``, ``elapsed_ms``, and ``error``.
        """
        quality = self.check_quality(code)
        if quality["score"] < 30:
            return {
                "success": False,
                "error": "Code quality too low to run",
                "issues": quality["issues"],
            }

        # Build a minimal safe namespace
        safe_globals: Dict[str, Any] = {
            "__builtins__": {
                "abs": abs, "min": min, "max": max, "len": len,
                "range": range, "enumerate": enumerate, "zip": zip,
                "list": list, "dict": dict, "tuple": tuple, "set": set,
                "int": int, "float": float, "str": str, "bool": bool,
                "round": round, "sum": sum, "print": print,
                "isinstance": isinstance, "type": type,
            }
        }
        try:
            import pandas as pd  # type: ignore
            import numpy as np  # type: ignore

            safe_globals["pd"] = pd
            safe_globals["np"] = np
        except ImportError:
            pass

        if sample_df is not None:
            safe_globals["df"] = sample_df

        local_ns: Dict[str, Any] = {}
        t0 = time.monotonic()
        try:
            exec(compile(code, "<indicator>", "exec"), safe_globals, local_ns)  # noqa: S102
            elapsed = (time.monotonic() - t0) * 1000
            output = local_ns.get("result") or local_ns.get("signal") or local_ns.get("output")
            return {
                "success": True,
                "output": str(output)[:500] if output is not None else None,
                "elapsed_ms": round(elapsed, 2),
                "error": None,
            }
        except Exception as exc:
            elapsed = (time.monotonic() - t0) * 1000
            return {
                "success": False,
                "output": None,
                "elapsed_ms": round(elapsed, 2),
                "error": str(exc),
            }
