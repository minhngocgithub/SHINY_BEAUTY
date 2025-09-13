function stripHtmlTags(htmlText) {
    if (!htmlText || typeof htmlText !== 'string') return '';
    
    return htmlText
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .substring(0, 500);
}

module.exports = { stripHtmlTags };