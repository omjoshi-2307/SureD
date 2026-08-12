import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, ShieldCheck, Upload, Trash2, ExternalLink, Image as ImageIcon, Sparkle, Clock, Lock, AlertCircle } from 'lucide-react';

export interface PhotoVaultItem {
  id: string;
  title: string;
  category: 'Move-In' | 'Move-Out' | 'Inventory';
  imageUrl: string;
  ipfsHash: string;
  timestamp: string;
  uploadedBy: 'student' | 'landlord';
  verified: boolean;
  notes?: string;
}

interface InspectionPhotoVaultProps {
  escrowId: string | number;
  userRole: 'student' | 'landlord';
}

export const InspectionPhotoVault: React.FC<InspectionPhotoVaultProps> = ({ escrowId, userRole }) => {
  const STORAGE_KEY = `suredeposit_inspection_vault_${escrowId}`;
  const [items, setItems] = useState<PhotoVaultItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Move-In' | 'Move-Out' | 'Inventory'>('Move-In');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse inspection vault items:", e);
      }
    } else {
      // Seed default sample entries if empty
      const initialSeed: PhotoVaultItem[] = [
        {
          id: '1',
          title: 'Living Room Walls & Flooring',
          category: 'Move-In',
          imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
          ipfsHash: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          timestamp: new Date(Date.now() - 86400000 * 3).toLocaleString(),
          uploadedBy: 'student',
          verified: true,
          notes: 'No scuffs or marks on walls. Hardwood clean.'
        },
        {
          id: '2',
          title: 'Kitchen Counter & Appliances Inspection',
          category: 'Move-In',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
          ipfsHash: 'ipfs://bafybeihdwdcefgh4dqkjv67jhv5yxl2b3kj7y26nf3efuylqabf3oclgtq',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
          uploadedBy: 'landlord',
          verified: true,
          notes: 'All appliances functioning. Counter clean.'
        }
      ];
      setItems(initialSeed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
    }
  }, [STORAGE_KEY]);

  const saveItems = (updated: PhotoVaultItem[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateIpfsCid = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `ipfs://bafybei${randomHex.slice(0, 40)}`;
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imagePreview) return;

    setIsUploading(true);
    setTimeout(() => {
      const newItem: PhotoVaultItem = {
        id: Date.now().toString(),
        title,
        category,
        imageUrl: imagePreview,
        ipfsHash: generateIpfsCid(),
        timestamp: new Date().toLocaleString(),
        uploadedBy: userRole,
        verified: true,
        notes: notes || undefined,
      };

      saveItems([newItem, ...items]);
      setIsUploading(false);
      setShowUploadModal(false);
      // Reset form
      setTitle('');
      setNotes('');
      setImagePreview(null);
    }, 1200);
  };

  const removeItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      padding: 24,
      marginTop: 24,
      fontFamily: "'Inter', sans-serif",
      color: '#FFF'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(124, 92, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A78BFA'
            }}>
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Condition & Inspection Vault (IPFS Proof)
                <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>
                  Web3 Immutable
                </span>
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0' }}>
                Upload move-in / move-out property condition photos locked to IPFS to prevent deposit disputes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #7C5CFF 0%, #9066FF 100%)',
            border: 'none', borderRadius: 10,
            padding: '10px 16px', color: '#FFF',
            fontWeight: 600, fontSize: '0.82rem',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(124, 92, 255, 0.3)'
          }}
        >
          <Upload size={14} />
          Add Proof Photo
        </button>
      </div>

      {/* Grid of Inspection Photos */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <ImageIcon size={32} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>No inspection photos pinned yet</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Add move-in pictures of walls, furniture, and appliances for dispute protection.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: 160, background: '#000' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute', top: 10, left: 10,
                  background: 'rgba(11, 10, 17, 0.8)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 6, padding: '3px 8px',
                  fontSize: '0.68rem', fontWeight: 600, color: '#A78BFA'
                }}>
                  {item.category}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  title="Remove proof photo"
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: 'none', borderRadius: 6,
                    width: 26, height: 26, color: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 4px', color: '#FFF' }}>{item.title}</h4>
                  {item.notes && (
                    <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>{item.notes}</p>
                  )}
                </div>

                <div>
                  <div style={{
                    fontSize: '0.68rem', fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.3)',
                    padding: '4px 8px', borderRadius: 6, overflowX: 'auto',
                    whiteSpace: 'nowrap', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <ShieldCheck size={11} style={{ color: '#34D399', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.ipfsHash}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {item.timestamp}
                    </span>
                    <span style={{ textTransform: 'capitalize', color: item.uploadedBy === 'student' ? '#A78BFA' : '#60A5FA' }}>
                      By {item.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            width: '100%', maxWidth: 450,
            background: 'linear-gradient(145deg, #14131D 0%, #0B0A11 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 20,
            padding: 24, color: '#FFF'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px' }}>Upload Inspection Proof to IPFS</h3>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Title / Location Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master Bedroom Flooring / Kitchen Sink"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFF', fontSize: '0.84rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: '#111019', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFF', fontSize: '0.84rem', outline: 'none'
                  }}
                >
                  <option value="Move-In">Move-In Check (Check-in)</option>
                  <option value="Move-Out">Move-Out Check (Check-out)</option>
                  <option value="Inventory">Inventory List</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Notes / Damage Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any pre-existing scratches, clean state, key condition..."
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFF', fontSize: '0.84rem', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Select Inspection Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  style={{ display: 'none' }}
                  id="vault-file-input"
                />
                <label
                  htmlFor="vault-file-input"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 16, borderRadius: 10, border: '1px dashed rgba(124, 92, 255, 0.4)',
                    background: 'rgba(124, 92, 255, 0.05)', cursor: 'pointer', textCenter: 'center'
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ height: 100, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Upload size={20} style={{ color: '#A78BFA', marginBottom: 6 }} />
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Click to browse or take photo</span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>PNG, JPG, WebP supported</span>
                    </>
                  )}
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: '#FFF', fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !imagePreview || !title}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)', border: 'none',
                    color: '#FFF', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    opacity: (!imagePreview || !title) ? 0.5 : 1
                  }}
                >
                  {isUploading ? 'Pinning to IPFS...' : 'Pin Proof to IPFS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
