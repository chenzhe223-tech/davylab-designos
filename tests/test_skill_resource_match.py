import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("designos_engine_api", ROOT / "engine-api" / "server.py")
ENGINE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ENGINE)


class SkillResourceMatchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = ENGINE.load_resource_registry()
        cls.resources = cls.registry["resources"]

    def test_chinese_bigram_tokenization(self):
        tokens = ENGINE.resource_tokens("比较供应商报价")
        self.assertTrue({"比较", "供应", "应商", "商报", "报价"}.issubset(tokens))

    def test_public_visual_task_matches_visual_dna(self):
        matches = ENGINE.find_resource_matches(
            self.resources,
            "新建响应式 SaaS 页面并统一配色与导航布局",
            agent="WorkBuddy",
            limit=5,
        )
        self.assertTrue(matches)
        self.assertEqual(matches[0]["resource"]["id"], "visual-dna-design")
        self.assertGreater(matches[0]["matchScore"], 0)

    def test_agent_filter_only_returns_supported_resources(self):
        matches = ENGINE.find_resource_matches(
            self.resources,
            "视觉设计与响应式页面布局",
            agent="WorkBuddy",
            limit=20,
        )
        self.assertTrue(matches)
        self.assertTrue(all("WorkBuddy" in item["resource"]["agentSupport"] for item in matches))

    def test_public_content_skill_matches_wechat_draft_sync(self):
        matches = ENGINE.find_resource_matches(
            self.resources,
            "同步公众号草稿文章并保存为草稿",
            agent="WorkBuddy",
            limit=5,
        )
        ids = [item["resource"]["id"] for item in matches]
        self.assertIn("davylab-wechat-draft-sync", ids)

    def test_public_registry_contains_no_private_source_metadata(self):
        private_items = [item for item in self.resources if ENGINE.resource_has_visibility(item, "private")]
        public_items = [item for item in self.resources if ENGINE.resource_has_visibility(item, "public")]
        self.assertEqual(len(private_items), 0)
        self.assertEqual(len(public_items), 35)
        self.assertNotIn("bid-quote-cockpit", {item["id"] for item in self.resources})
        self.assertNotIn("feishu-mail-workboard", {item["id"] for item in self.resources})
        visual_dna = next(item for item in self.resources if item["id"] == "visual-dna-design")
        self.assertFalse(ENGINE.resource_has_visibility(visual_dna, "private"))
        self.assertTrue(ENGINE.resource_has_visibility(visual_dna, "public"))

    def test_private_skill_is_not_returned_by_public_agent_match(self):
        matches = ENGINE.find_resource_matches(
            self.resources, "整理多任务交付和开发验收", agent="WorkBuddy",
            visibility="private", limit=10,
        )
        self.assertEqual(matches, [])

    def test_limit_is_clamped(self):
        self.assertLessEqual(
            len(ENGINE.find_resource_matches(self.resources, "设计", limit=1000)),
            20,
        )


if __name__ == "__main__":
    unittest.main()
