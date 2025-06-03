import { extractComplexityBadge, extractRiskBadge } from './formatUtils';

export const formatList = (content: string): string => {
  if (!content) return '';
  return content.split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      const formattedItem = item.replace(/^-\s*/, '').replace(/\*\*/g, '');
      
      if (formattedItem.toLowerCase().includes('warning') || formattedItem.toLowerCase().includes('risk')) {
        return `<div class="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl mb-3 hover:bg-red-100 transition-all duration-200">
          <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
            <span class="text-white text-xs font-bold">!</span>
          </div>
          <div class="text-red-800 font-medium">${formattedItem}</div>
        </div>`;
      }
      
      if (formattedItem.toLowerCase().includes('success') || formattedItem.toLowerCase().includes('verified')) {
        return `<div class="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl mb-3 hover:bg-green-100 transition-all duration-200">
          <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <span class="text-white text-xs font-bold">✓</span>
          </div>
          <div class="text-green-800 font-medium">${formattedItem}</div>
        </div>`;
      }
      
      if (formattedItem.toLowerCase().includes('ftso') || formattedItem.toLowerCase().includes('oracle')) {
        return `<div class="flex items-start gap-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl mb-3 hover:bg-purple-100 transition-all duration-200">
          <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
            <span class="text-white text-xs font-bold">📊</span>
          </div>
          <div class="text-purple-800 font-medium">${formattedItem}</div>
        </div>`;
      }
      
      return `<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2 hover:bg-gray-100 transition-all duration-200">
        <div class="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
        <div class="text-gray-800">${formattedItem}</div>
      </div>`;
    })
    .join('');
};

const formatKeyValuePair = (key: string, value: string): string => {
  return `
    <div class="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all duration-200">
      <span class="text-gray-600 font-medium">${key}</span>
      <span class="text-gray-900 font-semibold">${value}</span>
    </div>
  `;
};

