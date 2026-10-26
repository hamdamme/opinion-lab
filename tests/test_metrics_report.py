"""Regression checks for the historical claims that the earlier audit misreported."""
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]


class MetricsReportTests(unittest.TestCase):
    def test_report_only_reports_known_discrepancies_and_all_models(self):
        result = subprocess.run(
            [sys.executable, 'analysis/compute_metrics.py', '--report-only'],
            cwd=ROOT, text=True, capture_output=True, check=True,
        )
        self.assertIn('Consumer negative MAD > positive MAD: 8/10', result.stdout)
        self.assertIn('Professional negative MAD > positive MAD: 3/10', result.stdout)
        self.assertIn('Professional MAD < consumer MAD: 7 /10', result.stdout)
        self.assertIn('Consumer correlation > professional correlation: 10 /10', result.stdout)
        self.assertEqual(result.stdout.count('Paper MAD mismatch:'), 4)
        splits = result.stdout.split('=== Bias-type MAD splits ===')[1].split('=== Descriptive')[0]
        self.assertEqual(splits.count('pos(n=100)'), 20)

    def test_historical_comparison_fails_on_known_paper_discrepancies(self):
        result = subprocess.run(
            [sys.executable, 'analysis/compute_metrics.py'],
            cwd=ROOT, text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn('Paper comparison findings:', result.stdout)
        self.assertIn('Google Gemini 2.0 Flash (mad_cons)', result.stdout)
        self.assertIn('OpenAI 3.5 Turbo (mad_cons)', result.stdout)
        self.assertIn('Meta Llama 3.3 70B (mad_prof)', result.stdout)
