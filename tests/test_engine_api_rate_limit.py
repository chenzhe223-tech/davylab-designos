import ipaddress
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "engine-api"))
import server  # noqa: E402


class FakeHandler:
    def __init__(self, peer, headers=None):
        self.client_address = (peer, 12345)
        self.headers = headers or {}


class ClientRateLimitKeyTests(unittest.TestCase):
    def test_uses_cloudflare_client_ip_when_socket_peer_is_loopback_proxy(self):
        handler = FakeHandler(
            "127.0.0.1",
            {"CF-Connecting-IP": "198.51.100.23"},
        )
        self.assertEqual(server.client_rate_limit_key(handler), "198.51.100.23")

    def test_does_not_trust_forwarding_header_from_non_loopback_peer(self):
        handler = FakeHandler(
            "192.0.2.10",
            {"CF-Connecting-IP": "198.51.100.23"},
        )
        self.assertEqual(server.client_rate_limit_key(handler), "192.0.2.10")

    def test_invalid_forwarded_ip_falls_back_to_proxy_peer(self):
        handler = FakeHandler(
            "127.0.0.1",
            {"CF-Connecting-IP": "not-an-ip"},
        )
        self.assertEqual(server.client_rate_limit_key(handler), "127.0.0.1")

    def test_ipv6_client_ip_is_canonicalized(self):
        handler = FakeHandler(
            "::1",
            {"CF-Connecting-IP": "2001:0db8:0000:0000:0000:0000:0000:0001"},
        )
        self.assertEqual(server.client_rate_limit_key(handler), "2001:db8::1")

    def test_loopback_forwarded_value_is_not_used_as_client_identity(self):
        handler = FakeHandler(
            "127.0.0.1",
            {"CF-Connecting-IP": "127.0.0.1"},
        )
        self.assertEqual(server.client_rate_limit_key(handler), "127.0.0.1")


if __name__ == "__main__":
    unittest.main()
