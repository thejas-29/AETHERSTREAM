import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Shield, 
  Activity, 
  LogOut, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight, 
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  TrendingDown,
  Info
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  const handleLogin = (jwtToken, userDetails) => {
    setToken(jwtToken);
    setUser(userDetails);
    localStorage.setItem('user', JSON.stringify(userDetails));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all selection:bg-indigo-500 selection:text-white">
      {!token ? (
        <AuthScreen onAuthSuccess={handleLogin} />
      ) : (
        <Dashboard token={token} currentUser={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

// --- Dynamic Authenticated Login & Registration Module ---
function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer'); // Viewer, Manager, Admin
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin ? { username, password } : { username, password, role };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        onAuthSuccess(data.token, data.user);
      } else {
        setIsLogin(true);
        setSuccess('Operator account registered. Establish session now.');
        setUsername('');
        setPassword('');
        setRole('Viewer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-400/30 shadow-lg shadow-indigo-500/20 rotate-3 hover:rotate-6 transition-transform duration-300">
            <Activity className="text-white w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">Antigravity BI</h1>
          <p className="text-indigo-400/80 mt-2 text-sm font-semibold uppercase tracking-wider">Enterprise Analytical Portal</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl mb-6 text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl mb-6 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-sm font-medium"
              placeholder="operator_name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Administrative Role</label>
              <div className="grid grid-cols-3 gap-2.5">
                {['Viewer', 'Manager', 'Admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold tracking-wide transition-all ${
                      role === r 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm' 
                        : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-950/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5 leading-relaxed">
                * Roles govern CRUD access: <strong className="text-slate-400">Viewers</strong> hold read-only bounds; <strong className="text-slate-400">Managers</strong> can seed & add; <strong className="text-slate-400">Admins</strong> hold full deletion authority.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-6 text-sm tracking-wider uppercase"
          >
            {loading ? 'Processing Operations...' : (isLogin ? 'Establish Session' : 'Register Operator')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/60 pt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
          >
            {isLogin ? "Create Operator Account" : "Sign In to Existing Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Interactive Metrics & Forecasting Dashboard ---
function Dashboard({ token, currentUser, onLogout }) {
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Advanced stats toggle drawer
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  // Transaction Table State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addCategory, setAddCategory] = useState('Software');
  const [addDate, setAddDate] = useState(new Date().toISOString().substring(0, 16));
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Custom interactive hover states
  const [activePoint, setActivePoint] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [metricsRes, forecastRes] = await Promise.all([
        fetch('http://localhost:5000/api/metrics', { headers }),
        fetch('http://localhost:5000/api/forecast', { headers })
      ]);

      if (!metricsRes.ok) {
        if (metricsRes.status === 401) onLogout();
        throw new Error('Could not fetch transactional metrics.');
      }
      if (!forecastRes.ok) throw new Error('Could not fetch regression forecast analytics.');

      const metricsData = await metricsRes.json();
      const forecastData = await forecastRes.json();

      setMetrics(metricsData);
      setForecast(forecastData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Seeding Pipeline Trigger
  const handleSeed = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/system/seed', {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Seeding failed');
      setSuccess(data.message);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Transaction Action (RBAC: Admin & Manager)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmittingTx(true);

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(addAmount),
          category: addCategory,
          date: new Date(addDate).toISOString()
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Creation rejected');
      }

      setSuccess('Transaction logged successfully.');
      setIsAddModalOpen(false);
      setAddAmount('');
      setAddCategory('Software');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  // Delete Transaction Action (RBAC: Admin strict)
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm(`Confirm permanent deletion of transaction record #${id}?`)) return;
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Deletion rejected');
      }

      setSuccess(`Transaction record #${id} purged successfully.`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Clear toast notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Compute local client filters on transaction history lists
  const filteredTransactions = useMemo(() => {
    if (!metrics?.recent_transactions) return [];
    return metrics.recent_transactions.filter(tx => {
      const matchesSearch = tx.owner.toLowerCase().includes(search.toLowerCase()) || 
                            tx.id.toString().includes(search) || 
                            tx.category.toLowerCase().includes(search.toLowerCase()) ||
                            tx.amount.toString().includes(search);
      const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [metrics?.recent_transactions, search, categoryFilter]);

  // Client-side math: Advanced Statistical analysis from active datasets
  const advancedStats = useMemo(() => {
    if (!metrics?.recent_transactions || metrics.recent_transactions.length === 0) {
      return { min: 0, max: 0, stdev: 0, range: 0 };
    }
    const amounts = metrics.recent_transactions.map(tx => tx.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const mean = amounts.reduce((acc, v) => acc + v, 0) / amounts.length;
    const variance = amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / amounts.length;
    const stdev = Math.sqrt(variance);
    return {
      min: round(min, 2),
      max: round(max, 2),
      stdev: round(stdev, 2),
      range: round(max - min, 2)
    };
  }, [metrics?.recent_transactions]);

  function round(val, dec) {
    return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  // Pagination bounds calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  // Render interactive SVG Donut Chart slices 
  const categoryDonutSvg = useMemo(() => {
    const shares = metrics?.category_shares || [];
    if (shares.length === 0) return null;

    const size = 160;
    const thickness = 14;
    const radius = 50;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius; // ~314.159

    let accumulatedPercentage = 0;

    const categoryColors = {
      Software: '#6366f1',  // indigo-500
      Hardware: '#f59e0b',  // amber-500
      Consulting: '#10b981', // emerald-500
      Support: '#f43f5e'    // rose-500
    };

    return (
      <div className="relative w-40 h-40 mx-auto select-none">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90 overflow-visible">
          {/* Base Background Track Ring */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke="#1e293b" 
            strokeWidth={thickness}
            className="opacity-50"
          />

          {/* Segment Slices */}
          {shares.map((cat) => {
            const pct = cat.percentage;
            const strokeLength = (pct / 100) * circumference;
            const strokeOffset = - (accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += pct;

            const isHovered = hoveredCategory?.category === cat.category;
            const strokeColor = categoryColors[cat.category] || '#94a3b8';

            return (
              <circle
                key={cat.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={strokeColor}
                strokeWidth={isHovered ? thickness + 4 : thickness}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                className="cursor-pointer transition-all duration-300 hover:opacity-100"
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Central Display overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full">
            {hoveredCategory ? hoveredCategory.category : 'Total Volume'}
          </span>
          <span className="text-base font-black text-white tracking-tight mt-0.5 truncate max-w-full">
            ${hoveredCategory 
              ? hoveredCategory.total_amount.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
              : metrics?.gross_inflow?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
          </span>
        </div>
      </div>
    );
  }, [metrics?.category_shares, hoveredCategory, metrics?.gross_inflow]);

  // Render a responsive premium custom SVG Line/Area Chart for dynamic visualizations
  const chartSvgContent = useMemo(() => {
    const timeline = metrics?.chronological_timeline || [];
    if (timeline.length < 2) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-slate-500 text-sm font-medium">
          <TrendingUp className="w-12 h-12 text-slate-800 mb-3 animate-pulse" />
          <span>Insufficient chronological datasets. Feed database using the data seed engine.</span>
        </div>
      );
    }

    const width = 800;
    const height = 240;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Boundary valuations
    const amounts = timeline.map(t => t.amount);
    const maxVal = Math.max(...amounts) * 1.1; // 10% breathing space
    const minVal = 0; // standard floor value

    const xPoints = timeline.map((_, i) => paddingLeft + (i * chartWidth) / (timeline.length - 1));
    const yPoints = timeline.map(t => height - paddingBottom - ((t.amount - minVal) * chartHeight) / (maxVal - minVal));

    // Compile line coordinates path string
    let dPath = `M ${xPoints[0]} ${yPoints[0]}`;
    for (let i = 1; i < timeline.length; i++) {
      dPath += ` L ${xPoints[i]} ${yPoints[i]}`;
    }

    // Compile closed area coordinates path string for gradient fills
    const dAreaPath = `${dPath} L ${xPoints[xPoints.length - 1]} ${height - paddingBottom} L ${xPoints[0]} ${height - paddingBottom} Z`;

    // Map Y grid indicators (4 steps)
    const yGridValues = [0, 0.33, 0.66, 1].map(pct => minVal + pct * (maxVal - minVal));

    return (
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yGridValues.map((val, idx) => {
            const y = height - paddingBottom - ((val - minVal) * chartHeight) / (maxVal - minVal);
            return (
              <g key={idx} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#334155" 
                  strokeDasharray="4,4" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  fill="#94a3b8" 
                  fontSize="10" 
                  textAnchor="end"
                  className="font-mono font-medium"
                >
                  ${Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={dAreaPath} fill="url(#chartGradient)" />

          {/* Solid line path */}
          <path d={dPath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

          {/* Interaction dots & markers */}
          {timeline.map((pt, i) => {
            const isHovered = activePoint?.index === i;
            return (
              <g key={i}>
                <circle 
                  cx={xPoints[i]} 
                  cy={yPoints[i]} 
                  r={isHovered ? 7 : 4} 
                  fill={isHovered ? '#818cf8' : '#6366f1'} 
                  stroke="#0f172a" 
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setActivePoint({ index: i, x: xPoints[i], y: yPoints[i], data: pt })}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            );
          })}

          {/* X Axis dates (render first, mid, last points to avoid overlaps) */}
          {timeline.length > 0 && (
            <g className="font-mono font-semibold" fontSize="9" fill="#94a3b8">
              <text x={xPoints[0]} y={height - paddingBottom + 20} textAnchor="middle">
                {timeline[0].date}
              </text>
              {timeline.length > 2 && (
                <text x={xPoints[Math.floor(timeline.length / 2)]} y={height - paddingBottom + 20} textAnchor="middle">
                  {timeline[Math.floor(timeline.length / 2)].date}
                </text>
              )}
              <text x={xPoints[timeline.length - 1]} y={height - paddingBottom + 20} textAnchor="middle">
                {timeline[timeline.length - 1].date}
              </text>
            </g>
          )}
        </svg>

        {/* Dynamic Tooltip UI portal */}
        {activePoint && (
          <div 
            className="absolute z-10 bg-slate-950/95 border border-indigo-500/40 p-3 rounded-xl shadow-xl backdrop-blur-md pointer-events-none transition-all duration-100 ease-out font-sans text-xs"
            style={{ 
              left: `${(activePoint.x / width) * 100}%`, 
              top: `${(activePoint.y / height) * 100 - 30}%`, 
              transform: 'translate(-50%, -100%)' 
            }}
          >
            <div className="font-semibold text-indigo-300">{activePoint.data.date}</div>
            <div className="font-bold text-white mt-1 text-sm">${activePoint.data.amount.toLocaleString()}</div>
          </div>
        )}
      </div>
    );
  }, [metrics?.chronological_timeline, activePoint]);

  // Set colors for distinct operator role badges
  const roleBadgeStyle = (r) => {
    switch(r) {
      case 'Admin': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Manager': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative">
      {/* Toast Alert Popups */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xl flex items-center gap-2 animate-slideIn">
          <Activity className="w-5 h-5" />
          <span className="font-medium text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-2xl flex items-center gap-2 animate-slideIn">
          <AlertCircle className="w-5 h-5 animate-bounce" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-600/20 rotate-3">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight">Antigravity</span>
              <span className="text-[10px] text-indigo-400 font-bold block leading-none">BUSINESS INTELLIGENCE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-950/40 py-1.5 pl-3 pr-4 rounded-2xl border border-slate-800">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">{currentUser?.username}</span>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-lg ${roleBadgeStyle(currentUser?.role)}`}>
                {currentUser?.role || 'Viewer'}
              </span>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider transition-colors px-3.5 py-2.5 rounded-xl hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Dashboard Content Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro controls section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Operational Dashboards</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Decoupled statelessly-secured enterprise analytical control panel.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Seeding functionality governed visually by RBAC warnings */}
            {currentUser?.role === 'Viewer' ? (
              <button 
                disabled
                title="Viewer accounts do not possess administrative seed authorizations."
                className="flex items-center gap-2 text-slate-500 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-not-allowed opacity-50"
              >
                <Lock className="w-4 h-4 text-slate-600" />
                Seed Demo Data
              </button>
            ) : (
              <button 
                onClick={handleSeed}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Seed Demo Data
              </button>
            )}

            <button
              onClick={() => {
                if (currentUser?.role === 'Viewer') {
                  setError('RBAC Block: Viewer sessions are locked out from logging transaction records.');
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Log Transaction
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent shadow-lg"></div>
            <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">Running Analytical Pipelines...</span>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Core KPI metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Gross Inflow Volume" 
                value={`$${metrics?.gross_inflow?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`} 
                icon={DollarSign}
                color="indigo"
                description="Aggregated ledger invoices"
              />
              <MetricCard 
                title="Consolidated Invoices" 
                value={metrics?.invoice_logs?.toLocaleString() || '0'} 
                icon={Receipt}
                color="blue"
                description="Total operational commits"
              />
              <MetricCard 
                title="Ticket Mean Weight" 
                value={`$${metrics?.ticket_mean?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`} 
                icon={TrendingUp}
                color="emerald"
                description="Average financial trade volume"
              />
              <MetricCard 
                title="Unique Accounts" 
                value={metrics?.unique_accounts?.toLocaleString() || '0'} 
                icon={Users}
                color="purple"
                description="Active transactees"
              />
            </div>

            {/* Predictive ML Forecasting Banner Card (Glow Animated border) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group animate-glow">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit">
                  <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">OLS LINEAR REGRESSION PIPELINE</span>
                </div>
                <h2 className="text-2xl font-black text-white">30-Day Predictive Sales Forecast</h2>
                <p className="text-slate-300 text-sm max-w-xl">
                  Scikit-Learn estimator analyzing daily transaction values aggregates to forecast upcoming month revenues.
                </p>
                
                <button
                  onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-all pt-2 outline-none"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showAdvancedStats ? 'Collapse Statistical Parameters' : 'View Advanced Statistical Insights'}
                </button>
              </div>

              <div className="flex items-end gap-6 relative z-10 shrink-0 self-stretch md:self-auto border-t md:border-t-0 border-slate-800/80 pt-6 md:pt-0">
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">Forecast Revenue</div>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                    ${forecast?.forecast_next_month?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    <span className="text-xs text-indigo-400 font-medium">/ 30d</span>
                  </div>
                </div>

                <div className="text-left border-l border-slate-800 pl-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">R² Determination</div>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                    {forecast?.model_score !== undefined ? `${(forecast.model_score * 100).toFixed(2)}%` : '0.00%'}
                    <span className="text-xs text-slate-500 font-medium">fit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Stats Drawer */}
            {showAdvancedStats && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-lg animate-fadeIn grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standard Deviation</span>
                  <div className="text-xl font-black text-slate-200">${advancedStats.stdev.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500">Volume variance metric</p>
                </div>
                <div className="space-y-1 border-l border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Peak Trade Value</span>
                  <div className="text-xl font-black text-emerald-400">${advancedStats.max.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500">Highest recorded invoice</p>
                </div>
                <div className="space-y-1 border-l border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Floor Trade Value</span>
                  <div className="text-xl font-black text-rose-400">${advancedStats.min.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500">Lowest recorded invoice</p>
                </div>
                <div className="space-y-1 border-l border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Range</span>
                  <div className="text-xl font-black text-slate-200">${advancedStats.range.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500">Max to min spread</p>
                </div>
              </div>
            )}

            {/* Core Visualization & Distribution Breakdown grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Chronological Daily Sales Trend Area Chart */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight">Chronological Sales Trend</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Aggregated daily transactional volumes over time.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-950/30 border border-indigo-900 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Dynamic Plotting</span>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  {chartSvgContent}
                </div>
              </div>

              {/* Category Shares Distribution Breakdown widget with Donut Chart */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Category Shares Distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Segmented allocation percentage shares.</p>
                </div>

                {/* SVG Donut interactive visual */}
                {metrics?.category_shares && metrics.category_shares.length > 0 && (
                  <div className="py-4 border-b border-slate-800/60 mb-5">
                    {categoryDonutSvg}
                  </div>
                )}

                <div className="flex-1 space-y-4 justify-center flex flex-col">
                  {metrics?.category_shares && metrics.category_shares.length > 0 ? (
                    metrics.category_shares.map(cat => {
                      const colors = {
                        Software: { bg: 'bg-indigo-600', text: 'text-indigo-400', lightBg: 'bg-indigo-950/20', border: 'border-indigo-500/20' },
                        Hardware: { bg: 'bg-amber-500', text: 'text-amber-400', lightBg: 'bg-amber-950/20', border: 'border-amber-500/20' },
                        Consulting: { bg: 'bg-emerald-500', text: 'text-emerald-400', lightBg: 'bg-emerald-950/20', border: 'border-emerald-500/20' },
                        Support: { bg: 'bg-rose-500', text: 'text-rose-400', lightBg: 'bg-rose-950/20', border: 'border-rose-500/20' }
                      }[cat.category] || { bg: 'bg-slate-500', text: 'text-slate-400', lightBg: 'bg-slate-800/20', border: 'border-slate-800' };

                      const isHovered = hoveredCategory?.category === cat.category;

                      return (
                        <div 
                          key={cat.category} 
                          className={`space-y-1.5 transition-all p-2 rounded-xl border ${isHovered ? 'bg-slate-800/30 border-slate-700/60' : 'border-transparent'}`}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-lg ${colors.lightBg} ${colors.text} ${colors.border}`}>
                              {cat.category}
                            </span>
                            <span className="text-white font-black">${cat.total_amount.toLocaleString()} ({cat.percentage}%)</span>
                          </div>
                          
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                            <div 
                              className={`h-full ${colors.bg} rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-slate-500 text-sm py-12">
                      No category allocations logged. Seed mock transactional databases to construct charts.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operational History Log Table */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Chronological Historical Volume Log</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-slate-400">Purge transactional records under strict RBAC compliance.</p>
                    
                    {/* Clear active filter badge */}
                    {(search || categoryFilter !== 'All') && (
                      <button 
                        onClick={() => { setSearch(''); setCategoryFilter('All'); }}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900 px-2.5 py-0.5 rounded-full active:scale-95 transition-all"
                      >
                        Active Filters <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search history log..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-700 w-44"
                    />
                  </div>

                  {/* Dropdown filter */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer border-none p-0 pr-6"
                    >
                      <option value="All">All Categories</option>
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/30 border-b border-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Execution Date</th>
                      <th className="px-6 py-4">Responsible Operator</th>
                      <th className="px-6 py-4">Allocation Category</th>
                      <th className="px-6 py-4 text-right">Commit Amount</th>
                      <th className="px-6 py-4 text-center">purge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map(tx => {
                        const isPurgeLocked = currentUser?.role !== 'Admin';
                        
                        return (
                          <tr key={tx.id} className="hover:bg-slate-800/10 transition-colors group">
                            <td className="px-6 py-4 text-indigo-400 font-mono text-xs font-semibold">#{tx.id}</td>
                            <td className="px-6 py-4 text-slate-300 font-semibold text-xs">
                              {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-slate-400 font-medium text-xs flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                              {tx.owner}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white font-black text-right tracking-tight text-xs">
                              ${tx.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isPurgeLocked ? (
                                <button 
                                  disabled
                                  title="RBAC: Purging transaction logs strictly requires Admin clearance."
                                  className="text-slate-700 cursor-not-allowed opacity-30 hover:scale-95 transition-transform"
                                >
                                  <Lock className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleDeleteTransaction(tx.id)}
                                  title="Purge transaction record"
                                  className="text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center text-slate-500 font-bold text-xs">
                          No transactions match active filter queries. Seed mock transactions to generate graphs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-slate-950/20 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-bold text-slate-200">
                      {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                    </span> of <span className="font-bold text-slate-200">{filteredTransactions.length}</span> commits
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-400 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-300 px-2">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-400 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Modal Dialog: Add Transaction */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsAddModalOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          ></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col justify-between p-8 animate-slideLeft z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Log Operational Transaction</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Commit fresh invoice ledger records into database.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Commit Amount ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="250.00"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Allocation Sector</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Software', 'Hardware', 'Consulting', 'Support'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAddCategory(cat)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold tracking-wide transition-all ${
                          addCategory === cat 
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm' 
                            : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-950/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Execution Date & Time</label>
                  <input 
                    type="datetime-local"
                    required
                    value={addDate}
                    onChange={e => setAddDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingTx}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-6 text-sm tracking-wider uppercase"
                >
                  {isSubmittingTx ? 'Registering Commit...' : 'Register Operational Commit'}
                </button>
              </form>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-4 flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                By executing this ledger transaction, it will instantly train the predictive regression algorithms and compute dynamic, updated historical values.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component Helper: Operational KPI Cards ---
function MetricCard({ title, value, icon: Icon, color, description }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-950/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-950/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-950/30'
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-800 transition-all flex flex-col justify-between group">
      <div className="flex items-center gap-3.5 mb-6">
        <div className={`p-3 rounded-2xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider leading-none">{title}</h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">{description}</span>
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight leading-none">{value}</div>
    </div>
  );
}
