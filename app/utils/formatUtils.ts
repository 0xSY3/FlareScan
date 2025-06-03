export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const extractComplexityBadge = (content: string): string => {
  const complexityMatch = content.match(/complexity score: (Simple|Moderate|Complex|Very Complex)/i);
  if (!complexityMatch) return '';
  
  const complexity = complexityMatch[1].toLowerCase();
  const badgeConfig = {
    'simple': {
      color: 'bg-green-100 text-green-800 border border-green-200',
      icon: '✓',
      description: 'Low complexity transaction'
    },
    'moderate': {
      color: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: '○',
      description: 'Moderate complexity'
    },
    'complex': {
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: '◐',
      description: 'High complexity transaction'
    },
    'very complex': {
      color: 'bg-red-100 text-red-800 border border-red-200',
      icon: '●',
      description: 'Very high complexity'
    }
  }[complexity] || {
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: '?',
    description: 'Unknown complexity'
  };

  return `
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeConfig.color} font-medium text-sm shadow-sm">
      <span class="font-bold">${badgeConfig.icon}</span>
      <span>${complexityMatch[1]} Complexity</span>
    </div>
  `;
};

export const extractRiskBadge = (content: string): string => {
  const riskMatch = content.match(/risk level: (Low|Medium|High)/i);
  if (!riskMatch) return '';
  
  const risk = riskMatch[1].toLowerCase();
  const badgeConfig = {
    'low': {
      color: 'bg-green-100 text-green-800 border border-green-200',
      icon: '🟢',
      description: 'Low risk transaction'
    },
    'medium': {
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: '🟡',
      description: 'Medium risk - exercise caution'
    },
    'high': {
      color: 'bg-red-100 text-red-800 border border-red-200',
      icon: '🔴',
      description: 'High risk - review carefully'
    }
  }[risk] || {
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: '⚪',
    description: 'Unknown risk level'
  };

  return `
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeConfig.color} font-medium text-sm shadow-sm">
      <span>${badgeConfig.icon}</span>
      <span>${riskMatch[1]} Risk</span>
    </div>
  `;
};