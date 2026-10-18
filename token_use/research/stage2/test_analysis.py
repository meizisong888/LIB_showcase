"""Small safeguards for unknown usage and unmodified evidence interpretation."""
import unittest

from analyze import quoted, source_quote_found, usage_total


class AnalysisSafetyTests(unittest.TestCase):
    def test_unknown_failed_usage_does_not_turn_into_zero(self):
        result = usage_total([{'usage': {'input_tokens': 120, 'output_tokens': 20}}, {'usage': None}])
        self.assertEqual(result['input_tokens']['known_sum'], 120)
        self.assertEqual(result['input_tokens']['reported_attempts'], 1)
        self.assertIsNone(result['input_tokens']['complete_total'])
        self.assertIsNone(result['reasoning_output_tokens']['complete_total'])

    def test_subset_counters_are_not_added_to_parent_usage(self):
        result = usage_total([{'usage': {'input_tokens': 120, 'output_tokens': 20,
                                       'cached_input_tokens': 100, 'reasoning_output_tokens': 5}}])
        self.assertEqual(result['input_tokens']['complete_total'], 120)
        self.assertEqual(result['output_tokens']['complete_total'], 20)

    def test_escaped_quotes_match_but_paraphrases_do_not(self):
        self.assertTrue(quoted('dated "c1906."', '{"description":"dated \\"c1906.\\""}'))
        self.assertFalse(quoted('photographed in 1906', '{"description":"dated c1906."}'))

    def test_field_value_quotes_require_matching_source_fields(self):
        source = {'Date_text': 'c1906.', 'Notes': ['Title from item.']}
        self.assertTrue(source_quote_found({'Date_text': 'c1906.'}, ['Date_text'], source))
        self.assertFalse(source_quote_found({'Date_text': '1907'}, ['Date_text'], source))
        self.assertFalse(source_quote_found({'Date_text': 'c1906.'}, ['Notes'], source))


if __name__ == '__main__':
    unittest.main()
