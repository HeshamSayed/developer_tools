from django.http import HttpResponse
from django.views import View
from analytics.models import ToolMetadata


class SitemapView(View):
    """Generate XML sitemap for all tools"""

    def get(self, request):
        base_url = request.build_absolute_uri('/')[:-1]

        # Start XML
        xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
        xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

        # Homepage
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{base_url}/</loc>')
        xml_content.append('    <changefreq>daily</changefreq>')
        xml_content.append('    <priority>1.0</priority>')
        xml_content.append('  </url>')

        # Tool pages (from database if available, otherwise hardcoded)
        tools = [
            'json-formatter', 'json-validator', 'json-minify',
            'base64-encode', 'base64-decode',
            'hash-generator', 'password-generator', 'password-strength',
            'timestamp-converter', 'jwt-decoder', 'text-diff', 'regex-tester',
            'csv-to-json', 'json-to-csv',
            'url-encode', 'url-decode', 'html-encode', 'html-decode',
            'uuid-generator', 'qr-generator', 'color-picker', 'cron-builder'
        ]

        for tool_slug in tools:
            xml_content.append('  <url>')
            xml_content.append(f'    <loc>{base_url}/tools/{tool_slug}</loc>')
            xml_content.append('    <changefreq>weekly</changefreq>')
            xml_content.append('    <priority>0.8</priority>')
            xml_content.append('  </url>')

        xml_content.append('</urlset>')

        return HttpResponse('\n'.join(xml_content), content_type='application/xml')
