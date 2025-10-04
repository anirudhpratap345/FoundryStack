import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin
from typing import List, Dict, Optional
from newspaper import Article
import logging
from datetime import datetime
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}


class EnhancedCrawler:
	def __init__(self):
		self.session = requests.Session()
		self.session.headers.update(HEADERS)
		self.crawled_urls = set()
		self.max_articles_per_site = 10

	def fetch_page(self, url: str) -> Optional[str]:
		"""Fetch HTML content with basic error handling."""
		try:
			response = self.session.get(url, timeout=15)
			response.raise_for_status()
			return response.text
		except Exception as e:
			logger.error(f"Error fetching {url}: {e}")
			return None

	def extract_clean_text(self, html: str, main_selector: str = None) -> str:
		"""Extract meaningful text, removing scripts, styles, headers, footers, ads."""
		if not html:
			return ""
		soup = BeautifulSoup(html, "html.parser")

		# Remove unwanted elements
		unwanted_selectors = [
			"script", "style", "aside", "header", "footer", "nav",
			".advertisement", ".ad", ".sidebar", ".comments",
			".social-share", ".newsletter", ".cookie-banner"
		]
		for selector in unwanted_selectors:
			for element in soup.select(selector):
				element.decompose()

		if main_selector:
			elements = soup.select(main_selector)
			text_blocks = [el.get_text(strip=True) for el in elements]
		else:
			main_content = soup.find("main") or soup.find("article") or soup.find("div", class_="content")
			if main_content:
				text_blocks = [p.get_text(strip=True) for p in main_content.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6"])]
			else:
				text_blocks = [p.get_text(strip=True) for p in soup.find_all("p")]

		filtered_blocks = []
		for block in text_blocks:
			if len(block.split()) > 10:
				if not any(phrase in block.lower() for phrase in [
					"cookie policy", "privacy policy", "terms of service",
					"subscribe to our newsletter", "follow us on",
					"copyright", "all rights reserved"
				]):
					filtered_blocks.append(block)

		return " ".join(filtered_blocks)

	def extract_newspaper_text(self, url: str) -> str:
		"""Use newspaper3k for news sites to get main content only with fallback."""
		try:
			article = Article(url)
			article.download()
			article.parse()
			if len(article.text.split()) > 50:
				return article.text
			return self.extract_clean_text(self.fetch_page(url))
		except Exception as e:
			logger.warning(f"Newspaper extraction failed for {url}: {e}")
			return self.extract_clean_text(self.fetch_page(url))

	def crawl_news_sites(self) -> List[Dict]:
		"""Crawl latest news from TechCrunch, The Verge, InfoQ, Hacker News."""
		articles = []

		news_sites = {
			"TechCrunch": {
				"url": "https://techcrunch.com/",
				"article_selector": ".post-block__content a",
				"use_newspaper": True
			},
			"The Verge": {
				"url": "https://www.theverge.com/",
				"article_selector": ".c-entry-content a",
				"use_newspaper": True
			},
			"InfoQ": {
				"url": "https://www.infoq.com/",
				"article_selector": ".news-item__content a",
				"use_newspaper": True
			},
			"Hacker News": {
				"url": "https://news.ycombinator.com/",
				"article_selector": "a.storylink, a.titlelink",
				"use_newspaper": True
			}
		}

		for site_name, config in news_sites.items():
			logger.info(f"Crawling {site_name}...")
			html = self.fetch_page(config["url"])
			if not html:
				continue

			soup = BeautifulSoup(html, "html.parser")
			links = soup.select(config["article_selector"])[: self.max_articles_per_site]

			for link in links:
				if not link.has_attr("href"):
					continue

				article_url = urljoin(config["url"], link["href"])
				if article_url in self.crawled_urls:
					continue
				self.crawled_urls.add(article_url)

				content = self.extract_newspaper_text(article_url) if config["use_newspaper"] else self.extract_clean_text(self.fetch_page(article_url))

				if content and len(content.split()) > 100:
					articles.append({
						"id": hashlib.md5(article_url.encode()).hexdigest()[:12],
						"source": site_name,
						"url": article_url,
						"title": link.get_text(strip=True) or "Untitled",
						"content": content,
						"crawled_at": datetime.now().isoformat(),
						"word_count": len(content.split()),
						"type": "news",
					})

				time.sleep(1)

		return articles

	def crawl_startup_directories(self) -> List[Dict]:
		"""Crawl YC Companies and ProductHunt listings."""
		startups = []

		yc_url = "https://www.ycombinator.com/companies"
		html = self.fetch_page(yc_url)
		if html:
			soup = BeautifulSoup(html, "html.parser")
			company_selectors = [
				"div[class*='company-card']",
				"div[class*='company']",
				".company-item",
			]
			companies = []
			for selector in company_selectors:
				companies = soup.select(selector)[:20]
				if companies:
					break
			for company in companies:
				name_elem = company.select_one("h3, h2, .company-name")
				desc_elem = company.select_one("p, .description, .company-description")
				if name_elem and desc_elem:
					name = name_elem.get_text(strip=True)
					desc = desc_elem.get_text(strip=True)
					if len(desc.split()) > 5:
						startups.append({
							"id": hashlib.md5(f"yc_{name}".encode()).hexdigest()[:12],
							"source": "YC Companies",
							"url": yc_url,
							"title": name,
							"content": f"{name}: {desc}",
							"crawled_at": datetime.now().isoformat(),
							"word_count": len(desc.split()),
							"type": "startup",
						})

		ph_url = "https://www.producthunt.com/"
		html = self.fetch_page(ph_url)
		if html:
			soup = BeautifulSoup(html, "html.parser")
			product_selectors = [
				"h3[class*='styles_title']",
				".product-title",
				"h3",
				".product-name",
			]
			products = []
			for selector in product_selectors:
				products = soup.select(selector)[:20]
				if products:
					break
			for product in products:
				title = product.get_text(strip=True)
				if title and len(title) > 3:
					startups.append({
						"id": hashlib.md5(f"ph_{title}".encode()).hexdigest()[:12],
						"source": "ProductHunt",
						"url": ph_url,
						"title": title,
						"content": title,
						"crawled_at": datetime.now().isoformat(),
						"word_count": len(title.split()),
						"type": "startup",
					})

		return startups

	def crawl_tech_documentation(self) -> List[Dict]:
		"""Crawl official tech documentation pages and key sections."""
		docs = []
		tech_sites = {
			"Next.js": {
				"base_url": "https://nextjs.org/docs",
				# Next.js docs structure changes frequently; crawl main page only to avoid 404s
				"pages": [],
			},
			"Supabase": {
				"base_url": "https://supabase.com/docs",
				# IMPORTANT: no leading slashes so urljoin keeps /docs prefix
				"pages": ["guides", "reference", "tutorials", "api"],
			},
			"Prisma": {
				"base_url": "https://www.prisma.io/docs",
				"pages": ["getting-started", "concepts", "reference", "guides"],
			},
			"FastAPI": {
				"base_url": "https://fastapi.tiangolo.com/",
				"pages": ["tutorial/", "advanced/", "tutorial/security/"],
			},
			"Redis": {
				"base_url": "https://redis.io/docs/latest/",
				"pages": ["getting-started/", "develop/", "manage/"],
			},
		}

		for tech_name, config in tech_sites.items():
			logger.info(f"Crawling docs for {tech_name}...")
			main_url = config["base_url"]
			html = self.fetch_page(main_url)
			if html:
				content = self.extract_clean_text(html, main_selector="main")
				if content:
					docs.append({
						"id": hashlib.md5(f"{tech_name}_main".encode()).hexdigest()[:12],
						"source": tech_name,
						"url": main_url,
						"title": f"{tech_name} Documentation",
						"content": content,
						"crawled_at": datetime.now().isoformat(),
						"word_count": len(content.split()),
						"type": "documentation",
					})
			for page in config["pages"]:
				page_url = urljoin(config["base_url"], page)
				html = self.fetch_page(page_url)
				if html:
					content = self.extract_clean_text(html, main_selector="main")
					if content and len(content.split()) > 50:
						docs.append({
							"id": hashlib.md5(f"{tech_name}_{page}".encode()).hexdigest()[:12],
							"source": tech_name,
							"url": page_url,
							"title": f"{tech_name} - {page}",
							"content": content,
							"crawled_at": datetime.now().isoformat(),
							"word_count": len(content.split()),
							"type": "documentation",
						})
				time.sleep(1)

		return docs

	def crawl_all(self) -> List[Dict]:
		"""Run all crawlers and write output to file."""
		logger.info("Starting enhanced crawl...")
		all_docs: List[Dict] = []
		all_docs.extend(self.crawl_news_sites())
		all_docs.extend(self.crawl_startup_directories())
		all_docs.extend(self.crawl_tech_documentation())

		crawl_metadata = {
			"total_documents": len(all_docs),
			"crawl_timestamp": datetime.now().isoformat(),
			"sources": sorted(list(set(doc["source"] for doc in all_docs))),
			"document_types": sorted(list(set(doc["type"] for doc in all_docs))),
		}

		output_data = {"metadata": crawl_metadata, "documents": all_docs}
		with open("crawled_docs_enhanced.json", "w", encoding="utf-8") as f:
			json.dump(output_data, f, ensure_ascii=False, indent=2)

		logger.info(
			f"Crawling complete. {len(all_docs)} documents saved to crawled_docs_enhanced.json"
		)
		return all_docs


if __name__ == "__main__":
	crawler = EnhancedCrawler()
	crawler.crawl_all()


