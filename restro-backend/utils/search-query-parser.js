function searchQueryParser(searchQuery, searchCommands) {
    if (!searchQuery) return [];
    const searchTerm = escapeRegExp(searchQuery).replace(/(\s*:\s*)/g, ':');
    let searchTokens = searchTerm.trim().split(/(?!\B"[^"]*)\bAND\b(?![^"]*"\B)/gi);
  
    if (searchTokens.length === 1) {
      searchTokens = searchTerm.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    }
  
    return searchTokens?.map((phrase) => phrase.trim().replace(/"+/g, '')) ?? [];
  }
  
  function searchQueryIngnoringSpacesParser(searchQuery, searchCommands) {
    if (!searchQuery) return [];
    const searchTerm = escapeRegExp(searchQuery).replace(/(\s*:\s*)/g, ':');
    const searchTokens = searchTerm.split(/(?!\B"[^"]*)\bAND\b(?![^"]*"\B)/gi);
  
    return searchTokens?.map((phrase) => phrase.trim().replace(/"+/g, '')) ?? [];
  }
  
  function escapeRegExp(str) {
    if (!str) {
      return '';
    }
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  module.exports = { searchQueryParser, searchQueryIngnoringSpacesParser };
  