/**
 * XML Sitemap Validator Library
 * Validates XML sitemap structure and URL patterns
 */
class XMLSitemapValidator {
    constructor() {
        this.baseUrl = 'https://www.tiket.com';
    }

    /**
     * Main validation method
     * @param {string} xmlContent - XML content as string
     * @param {string} parentPath - Parent folder path to combine with URLs
     * @returns {Object} Validation result object
     */
    validate(xmlContent, parentPath) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            urlResults: [],
            totalUrls: 0,
            validUrls: 0,
            invalidUrls: 0
        };

        try {
            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                result.isValid = false;
                result.errors.push({
                    type: 'Parse Error',
                    message: 'Invalid XML format',
                    details: parseError.textContent
                });
                return result;
            }

            // Validate XML structure
            this.validateXMLStructure(xmlDoc, result);

            // Normalize parent path (remove leading/trailing slashes)
            const normalizedParentPath = this.normalizePath(parentPath);

            // Get all url elements (not just loc)
            const urlElements = xmlDoc.querySelectorAll('url');
            result.totalUrls = urlElements.length;

            if (urlElements.length === 0) {
                result.warnings.push({
                    message: 'No URLs found in sitemap',
                    type: 'Empty Sitemap'
                });
            }

            urlElements.forEach((urlElement, index) => {
                const locElement = urlElement.querySelector('loc');
                if (!locElement) {
                    result.invalidUrls++;
                    result.isValid = false;
                    result.errors.push({
                        type: 'Structure Error',
                        message: `Missing <loc> element in <url> at index ${index + 1}`,
                        index: index + 1
                    });
                    return;
                }

                const url = locElement.textContent.trim();
                const urlResult = this.validateURLBlock(urlElement, url, normalizedParentPath, index + 1);
                
                result.urlResults.push(urlResult);

                if (urlResult.isValid) {
                    result.validUrls++;
                } else {
                    result.invalidUrls++;
                    result.isValid = false;
                    result.errors.push(...urlResult.errors.map(err => ({
                        type: 'URL Validation Error',
                        message: err,
                        url: urlResult.url,
                        index: index + 1
                    })));
                }

                if (urlResult.warnings && urlResult.warnings.length > 0) {
                    result.warnings.push(...urlResult.warnings.map(warn => ({
                        message: warn,
                        url: urlResult.url,
                        type: 'URL Warning'
                    })));
                }
            });

            // Validate sitemap structure
            this.validateSitemapStructure(xmlDoc, result);

        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'Validation Error',
                message: error.message,
                details: error.stack
            });
        }

        return result;
    }

    /**
     * Validate XML structure
     */
    validateXMLStructure(xmlDoc, result) {
        // Check for urlset root element
        const urlset = xmlDoc.querySelector('urlset');
        if (!urlset) {
            result.isValid = false;
            result.errors.push({
                type: 'Structure Error',
                message: 'Missing <urlset> root element'
            });
            return;
        }

        // Check for xmlns attribute
        const xmlns = urlset.getAttribute('xmlns');
        if (!xmlns || !xmlns.includes('sitemaps.org')) {
            result.warnings.push({
                message: 'Missing or invalid xmlns attribute in <urlset>',
                type: 'Structure Warning'
            });
        }

        // Check for url elements
        const urlElements = xmlDoc.querySelectorAll('url');
        if (urlElements.length === 0) {
            result.warnings.push({
                message: 'No <url> elements found in sitemap',
                type: 'Structure Warning'
            });
        }

        // Check for xhtml namespace
        const xhtmlNs = urlset.getAttribute('xmlns:xhtml');
        if (!xhtmlNs || xhtmlNs !== 'http://www.w3.org/1999/xhtml') {
            result.warnings.push({
                message: 'Missing or invalid xmlns:xhtml attribute in <urlset>',
                type: 'Structure Warning'
            });
        }

        // Validate each url element structure
        urlElements.forEach((urlElement, index) => {
            const loc = urlElement.querySelector('loc');
            if (!loc) {
                result.isValid = false;
                result.errors.push({
                    type: 'Structure Error',
                    message: `Missing <loc> element in <url> at index ${index + 1}`,
                    index: index + 1
                });
            }

            // Check for xhtml:link elements
            const xhtmlLinks = urlElement.querySelectorAll('xhtml\\:link, link');
            if (xhtmlLinks.length === 0) {
                result.warnings.push({
                    message: `No <xhtml:link> elements found in <url> at index ${index + 1}`,
                    type: 'Structure Warning',
                    index: index + 1
                });
            }
        });
    }

    /**
     * Validate sitemap structure (optional elements)
     */
    validateSitemapStructure(xmlDoc, result) {
        const urlElements = xmlDoc.querySelectorAll('url');
        
        urlElements.forEach((urlElement, index) => {
            // Check for optional but recommended elements
            const lastmod = urlElement.querySelector('lastmod');
            const changefreq = urlElement.querySelector('changefreq');
            const priority = urlElement.querySelector('priority');

            if (!lastmod) {
                result.warnings.push({
                    message: `Missing <lastmod> in URL at index ${index + 1}`,
                    type: 'Structure Warning',
                    index: index + 1
                });
            }

            if (!changefreq) {
                result.warnings.push({
                    message: `Missing <changefreq> in URL at index ${index + 1}`,
                    type: 'Structure Warning',
                    index: index + 1
                });
            }

            if (!priority) {
                result.warnings.push({
                    message: `Missing <priority> in URL at index ${index + 1}`,
                    type: 'Structure Warning',
                    index: index + 1
                });
            }
        });
    }

    /**
     * Validate a complete URL block (loc + xhtml:link elements)
     * @param {Element} urlElement - The <url> XML element
     * @param {string} locUrl - The URL from <loc> element
     * @param {string} parentPath - Parent folder path
     * @param {number} index - URL index
     * @returns {Object} URL validation result
     */
    validateURLBlock(urlElement, locUrl, parentPath, index) {
        const result = {
            url: locUrl,
            index: index,
            isValid: true,
            errors: [],
            warnings: [],
            hreflangResults: []
        };

        // Validate the loc URL
        const locValidation = this.validateLocURL(locUrl, parentPath);
        if (!locValidation.isValid) {
            result.isValid = false;
            result.errors.push(...locValidation.errors);
        }
        if (locValidation.warnings) {
            result.warnings.push(...locValidation.warnings);
        }

        // Get all xhtml:link elements
        const xhtmlLinks = urlElement.querySelectorAll('xhtml\\:link, link');
        
        if (xhtmlLinks.length === 0) {
            result.warnings.push('No <xhtml:link> elements found');
        } else {
            // Validate each xhtml:link
            const hreflangMap = new Map();
            let hasXDefault = false;

            xhtmlLinks.forEach((linkElement, linkIndex) => {
                const hreflangResult = this.validateHreflangLink(linkElement, locUrl, linkIndex + 1);
                result.hreflangResults.push(hreflangResult);

                if (!hreflangResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...hreflangResult.errors);
                }

                if (hreflangResult.warnings) {
                    result.warnings.push(...hreflangResult.warnings);
                }

                // Track hreflang values
                if (hreflangResult.hreflang) {
                    if (hreflangResult.hreflang === 'x-default') {
                        hasXDefault = true;
                    } else {
                        hreflangMap.set(hreflangResult.hreflang, hreflangResult.href);
                    }
                }
            });

            // Check for x-default
            if (!hasXDefault) {
                result.isValid = false;
                result.errors.push('Missing <xhtml:link> with hreflang="x-default"');
            }

            // Validate that hreflang values match locale in href
            hreflangMap.forEach((href, hreflang) => {
                const localeFromHref = this.extractLocaleFromURL(href);
                if (localeFromHref !== hreflang) {
                    result.isValid = false;
                    result.errors.push(`Hreflang "${hreflang}" does not match locale in href "${href}" (expected locale: ${localeFromHref})`);
                }
            });
        }

        return result;
    }

    /**
     * Validate the loc URL
     * @param {string} url - URL to validate
     * @param {string} parentPath - Parent folder path
     * @returns {Object} Validation result
     */
    validateLocURL(url, parentPath) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check if URL is empty
        if (!url || url.trim() === '') {
            result.isValid = false;
            result.errors.push('URL is empty');
            return result;
        }

        // Check if URL starts with base URL
        if (!url.startsWith(this.baseUrl)) {
            result.isValid = false;
            result.errors.push(`URL does not start with ${this.baseUrl}`);
            return result;
        }

        // Extract path from URL
        const urlPath = url.replace(this.baseUrl, '').replace(/^\/+/, '');

        // Check if URL contains parent path
        if (parentPath && !urlPath.startsWith(parentPath)) {
            result.isValid = false;
            result.errors.push(`URL path does not start with parent folder path: ${parentPath}`);
            return result;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Invalid URL format: ${error.message}`);
            return result;
        }

        // Check for common issues
        if (url.includes('//') && url.split('//').length > 2) {
            result.warnings.push('URL contains multiple consecutive slashes');
        }

        if (url.endsWith('/')) {
            result.warnings.push('URL ends with trailing slash');
        }

        return result;
    }

    /**
     * Validate an xhtml:link element
     * @param {Element} linkElement - The xhtml:link XML element
     * @param {string} locUrl - The URL from <loc> element
     * @param {number} index - Link index
     * @returns {Object} Validation result
     */
    validateHreflangLink(linkElement, locUrl, index) {
        const result = {
            index: index,
            isValid: true,
            errors: [],
            warnings: [],
            hreflang: null,
            href: null
        };

        // Check rel attribute
        const rel = linkElement.getAttribute('rel');
        if (!rel || rel !== 'alternate') {
            result.isValid = false;
            result.errors.push(`Missing or invalid rel attribute (expected "alternate", got "${rel}")`);
        }

        // Check hreflang attribute
        const hreflang = linkElement.getAttribute('hreflang');
        if (!hreflang) {
            result.isValid = false;
            result.errors.push('Missing hreflang attribute');
            return result;
        }
        result.hreflang = hreflang;

        // Check href attribute
        const href = linkElement.getAttribute('href');
        if (!href) {
            result.isValid = false;
            result.errors.push('Missing href attribute');
            return result;
        }
        result.href = href;

        // Validate href URL format
        if (!href.startsWith(this.baseUrl)) {
            result.isValid = false;
            result.errors.push(`Href URL does not start with ${this.baseUrl}`);
            return result;
        }

        // Validate URL format
        try {
            new URL(href);
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Invalid href URL format: ${error.message}`);
            return result;
        }

        // For non-x-default hreflangs, validate that hreflang matches locale in URL
        if (hreflang !== 'x-default') {
            const localeFromHref = this.extractLocaleFromURL(href);
            if (localeFromHref && localeFromHref !== hreflang) {
                result.isValid = false;
                result.errors.push(`Hreflang "${hreflang}" does not match locale in href URL (found: ${localeFromHref})`);
            }
        }

        return result;
    }

    /**
     * Extract locale from URL (e.g., "id-id", "en-us" from path)
     * @param {string} url - URL to extract locale from
     * @returns {string|null} Locale code or null
     */
    extractLocaleFromURL(url) {
        try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/').filter(seg => seg.trim() !== '');
            
            // Locale is typically the first segment after domain
            if (pathSegments.length > 0) {
                const firstSegment = pathSegments[0];
                // Check if it matches locale pattern (e.g., "id-id", "en-us")
                if (/^[a-z]{2}-[a-z]{2}$/i.test(firstSegment)) {
                    return firstSegment.toLowerCase();
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Normalize path (remove leading/trailing slashes)
     * @param {string} path - Path to normalize
     * @returns {string} Normalized path
     */
    normalizePath(path) {
        if (!path) return '';
        return path.replace(/^\/+|\/+$/g, '');
    }

    /**
     * Get expected URL format
     * @param {string} parentPath - Parent folder path
     * @param {string} additionalPath - Additional path from XML
     * @returns {string} Expected URL
     */
    getExpectedURL(parentPath, additionalPath = '') {
        const normalizedParent = this.normalizePath(parentPath);
        const normalizedAdditional = this.normalizePath(additionalPath);
        
        if (normalizedAdditional) {
            return `${this.baseUrl}/${normalizedParent}/${normalizedAdditional}`;
        }
        return `${this.baseUrl}/${normalizedParent}`;
    }
}

// Export for use in Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XMLSitemapValidator;
}

