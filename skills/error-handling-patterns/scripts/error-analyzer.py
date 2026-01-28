#!/usr/bin/env python3
"""
Error Log Analyzer

Analyzes application logs to identify error patterns, frequencies, and trends.
Helps identify which errors need better handling or recovery strategies.

Usage:
    python error-analyzer.py --log-file app.log
    python error-analyzer.py --log-file app.log --output report.json
    python error-analyzer.py --log-dir ./logs --days 7
"""

import re
import json
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import argparse


class ErrorAnalyzer:
    def __init__(self):
        self.error_patterns = {
            'validation': r'ValidationError|Invalid|Required field',
            'not_found': r'NotFoundError|404|not found',
            'unauthorized': r'UnauthorizedError|401|Unauthorized',
            'forbidden': r'ForbiddenError|403|Forbidden',
            'external_service': r'ExternalServiceError|503|Service unavailable|timeout',
            'database': r'DatabaseError|ECONNREFUSED.*postgres|ETIMEDOUT.*mysql',
            'network': r'NetworkError|ECONNRESET|ETIMEDOUT',
            'unknown': r'Error:|Exception:|Fatal:'
        }
        
        self.errors_by_type: Dict[str, int] = defaultdict(int)
        self.errors_by_code: Counter = Counter()
        self.errors_by_hour: Dict[int, int] = defaultdict(int)
        self.error_messages: List[Dict[str, Any]] = []
        self.stack_traces: List[str] = []
    
    def analyze_log_file(self, log_file: Path) -> Dict[str, Any]:
        """Analyze a single log file."""
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                self._process_log_line(line)
        
        return self._generate_report()
    
    def analyze_log_directory(self, log_dir: Path, days: int = 7) -> Dict[str, Any]:
        """Analyze all log files in a directory within the specified days."""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        for log_file in log_dir.glob('*.log'):
            if log_file.stat().st_mtime < cutoff_date.timestamp():
                continue
            
            self.analyze_log_file(log_file)
        
        return self._generate_report()
    
    def _process_log_line(self, line: str):
        """Process a single log line."""
        # Extract timestamp
        timestamp_match = re.search(
            r'(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})',
            line
        )
        timestamp = None
        if timestamp_match:
            try:
                timestamp = datetime.fromisoformat(timestamp_match.group(1))
            except ValueError:
                pass
        
        # Categorize error
        error_type = 'unknown'
        for etype, pattern in self.error_patterns.items():
            if re.search(pattern, line, re.IGNORECASE):
                error_type = etype
                break
        
        if 'error' in line.lower() or 'exception' in line.lower():
            self.errors_by_type[error_type] += 1
            
            if timestamp:
                self.errors_by_hour[timestamp.hour] += 1
            
            # Extract error code
            code_match = re.search(r'code[:\s]+([A-Z_]+)', line)
            if code_match:
                self.errors_by_code[code_match.group(1)] += 1
            
            # Store error message
            self.error_messages.append({
                'timestamp': timestamp.isoformat() if timestamp else None,
                'type': error_type,
                'message': line.strip()[:200]  # First 200 chars
            })
    
    def _generate_report(self) -> Dict[str, Any]:
        """Generate analysis report."""
        total_errors = sum(self.errors_by_type.values())
        
        # Calculate percentages
        error_distribution = {
            error_type: {
                'count': count,
                'percentage': round((count / total_errors * 100), 2) if total_errors > 0 else 0
            }
            for error_type, count in self.errors_by_type.items()
        }
        
        # Find peak error hours
        peak_hours = sorted(
            self.errors_by_hour.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Most common error codes
        top_error_codes = self.errors_by_code.most_common(10)
        
        return {
            'summary': {
                'total_errors': total_errors,
                'unique_error_types': len(self.errors_by_type),
                'unique_error_codes': len(self.errors_by_code),
                'analysis_timestamp': datetime.now().isoformat()
            },
            'error_distribution': error_distribution,
            'top_error_codes': [
                {'code': code, 'count': count}
                for code, count in top_error_codes
            ],
            'peak_error_hours': [
                {'hour': hour, 'count': count}
                for hour, count in peak_hours
            ],
            'recommendations': self._generate_recommendations(error_distribution)
        }
    
    def _generate_recommendations(self, distribution: Dict) -> List[str]:
        """Generate recommendations based on error patterns."""
        recommendations = []
        total = sum(d['count'] for d in distribution.values())
        
        for error_type, data in distribution.items():
            percentage = data['percentage']
            
            if error_type == 'validation' and percentage > 20:
                recommendations.append(
                    f"High validation errors ({percentage}%). "
                    "Consider improving input validation and error messages."
                )
            
            if error_type == 'external_service' and percentage > 10:
                recommendations.append(
                    f"Frequent external service errors ({percentage}%). "
                    "Implement circuit breaker and retry logic."
                )
            
            if error_type == 'database' and percentage > 5:
                recommendations.append(
                    f"Database errors detected ({percentage}%). "
                    "Check connection pooling and timeouts."
                )
            
            if error_type == 'unauthorized' and percentage > 15:
                recommendations.append(
                    f"High authentication failures ({percentage}%). "
                    "Review authentication flow and session management."
                )
        
        if not recommendations:
            recommendations.append(
                "Error distribution looks healthy. Continue monitoring."
            )
        
        return recommendations


def main():
    parser = argparse.ArgumentParser(
        description='Analyze application logs for error patterns'
    )
    parser.add_argument(
        '--log-file',
        type=Path,
        help='Path to a single log file'
    )
    parser.add_argument(
        '--log-dir',
        type=Path,
        help='Path to directory containing log files'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=7,
        help='Number of days to analyze (for --log-dir)'
    )
    parser.add_argument(
        '--output',
        type=Path,
        help='Output file for JSON report (default: stdout)'
    )
    
    args = parser.parse_args()
    
    analyzer = ErrorAnalyzer()
    
    if args.log_file:
        report = analyzer.analyze_log_file(args.log_file)
    elif args.log_dir:
        report = analyzer.analyze_log_directory(args.log_dir, args.days)
    else:
        parser.print_help()
        return
    
    # Output report
    report_json = json.dumps(report, indent=2)
    
    if args.output:
        args.output.write_text(report_json)
        print(f"Report written to {args.output}")
    else:
        print(report_json)
    
    # Print summary to stderr for easy viewing
    print("\n=== Error Analysis Summary ===", file=__import__('sys').stderr)
    print(f"Total Errors: {report['summary']['total_errors']}", 
          file=__import__('sys').stderr)
    print("\nTop Error Types:", file=__import__('sys').stderr)
    for error_type, data in sorted(
        report['error_distribution'].items(),
        key=lambda x: x[1]['count'],
        reverse=True
    )[:5]:
        print(f"  {error_type}: {data['count']} ({data['percentage']}%)",
              file=__import__('sys').stderr)
    
    print("\nRecommendations:", file=__import__('sys').stderr)
    for rec in report['recommendations']:
        print(f"  • {rec}", file=__import__('sys').stderr)


if __name__ == '__main__':
    main()
