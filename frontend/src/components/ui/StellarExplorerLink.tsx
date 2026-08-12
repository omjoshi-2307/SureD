import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface StellarExplorerLinkProps {
  txHash: string;
  network?: string;
  label?: string;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

export const StellarExplorerLink: React.FC<StellarExplorerLinkProps> = ({
  txHash,
  network = 'testnet',
  label,
  showIcon = true,
  style,
}) => {
  if (!txHash) return null;

  // Determine network segment for StellarExpert
  const netSegment = network.toLowerCase().includes('main') ? 'public' : 'testnet';
  const url = `https://stellar.expert/explorer/${netSegment}/tx/${txHash}`;
  
  const shortHash = txHash.length > 16 
    ? `${txHash.slice(0, 8)}...${txHash.slice(-8)}`
    : txHash;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`View transaction ${txHash} on StellarExpert Explorer`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(124, 92, 255, 0.12)',
        border: '1px solid rgba(124, 92, 255, 0.3)',
        borderRadius: 8,
        padding: '4px 10px',
        color: '#A78BFA',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.74rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(124, 92, 255, 0.22)';
        e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.5)';
        e.currentTarget.style.color = '#FFF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(124, 92, 255, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.3)';
        e.currentTarget.style.color = '#A78BFA';
      }}
    >
      <CheckCircle size={12} style={{ color: '#34D399', flexShrink: 0 }} />
      <span>{label || shortHash}</span>
      {showIcon && <ExternalLink size={12} style={{ opacity: 0.7, flexShrink: 0 }} />}
    </a>
  );
};
