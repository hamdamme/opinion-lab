import copy
import unittest

from analysis.validate_data import load_and_validate, validate


class ValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.statements, cls.results = load_and_validate()

    def test_duplicate_statement_fails(self):
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            validate(self.statements + [self.statements[0]], self.results)

    def test_missing_rating_fails(self):
        results = copy.deepcopy(self.results)
        del results[next(iter(results))]["1.1.1"]
        with self.assertRaisesRegex(ValueError, "Missing or extra"):
            validate(self.statements, results)

    def test_fractional_rating_fails(self):
        results = copy.deepcopy(self.results)
        results[next(iter(results))]["1.1.1"] = 2.5
        with self.assertRaisesRegex(ValueError, "Invalid rating"):
            validate(self.statements, results)

    def test_changed_metric_fails(self):
        results = copy.deepcopy(self.results)
        model = next(iter(results))
        reference = int(self.statements[0]["user_answer"])
        sid = self.statements[0]["id"]
        old = abs(int(results[model][sid]) - reference)
        results[model][sid] = next(n for n in range(1, 6) if abs(n-reference) != old)
        with self.assertRaisesRegex(ValueError, "Archived MAD changed"):
            validate(self.statements, results)