const formatTokenTransfers = (content: string): string => {
  if (!content) return '<div class="text-center py-8 text-gray-500">No transfers detected</div>';
  
  const transfers = content.split('\n\n').map(group => group.trim()).filter(group => group);
  
  return transfers.map(transfer => {
    const lines = transfer.split('\n').map(line => line.trim()).filter(line => line);
    
    return `
      <div class="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 mb-4 hover:shadow-md transition-all duration-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold">💰</span>
          </div>
          <h4 class="text-lg font-semibold text-gray-900">Transfer Details</h4>
        </div>
        <div class="grid grid-cols-1 gap-2">
          ${lines.map(line => {
            const [key, value] = line.split(':').map(part => part.trim());
            if (!value) return `<div class="text-gray-700 font-medium py-2">${key}</div>`;
            return formatKeyValuePair(key, value);
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
};

export const formatTransferSection = (content: string): string => {
  if (!content) return '<div class="text-center py-8 text-gray-500 italic">No transfers detected</div>';
  
  const parts = content.split('---Sub Section---');
  let html = '';
  
  parts.forEach(part => {
    const trimmedPart = part.trim();
    
    if (trimmedPart.includes('Native Currency:')) {
      html += `<div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-xl">🏦</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">Native Currency Transfer</h4>
        </div>
        <div class="bg-white rounded-xl p-4 border border-blue-100">
          ${formatList(trimmedPart.replace('Native Currency:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedPart.includes('Token Transfers (ERC20):')) {
      html += `<div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-xl">🪙</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">Token Transfers</h4>
        </div>
        <div class="bg-white rounded-xl p-4 border border-green-100">
          ${formatTokenTransfers(trimmedPart.replace('Token Transfers (ERC20):', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedPart.includes('NFT Transfers')) {
      html += `<div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-xl">🖼️</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">NFT Transfers</h4>
        </div>
        <div class="bg-white rounded-xl p-4 border border-purple-100">
          ${formatTokenTransfers(trimmedPart.replace('NFT Transfers (ERC721/ERC1155):', '').trim())}
        </div>
      </div>`;
    }
  });
  
  return html || '<div class="text-center py-8 text-gray-500 italic">No transfers detected</div>';
};

const formatFlareEcosystemSection = (content: string): string => {
  if (!content) return '<div class="text-center py-8 text-gray-500 italic">No Flare ecosystem interactions detected</div>';
  
  const parts = content.split('---Sub Section---');
  let html = '';
  
  parts.forEach(part => {
    const trimmedPart = part.trim();
    
    if (trimmedPart.includes('FTSO Data Interactions:')) {
      html += `<div class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <span class="text-white text-xl">📊</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">FTSO Data Oracle Interactions</h4>
          <span class="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Data Feeds</span>
        </div>
        <div class="bg-white rounded-xl p-4 border border-purple-100">
          ${formatList(trimmedPart.replace('FTSO Data Interactions:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedPart.includes('FAssets Bridge Activity:')) {
      html += `<div class="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <span class="text-white text-xl">🌉</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">FAssets Bridge Activity</h4>
          <span class="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Cross-Chain</span>
        </div>
        <div class="bg-white rounded-xl p-4 border border-orange-100">
          ${formatList(trimmedPart.replace('FAssets Bridge Activity:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedPart.includes('Data Connector (FDC) Usage:')) {
      html += `<div class="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span class="text-white text-xl">🔗</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">Flare Data Connector (FDC)</h4>
          <span class="ml-auto px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">External Data</span>
        </div>
        <div class="bg-white rounded-xl p-4 border border-cyan-100">
          ${formatList(trimmedPart.replace('Data Connector (FDC) Usage:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedPart.includes('Staking & Delegation:')) {
      html += `<div class="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
            <span class="text-white text-xl">🎯</span>
          </div>
          <h4 class="text-xl font-bold text-gray-900">Staking & Delegation</h4>
          <span class="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Rewards</span>
        </div>
        <div class="bg-white rounded-xl p-4 border border-emerald-100">
          ${formatList(trimmedPart.replace('Staking & Delegation:', '').trim())}
        </div>
      </div>`;
    }
  });
  
  return html || `<div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center">
    <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-gray-600 text-2xl">🔍</span>
    </div>
    <h4 class="text-lg font-semibold text-gray-700 mb-2">No Flare Ecosystem Interactions</h4>
    <p class="text-gray-600">This transaction doesn't utilize Flare's unique features like FTSO, FAssets, or FDC.</p>
  </div>`;
};

export const formatAssistantMessage = (content: string): string => {
  if (!content) return '';
  
  const sections = content.split('---Section---');
  let formattedContent = '';
  
  sections.forEach(section => {
    const trimmedSection = section.trim();
    
    if (trimmedSection.includes('TRANSACTION OVERVIEW:')) {
      formattedContent += `<div class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">🔍</span>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Transaction Overview</h3>
            <div class="flex items-center gap-3">
              ${extractComplexityBadge(trimmedSection)}
              ${extractRiskBadge(trimmedSection)}
            </div>
          </div>
        </div>
        <div class="prose prose-lg max-w-none">
          ${formatList(trimmedSection.replace('TRANSACTION OVERVIEW:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('NETWORK DETAILS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">🌐</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Network Information</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${trimmedSection.replace('NETWORK DETAILS:', '').trim().split('\n').map(line => {
            const [key, value] = line.trim().split(':').map(part => part.trim());
            if (!value) return '';
            return `
              <div class="bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-200 transition-all duration-200">
                <div class="text-sm text-blue-600 font-medium mb-1">${key}</div>
                <div class="text-lg font-semibold text-gray-900">${value}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('FLARE ECOSYSTEM ANALYSIS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">🚀</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Flare Ecosystem Analysis</h3>
          <span class="ml-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Blockchain for Data</span>
        </div>
        ${formatFlareEcosystemSection(trimmedSection.replace('FLARE ECOSYSTEM ANALYSIS:', '').trim())}
      </div>`;
    }
    else if (trimmedSection.includes('TRANSFER ANALYSIS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">↔️</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Transfer Analysis</h3>
        </div>
        ${formatTransferSection(trimmedSection.replace('TRANSFER ANALYSIS:', '').trim())}
      </div>`;
    }
    else if (trimmedSection.includes('CONTRACT INTERACTIONS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">📝</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Smart Contract Interactions</h3>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-yellow-100">
          ${formatList(trimmedSection.replace('CONTRACT INTERACTIONS:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('COST ANALYSIS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">⛽</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Transaction Cost Analysis</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${trimmedSection.replace('COST ANALYSIS:', '').trim().split('\n').map(line => {
            const [key, value] = line.trim().split(':').map(part => part.trim());
            if (!value) return '';
            return `
              <div class="bg-white rounded-xl p-4 border border-amber-100 hover:border-amber-200 transition-all duration-200">
                <div class="text-sm text-amber-600 font-medium mb-1">${key}</div>
                <div class="text-lg font-semibold text-gray-900">${value}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('SECURITY ASSESSMENT:')) {
      formattedContent += `<div class="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">🛡️</span>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Security Assessment</h3>
            ${extractRiskBadge(trimmedSection)}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-red-100">
          ${formatList(trimmedSection.replace('SECURITY ASSESSMENT:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('DATA INSIGHTS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">📊</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Data & Analytics Insights</h3>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-cyan-100">
          ${formatList(trimmedSection.replace('DATA INSIGHTS:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('ADDITIONAL INSIGHTS:')) {
      formattedContent += `<div class="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">💡</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Developer Insights & Recommendations</h3>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-indigo-100">
          ${formatList(trimmedSection.replace('ADDITIONAL INSIGHTS:', '').trim())}
        </div>
      </div>`;
    }
    else if (trimmedSection.includes('INFORMATION:')) {
      formattedContent += `<div class="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-3xl p-8 mb-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl">ℹ️</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Information</h3>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          ${formatList(trimmedSection.replace('INFORMATION:', '').trim())}
        </div>
      </div>`;
    }
  });
  
  return formattedContent || `<div class="text-gray-700 whitespace-pre-wrap p-6 bg-white rounded-2xl border border-gray-200">${content}</div>`;
};