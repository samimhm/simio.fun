import React, { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import { TrophyIcon, UsersIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowPathIcon, TrashIcon, DocumentArrowDownIcon, EyeIcon, ArrowLeftOnRectangleIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import 'react-toastify/dist/ReactToastify.css';
import { usePhantomWallet } from '../hooks/usePhantomWallet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <Squares2X2Icon className="h-5 w-5" /> },
  { key: 'affiliates', label: 'Affiliates', icon: <UsersIcon className="h-5 w-5" /> },
  { key: 'rounds', label: 'Rounds', icon: <TrophyIcon className="h-5 w-5" /> },
  { key: 'export', label: 'Export', icon: <DocumentArrowDownIcon className="h-5 w-5" /> },
];

// Sidebar component
const AdminSidebar = ({ section, setSection, onDashboardClick, isCompactNav }) => (
  <>
    {/* Compact nav bar (mobil/îngust) */}
    <nav className={(isCompactNav ? 'flex' : 'hidden') + ' flex-row items-center justify-between gap-1 px-2 py-2 bg-white rounded-2xl shadow sticky top-[90px] z-40 w-full mb-4'}>
      {navItems.map(item => (
        <button
          key={item.key}
          className={`flex flex-col items-center flex-1 px-1 py-1 rounded-lg text-xs ${section===item.key ? 'bg-purple-100 text-purple-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => {
            setSection(item.key);
            if (item.key === 'dashboard' && typeof onDashboardClick === 'function') onDashboardClick();
          }}
        >
          {item.icon}
          <span className="text-[11px] mt-0.5">{item.label}</span>
        </button>
      ))}
    </nav>
    {/* Sidebar lat (desktop) */}
    <nav className={(isCompactNav ? 'hidden' : 'flex') + ' flex-col gap-2 p-4 bg-white rounded-2xl shadow h-fit sticky top-[100px] min-w-[200px] z-30 w-[220px] max-w-none items-stretch'}>
      {navItems.map(item => (
        <button
          key={item.key}
          className={`text-left px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${section===item.key ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100'}`}
          onClick={() => {
            setSection(item.key);
            if (item.key === 'dashboard' && typeof onDashboardClick === 'function') onDashboardClick();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  </>
);

// Login component
const AdminLogin = ({ onConnect, isConnecting }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-bold mb-4">SIMIO Admin Login</h1>
    <button
      onClick={onConnect}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition flex items-center gap-2"
      disabled={isConnecting}
    >
      {isConnecting ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <ArrowLeftOnRectangleIcon className="h-5 w-5" />} Connect Phantom
    </button>
  </div>
);

const SimioAdmin = () => {
  const { walletAddress, connectWallet, disconnectWallet, isConnecting, errorMessage, setErrorMessage, phantom, useExtension } = usePhantomWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [transferLoading, setTransferLoading] = useState({});
  const [refundLoading, setRefundLoading] = useState({});
  const [isCompactNav, setIsCompactNav] = useState(false);
  const containerRef = React.useRef(null);
  const navigate = useNavigate();

  // Detectează lățimea containerului pentru nav compact
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setIsCompactNav(containerRef.current.offsetWidth < 1024);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mut fetchDashboard aici si il definesc cu useCallback
  const fetchDashboard = useCallback(() => {
    if (!walletAddress) return;
    
    setLoading(true);
    setErrorMessage('');
    fetch(`${API_BASE_URL}/admin/dashboard?walletAddress=${walletAddress}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        if (res.status === 401) {
          setIsAdmin(false);
          setErrorMessage('Unauthorized. This wallet is not an admin.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setIsAdmin(true);
        setDashboard(data);
        setLoading(false);
      })
      .catch(() => {
        setErrorMessage('Network error.');
        setLoading(false);
      });
  }, [walletAddress, API_BASE_URL]);

  // Adăugăm un efect pentru a încărca dashboard-ul când se conectează wallet-ul
  useEffect(() => {
    if (walletAddress) {
      fetchDashboard();
    }
  }, [walletAddress, fetchDashboard]);

  // Fetch affiliates
  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/affiliates?walletAddress=${walletAddress}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setAffiliates(data);
    } catch (e) {
      toast.error('Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rounds
  const fetchRounds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/rounds?walletAddress=${walletAddress}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setRounds(data);
    } catch (e) {
      toast.error('Failed to fetch rounds');
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const handleExport = async (type) => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/export/${type}?walletAddress=${walletAddress}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setExportData(data);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully!');
    } catch (e) {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  // Section switching
  useEffect(() => {
    if (!isAdmin) return;
    if (section === 'affiliates') fetchAffiliates();
    if (section === 'rounds') fetchRounds();
  }, [section, isAdmin]);

  const handleRefund = (address) => {
    setRefundLoading(l => ({ ...l, [address]: true }));
    fetch(`${API_BASE_URL}/admin/participants/${address}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    })
      .then(res => res.json())
      .then(data => {
        setRefundLoading(l => ({ ...l, [address]: false }));
        if (data.success) {
          toast.success('Participant refunded!');
          fetchRounds();
        } else {
          toast.error(data.error || 'Refund failed');
        }
      })
      .catch(() => {
        setRefundLoading(l => ({ ...l, [address]: false }));
        toast.error('Refund failed');
      });
  };

  // Render
  if (!walletAddress) {
    return <AdminLogin onConnect={connectWallet} isConnecting={isConnecting} />;
  }
  if (loading && !isAdmin && !errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Se verifică accesul...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      </div>
    );
  }
  if (!isAdmin && errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="mb-4 text-red-600">{errorMessage || 'You are not authorized to access this page.'}</p>
        <button onClick={disconnectWallet} className="bg-gray-200 px-4 py-2 rounded">Disconnect</button>
      </div>
    );
  }
  return (
    <div ref={containerRef} className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-2 pt-24">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 items-start justify-center">
        <AdminSidebar section={section} setSection={setSection} onDashboardClick={fetchDashboard} isCompactNav={isCompactNav} />
        <div className="flex-1 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 flex-shrink flex-grow-0 min-w-0">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all text-center max-w-[180px] sm:max-w-[260px] md:max-w-none overflow-x-auto">
                  {walletAddress}
                </span>
                <button
                  aria-label="Copy admin address"
                  title="Copy admin address"
                  className="px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-xs flex-shrink-0"
                  onClick={() => {navigator.clipboard.writeText(walletAddress); toast.success('Address copied!')}}
                >📋</button>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 w-auto min-w-[120px] md:w-auto"
                aria-label="Disconnect wallet"
                style={{marginLeft: 0}}
              >
                Disconnect
              </button>
            </div>
            <span className="text-lg font-bold text-purple-700 text-center md:text-left">SIMIO Admin Panel</span>
          </div>
          {/* Section content */}
          {section === 'dashboard' && (
            !dashboard || !dashboard.statistics ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
                {loading ? 'Loading dashboard...' : 'Dashboard unavailable or failed to load.'}
              </div>
            ) : (
              <>
                {/* Current Round Participants Section - primul card */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8">
                  <h2 className="text-lg font-bold mb-4">
                    Current Round Participants (Round #{dashboard.currentRound?.number ?? '-'})
                  </h2>
                  <CurrentRoundParticipantsList participants={dashboard.currentRound?.participants || []} walletAddress={walletAddress} API_BASE_URL={API_BASE_URL} onRefundSuccess={() => window.location.reload()} />
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <UsersIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold">{dashboard.statistics.totalAffiliates}</div>
                    <div className="text-gray-600">Total Affiliates</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <UsersIcon className="h-8 w-8 text-green-600 mb-2" />
                    <div className="text-2xl font-bold">{dashboard.statistics.totalParticipants}</div>
                    <div className="text-gray-600">Total Participants</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <TrophyIcon className="h-8 w-8 text-yellow-500 mb-2" />
                    <div className="text-2xl font-bold">{dashboard.statistics.totalRounds}</div>
                    <div className="text-gray-600">Total Rounds</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">{dashboard.statistics.totalTransferred.toLocaleString()}</div>
                    <div className="text-gray-600">Total Transferred</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-amber-600 mb-2" />
                    <div className="text-2xl font-bold">{dashboard.statistics.totalPending.toLocaleString()}</div>
                    <div className="text-gray-600">Total Pending</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-gray-600 mb-2" />
                    <div className="text-lg font-bold">Collector Wallet</div>
                    <div className="text-gray-700">SOL: {dashboard.walletBalances.collector.sol}</div>
                    <div className="text-gray-700">SIMIO: {dashboard.walletBalances.collector.simio}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-gray-600 mb-2" />
                    <div className="text-lg font-bold">Developer Wallet</div>
                    <div className="text-gray-700">SOL: {dashboard.walletBalances.developer.sol}</div>
                    <div className="text-gray-700">SIMIO: {dashboard.walletBalances.developer.simio}</div>
                  </div>
                </motion.div>
              </>
            )
          )}
          {section === 'affiliates' && (
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Affiliates</h2>
              {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {affiliates.map((aff, idx) => (
                    <div key={aff.affiliateId} className="rounded-xl border shadow p-4 flex flex-col gap-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs break-all text-gray-700">{aff.walletAddress}</span>
                        <span className="text-sm font-semibold">ID: {aff.affiliateId}</span>
                        <a href={aff.affiliateLink} className="text-blue-600 underline text-xs break-all" target="_blank" rel="noopener noreferrer">{aff.affiliateLink}</a>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mt-2">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Pending: <b>{aff.pendingRewards}</b></span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Transferred: <b>{aff.transferredRewards}</b></span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Referred: <b>{aff.referredParticipants?.length || 0}</b></span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Created: {aff.createdAt ? new Date(aff.createdAt).toLocaleString() : '-'}</div>
                      <div className="flex flex-wrap gap-2 mt-2 items-center justify-between">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs order-1" onClick={()=>{setShowModal(true);setModalContent({type:'history', aff})}}><EyeIcon className="h-4 w-4 inline" /></button>
                        {aff.pendingRewards > 0 && (
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs order-2" onClick={()=>{setShowModal(true);setModalContent({type:'transfer', aff})}}>Transfer</button>
                        )}
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-xs order-3" onClick={()=>{setShowModal(true);setModalContent({type:'delete', aff})}}><TrashIcon className="h-4 w-4 inline" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {section === 'rounds' && (
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <h2 className="text-xl font-bold">Rounds (last 50)</h2>
                <button
                  className="bg-yellow-600 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-yellow-700 transition"
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to refund ALL participants in the current round?')) return;
                    setLoading(true);
                    fetch(`${API_BASE_URL}/admin/current-round/refund`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ walletAddress })
                    })
                      .then(res => res.json())
                      .then(data => {
                        setLoading(false);
                        if (data.success) {
                          toast.success(`Refunded all participants in current round! (${data.participantsCount})`);
                          fetchRounds();
                        } else {
                          toast.error(data.error || 'Refund failed');
                        }
                      })
                      .catch(() => { setLoading(false); toast.error('Refund failed'); });
                  }}
                >Refund all current round</button>
              </div>
              {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rounds.map((r, idx) => (
                    <div key={r.round} className="rounded-xl border shadow p-4 flex flex-col gap-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">Round #{r.round}</span>
                        <span className="text-xs text-gray-700"><b>Winners:</b> <span className="font-mono break-all">{r.winners.map(w=>shortenAddr(typeof w === 'string' ? w : w?.address || '')).join(', ')}</span></span>
                        <span className="text-xs text-gray-700"><b>Participants:</b></span>
                        <div className="flex flex-col gap-1 mt-1">
                          {r.participants.map((p, i) => {
                            const addr = typeof p === 'string' ? p : p?.address || '';
                            return (
                              <div key={addr} className="flex items-center gap-2 font-mono text-xs break-all">
                                <span>{shortenAddr(addr)}</span>
                                <button
                                  className="bg-yellow-600 text-white px-3 py-1 rounded text-xs mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                                  disabled={refundLoading[addr]}
                                  onClick={() => {
                                    setShowModal(true);
                                    setModalContent({ type: 'refund-individual', address: addr });
                                  }}
                                >
                                  {refundLoading[addr] ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                      </svg>
                                      Processing...
                                    </>
                                  ) : 'Refund'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Date: {r.timestamp ? new Date(r.timestamp).toLocaleString() : '-'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 items-center justify-between">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs order-1" onClick={()=>{setShowModal(true);setModalContent({type:'details', r})}}><EyeIcon className="h-4 w-4 inline" /></button>
                        <button 
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-xs order-2 ml-auto flex items-center justify-center gap-2 disabled:opacity-60" 
                          onClick={()=>{setShowModal(true);setModalContent({type:'refund', r})}}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : 'Refund'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {section === 'export' && (
            <div className="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-4">Export Data</h2>
              <div className="flex flex-wrap gap-4 w-full justify-center">
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 min-w-[140px] mb-2" onClick={()=>handleExport('affiliates')} disabled={exporting} aria-label="Export affiliates" title="Export affiliates">{exporting ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <DocumentArrowDownIcon className="h-5 w-5" />}Export Affiliates</button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 min-w-[140px] mb-2" onClick={()=>handleExport('transactions')} disabled={exporting} aria-label="Export transactions" title="Export transactions">{exporting ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <DocumentArrowDownIcon className="h-5 w-5" />}Export Transactions</button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 min-w-[140px] mb-2" onClick={()=>handleExport('rounds')} disabled={exporting} aria-label="Export rounds" title="Export rounds">{exporting ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <DocumentArrowDownIcon className="h-5 w-5" />}Export Rounds</button>
              </div>
            </div>
          )}
          {/* Modal logic (transfer, delete, history, refund, details) - to be implemented modular for each action */}
          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 min-w-[90vw] md:min-w-[420px] max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={()=>setShowModal(false)}>&times;</button>
                {/* Modal content by type */}
                {modalContent?.type === 'transfer' && (
                  <div>
                    <h3 className="text-lg font-bold mb-2">Manual Transfer</h3>
                    <p className="mb-2 text-sm">Affiliate: <span className="font-mono break-all">{modalContent.aff.walletAddress}</span></p>
                    <input type="number" min={1} step={1} placeholder="Amount (SIMIO)" className="border p-2 rounded w-full mb-2" id="transferAmount" />
                    <button 
                      className="bg-green-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2 disabled:opacity-60" 
                      onClick={async()=>{
                        const amount = Number(document.getElementById('transferAmount').value);
                        if (!amount || amount <= 0) return toast.error('Enter a valid amount');
                        setTransferLoading(l => ({ ...l, [modalContent.aff.walletAddress]: true }));
                        fetch(`${API_BASE_URL}/admin/transfer`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ walletAddress, affiliateAddress: modalContent.aff.walletAddress, amount })
                        })
                          .then(res => res.json())
                          .then(data => {
                            setTransferLoading(l => ({ ...l, [modalContent.aff.walletAddress]: false }));
                            if (data.success) { 
                              toast.success('Transfer successful!'); 
                              setShowModal(false); 
                              fetchAffiliates(); 
                            }
                            else toast.error(data.error || 'Transfer failed');
                          })
                          .catch(()=>{ 
                            setTransferLoading(l => ({ ...l, [modalContent.aff.walletAddress]: false })); 
                            toast.error('Transfer failed'); 
                          });
                      }}
                      disabled={transferLoading[modalContent.aff.walletAddress]}
                    >
                      {transferLoading[modalContent.aff.walletAddress] ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Transfer'}
                    </button>
                  </div>
                )}
                {modalContent?.type === 'delete' && (
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-red-700">Delete Affiliate</h3>
                    <p className="mb-2 text-sm">Are you sure you want to delete affiliate <span className="font-mono break-all">{modalContent.aff.walletAddress}</span>?</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded w-full mb-2" onClick={async()=>{
                      setLoading(true);
                      fetch(`${API_BASE_URL}/admin/affiliates/${modalContent.aff.affiliateId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ walletAddress })
                      })
                        .then(res => res.json())
                        .then(data => {
                          setLoading(false);
                          if (data.success) { toast.success('Affiliate deleted!'); setShowModal(false); fetchAffiliates(); }
                          else toast.error(data.error || 'Delete failed');
                        })
                        .catch(()=>{ setLoading(false); toast.error('Delete failed'); });
                    }}>Delete</button>
                  </div>
                )}
                {modalContent?.type === 'history' && (
                  <div className="w-full max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Reward History</h3>
                    <div className="max-h-[60vh] overflow-y-auto rounded border">
                      <table className="w-full text-xs md:text-sm">
                        <thead><tr><th className="p-2">Round</th><th className="p-2">Participant</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Date</th></tr></thead>
                        <tbody>
                          {modalContent.aff.rewardHistory.map((entry, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">{entry.round}</td>
                              <td className="p-2 font-mono break-all">{entry.participant}</td>
                              <td className="p-2">{entry.amount}</td>
                              <td className="p-2">{entry.transferred ? 'Transferred' : 'Pending'}</td>
                              <td className="p-2">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {modalContent?.type === 'refund' && (
                  <div>
                    <h3 className="text-lg font-bold mb-2">Refund Round {modalContent.r.round}</h3>
                    <p className="mb-2 text-sm">Are you sure you want to refund all participants?</p>
                    <button 
                      className="bg-yellow-600 text-white px-4 py-2 rounded w-full mb-2 flex items-center justify-center gap-2 disabled:opacity-60" 
                      onClick={async()=>{
                        setLoading(true);
                        fetch(`${API_BASE_URL}/admin/rounds/${modalContent.r.round}/refund`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ walletAddress })
                        })
                          .then(res => res.json())
                          .then(data => {
                            setLoading(false);
                            if (data.success) { toast.success('Refund successful!'); setShowModal(false); fetchRounds(); }
                            else toast.error(data.error || 'Refund failed');
                          })
                          .catch(() => { setLoading(false); toast.error('Refund failed'); });
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Refund'}
                    </button>
                  </div>
                )}
                {modalContent?.type === 'details' && (
                  <div className="w-full max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Round Details</h3>
                    <div className="max-h-[60vh] overflow-y-auto rounded border p-2">
                      <div className="mb-2"><b>Winners:</b></div>
                      <div className="mb-2 font-mono text-xs break-all">
                        {modalContent.r.winners.map((w, i) => (
                          <div key={i}>{typeof w === 'string' ? w : w?.address || ''}</div>
                        ))}
                      </div>
                      <div className="mb-2"><b>Participants:</b></div>
                      <div className="mb-2 font-mono text-xs break-all">
                        {modalContent.r.participants.map((p, i) => (
                          <div key={i}>{typeof p === 'string' ? p : p?.address || ''}</div>
                        ))}
                      </div>
                      <div className="mb-2"><b>Date:</b> {modalContent.r.timestamp ? new Date(modalContent.r.timestamp).toLocaleString() : '-'}</div>
                    </div>
                  </div>
                )}
                {modalContent?.type === 'refund-individual' && (
                  <div>
                    <h3 className="text-lg font-bold mb-2">Refund Participant</h3>
                    <p className="mb-2 text-sm">Are you sure you want to refund participant <span className="font-mono break-all">{modalContent.address}</span>?</p>
                    <button
                      className="bg-yellow-600 text-white px-4 py-2 rounded w-full mb-2 flex items-center justify-center gap-2 disabled:opacity-60"
                      onClick={async () => {
                        handleRefund(modalContent.address);
                        setShowModal(false);
                      }}
                      disabled={refundLoading[modalContent.address]}
                    >
                      {refundLoading[modalContent.address] ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Refund'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function shortenAddr(addr) {
  if (!addr) return '';
  if (typeof addr === 'string' && addr.length > 12) return addr.slice(0, 4) + '...' + addr.slice(-4);
  return addr;
}

// Înlocuiesc vechiul CurrentRoundParticipants cu noua componentă:
function CurrentRoundParticipantsList({ participants, walletAddress, API_BASE_URL, onRefundSuccess }) {
  const [refundLoading, setRefundLoading] = React.useState({});

  const handleRefund = async (address) => {
    if (!window.confirm('Are you sure you want to refund this participant?')) return;
    setRefundLoading(l => ({ ...l, [address]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/participants/${address}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Participant refunded!');
        if (onRefundSuccess) onRefundSuccess();
      } else {
        toast.error(data.error || 'Refund failed');
      }
    } catch (e) {
      toast.error('Refund failed');
    } finally {
      setRefundLoading(l => ({ ...l, [address]: false }));
    }
  };

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  if (!participants || !participants.length) return <div className="text-gray-500">No participants in current round.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {participants.map((p) => (
        <div key={p.address} className="rounded-xl border shadow p-4 flex flex-col gap-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs break-all text-gray-700">{p.address}</span>
            <button
              aria-label="Copy address"
              title="Copy address"
              className="ml-1 px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              onClick={() => handleCopy(p.address)}
            >📋</button>
          </div>
          <span className="text-xs text-gray-500 break-all">Affiliate: {p.affiliate || '-'}</span>
          <button
            className="bg-yellow-600 text-white px-3 py-1 rounded text-xs mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            aria-label="Refund participant"
            title="Refund participant"
            disabled={refundLoading[p.address]}
            onClick={() => handleRefund(p.address)}
          >
            {refundLoading[p.address] ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing...
              </>
            ) : 'Refund'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default SimioAdmin; 