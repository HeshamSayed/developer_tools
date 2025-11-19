from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
import socket
import dns.resolver
import whois
import time
import json
from urllib.parse import urlparse


@api_view(['GET'])
def ip_lookup(request):
    """
    Get detailed information about an IP address including geolocation, ISP, and proxy detection.
    """
    try:
        # Get IP from query param or use client's IP
        ip_address = request.GET.get('ip')

        if not ip_address:
            # Get client's real IP (considering proxies)
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')

        # Use ip-api.com for geolocation (free, no API key required)
        geo_response = requests.get(
            f'http://ip-api.com/json/{ip_address}',
            params={'fields': 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query'},
            timeout=10
        )
        geo_data = geo_response.json()

        if geo_data.get('status') == 'fail':
            return Response(
                {'error': geo_data.get('message', 'Failed to lookup IP address')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to get hostname
        try:
            hostname = socket.gethostbyaddr(ip_address)[0]
        except:
            hostname = None

        result = {
            'ip': geo_data.get('query', ip_address),
            'hostname': hostname,
            'location': {
                'country': geo_data.get('country'),
                'countryCode': geo_data.get('countryCode'),
                'region': geo_data.get('regionName'),
                'regionCode': geo_data.get('region'),
                'city': geo_data.get('city'),
                'zip': geo_data.get('zip'),
                'latitude': geo_data.get('lat'),
                'longitude': geo_data.get('lon'),
                'timezone': geo_data.get('timezone'),
            },
            'network': {
                'isp': geo_data.get('isp'),
                'organization': geo_data.get('org'),
                'asn': geo_data.get('as'),
            },
            'security': {
                'is_proxy': geo_data.get('proxy', False),
                'is_hosting': geo_data.get('hosting', False),
            }
        }

        return Response(result)

    except requests.RequestException as e:
        return Response(
            {'error': f'Network error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to lookup IP: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def http_request_tester(request):
    """
    Advanced HTTP request tester with support for authentication, query params, form data, etc.
    """
    try:
        data = request.data
        url = data.get('url')
        method = data.get('method', 'GET').upper()
        headers = data.get('headers', [])
        body = data.get('body', '')
        body_type = data.get('bodyType', 'none')  # none, json, form, raw, xml
        query_params = data.get('queryParams', [])
        auth_type = data.get('authType', 'none')  # none, bearer, basic, apikey
        auth_data = data.get('authData', {})
        timeout_seconds = int(data.get('timeout', 30))

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate URL
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return Response(
                    {'error': 'Invalid URL format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception:
            return Response(
                {'error': 'Invalid URL format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build query parameters
        params = {}
        if query_params:
            for param in query_params:
                if param.get('key') and param.get('enabled', True):
                    params[param['key']] = param.get('value', '')

        # Prepare headers
        req_headers = {}
        if headers:
            for header in headers:
                if header.get('key') and header.get('enabled', True):
                    req_headers[header['key']] = header.get('value', '')

        # Add User-Agent if not provided
        if 'User-Agent' not in req_headers:
            req_headers['User-Agent'] = 'DevTools-API-Tester/2.0'

        # Handle authentication
        auth = None
        if auth_type == 'bearer' and auth_data.get('token'):
            req_headers['Authorization'] = f"Bearer {auth_data['token']}"
        elif auth_type == 'basic' and auth_data.get('username'):
            from requests.auth import HTTPBasicAuth
            auth = HTTPBasicAuth(auth_data['username'], auth_data.get('password', ''))
        elif auth_type == 'apikey':
            key_name = auth_data.get('keyName', 'X-API-Key')
            key_value = auth_data.get('keyValue', '')
            add_to = auth_data.get('addTo', 'header')  # header or query
            if add_to == 'header':
                req_headers[key_name] = key_value
            else:
                params[key_name] = key_value

        # Prepare request body based on body type
        req_body = None
        files = None

        if method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if body_type == 'json' and body:
                try:
                    # Validate JSON
                    json.loads(body)
                    req_body = body
                    if 'Content-Type' not in req_headers:
                        req_headers['Content-Type'] = 'application/json'
                except json.JSONDecodeError:
                    return Response(
                        {'error': 'Invalid JSON in request body'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif body_type == 'form' and body:
                try:
                    # Parse form data
                    form_data = json.loads(body) if isinstance(body, str) else body
                    req_body = form_data
                except:
                    req_body = body
            elif body_type == 'xml' and body:
                req_body = body
                if 'Content-Type' not in req_headers:
                    req_headers['Content-Type'] = 'application/xml'
            elif body_type == 'raw' and body:
                req_body = body

        # Send request and measure time
        start_time = time.time()
        ssl_error = None
        cookies_dict = {}

        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                headers=req_headers,
                data=req_body,
                auth=auth,
                timeout=timeout_seconds,
                allow_redirects=True,
                verify=True
            )
        except requests.exceptions.SSLError as e:
            # Try without SSL verification
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    params=params,
                    headers=req_headers,
                    data=req_body,
                    auth=auth,
                    timeout=timeout_seconds,
                    allow_redirects=True,
                    verify=False
                )
                ssl_error = str(e)
            except Exception as retry_error:
                raise retry_error

        end_time = time.time()
        response_time = round((end_time - start_time) * 1000, 2)  # in milliseconds

        # Get response headers
        response_headers = dict(response.headers)

        # Get cookies
        cookies_dict = {cookie.name: cookie.value for cookie in response.cookies}

        # Try to get response body
        response_body = None
        content_type = response.headers.get('Content-Type', 'text/plain')

        try:
            # Try to parse as JSON
            response_body = response.json()
            is_json = True
        except:
            # Return as text
            try:
                response_body = response.text
                is_json = False
            except:
                response_body = '<Binary data>'
                is_json = False

        # Format size
        size_bytes = len(response.content)
        if size_bytes < 1024:
            size_formatted = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            size_formatted = f"{round(size_bytes / 1024, 2)} KB"
        else:
            size_formatted = f"{round(size_bytes / (1024 * 1024), 2)} MB"

        result = {
            'status_code': response.status_code,
            'status_text': response.reason,
            'headers': response_headers,
            'body': response_body,
            'content_type': content_type,
            'is_json': is_json,
            'response_time': response_time,
            'size': size_bytes,
            'size_formatted': size_formatted,
            'url': response.url,  # Final URL after redirects
            'ssl_error': ssl_error,
            'cookies': cookies_dict,
            'redirected': response.url != url,
        }

        return Response(result)

    except requests.exceptions.Timeout:
        return Response(
            {'error': 'Request timeout'},
            status=status.HTTP_408_REQUEST_TIMEOUT
        )
    except requests.exceptions.ConnectionError as e:
        return Response(
            {'error': f'Connection error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except requests.exceptions.RequestException as e:
        return Response(
            {'error': f'Request failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to send request: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def dns_lookup(request):
    """
    Perform DNS lookup for various record types.
    """
    try:
        domain = request.GET.get('domain')
        record_types = request.GET.get('types', 'A,AAAA,MX,TXT,CNAME,NS').split(',')

        if not domain:
            return Response(
                {'error': 'Domain is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove protocol if present
        domain = domain.replace('http://', '').replace('https://', '').split('/')[0]

        results = {}

        for record_type in record_types:
            record_type = record_type.strip().upper()
            try:
                resolver = dns.resolver.Resolver()
                resolver.timeout = 5
                resolver.lifetime = 5

                answers = resolver.resolve(domain, record_type)
                records = []

                for rdata in answers:
                    if record_type == 'MX':
                        records.append({
                            'priority': rdata.preference,
                            'value': str(rdata.exchange).rstrip('.')
                        })
                    elif record_type == 'SOA':
                        records.append({
                            'mname': str(rdata.mname),
                            'rname': str(rdata.rname),
                            'serial': rdata.serial,
                            'refresh': rdata.refresh,
                            'retry': rdata.retry,
                            'expire': rdata.expire,
                            'minimum': rdata.minimum
                        })
                    else:
                        value = str(rdata).rstrip('.')
                        # Clean TXT records
                        if record_type == 'TXT':
                            value = value.strip('"')
                        records.append({'value': value})

                results[record_type] = {
                    'success': True,
                    'records': records,
                    'ttl': answers.ttl if hasattr(answers, 'ttl') else None
                }

            except dns.resolver.NXDOMAIN:
                results[record_type] = {
                    'success': False,
                    'error': 'Domain does not exist'
                }
            except dns.resolver.NoAnswer:
                results[record_type] = {
                    'success': False,
                    'error': 'No records found'
                }
            except dns.resolver.Timeout:
                results[record_type] = {
                    'success': False,
                    'error': 'DNS query timeout'
                }
            except Exception as e:
                results[record_type] = {
                    'success': False,
                    'error': str(e)
                }

        return Response({
            'domain': domain,
            'results': results
        })

    except Exception as e:
        return Response(
            {'error': f'DNS lookup failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def ping_test(request):
    """
    Test website availability and response time.
    """
    try:
        url = request.GET.get('url')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # Validate URL
        try:
            parsed = urlparse(url)
            if not parsed.netloc:
                return Response(
                    {'error': 'Invalid URL format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception:
            return Response(
                {'error': 'Invalid URL format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Perform multiple pings
        ping_count = 4
        results = []
        total_time = 0
        successful_pings = 0

        for i in range(ping_count):
            try:
                start_time = time.time()
                response = requests.get(
                    url,
                    timeout=10,
                    allow_redirects=True,
                    headers={'User-Agent': 'DevTools-Ping/1.0'}
                )
                end_time = time.time()

                response_time = round((end_time - start_time) * 1000, 2)
                total_time += response_time
                successful_pings += 1

                results.append({
                    'sequence': i + 1,
                    'success': True,
                    'time': response_time,
                    'status_code': response.status_code
                })

            except requests.exceptions.Timeout:
                results.append({
                    'sequence': i + 1,
                    'success': False,
                    'error': 'Timeout'
                })
            except requests.exceptions.ConnectionError as e:
                results.append({
                    'sequence': i + 1,
                    'success': False,
                    'error': 'Connection failed'
                })
            except Exception as e:
                results.append({
                    'sequence': i + 1,
                    'success': False,
                    'error': str(e)
                })

            # Small delay between pings
            if i < ping_count - 1:
                time.sleep(0.5)

        # Calculate statistics
        avg_time = round(total_time / successful_pings, 2) if successful_pings > 0 else None
        packet_loss = round(((ping_count - successful_pings) / ping_count) * 100, 2)

        # Get IP address
        try:
            hostname = parsed.netloc.split(':')[0]
            ip_address = socket.gethostbyname(hostname)
        except:
            ip_address = None

        return Response({
            'url': url,
            'host': parsed.netloc,
            'ip_address': ip_address,
            'results': results,
            'statistics': {
                'packets_sent': ping_count,
                'packets_received': successful_pings,
                'packet_loss': packet_loss,
                'avg_response_time': avg_time,
                'min_response_time': round(min([r['time'] for r in results if r['success']], default=0), 2) if successful_pings > 0 else None,
                'max_response_time': round(max([r['time'] for r in results if r['success']], default=0), 2) if successful_pings > 0 else None,
            }
        })

    except Exception as e:
        return Response(
            {'error': f'Ping test failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def whois_lookup(request):
    """
    Get WHOIS information for a domain.
    """
    try:
        domain = request.GET.get('domain')

        if not domain:
            return Response(
                {'error': 'Domain is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove protocol if present
        domain = domain.replace('http://', '').replace('https://', '').split('/')[0]

        # Perform WHOIS lookup
        try:
            w = whois.whois(domain)
        except Exception as e:
            return Response(
                {'error': f'WHOIS lookup failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Format dates
        def format_date(date_value):
            if date_value is None:
                return None
            if isinstance(date_value, list):
                date_value = date_value[0] if date_value else None
            if date_value:
                return date_value.isoformat() if hasattr(date_value, 'isoformat') else str(date_value)
            return None

        # Format list values
        def format_list(value):
            if value is None:
                return None
            if isinstance(value, list):
                return [str(v) for v in value if v]
            return [str(value)] if value else None

        result = {
            'domain': domain,
            'registrar': w.registrar,
            'whois_server': w.whois_server,
            'creation_date': format_date(w.creation_date),
            'expiration_date': format_date(w.expiration_date),
            'updated_date': format_date(w.updated_date),
            'status': format_list(w.status),
            'name_servers': format_list(w.name_servers),
            'registrant': {
                'name': w.get('registrant_name'),
                'organization': w.get('org'),
                'email': format_list(w.emails)[0] if w.emails else None,
                'country': w.country,
            },
            'raw_text': w.text if hasattr(w, 'text') else None,
        }

        return Response(result)

    except Exception as e:
        return Response(
            {'error': f'WHOIS lookup failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
