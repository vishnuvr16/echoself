"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, Plus, Trash2, Globe, User, Key, Server, Clipboard, Shield, AlertTriangle, LogOut, Settings, CheckCheck, QrCode, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

// --- Utility Functions (Simulating Backend Logic) ---

// Mock Encryption/Decryption (Simplified Base64 for demonstration)
const encrypt = (text) => btoa(text);
const decrypt = (cipher) => atob(cipher);

// Mock Database (Client-side persistence for the session)
const initialPasswords = [
  { id: '1', service: 'Google', username: 'user@gmail.com', encryptedPassword: encrypt('my-secret-google-pass'), category: 'Email', url: 'https://mail.google.com', notes: '' },
  { id: '2', service: 'GitHub', username: 'dev_user', encryptedPassword: encrypt('secure-git-token'), category: 'Development', url: 'https://github.com', notes: 'Requires token' },
  { id: '3', service: 'Amazon', username: 'shopper123', encryptedPassword: encrypt('shopping-spree-pass'), category: 'Shopping', url: 'https://amazon.com', notes: '' },
];

const useMockDatabase = () => {
  const [data, setData] = useState(initialPasswords);

  const find = (userId) => {
    // Simulate finding user's data and sorting by service name
    return data.sort((a, b) => a.service.localeCompare(b.service));
  };

  const save = (item) => {
    // Simulate POST
    const newItem = { ...item, id: Date.now().toString(), encryptedPassword: encrypt(item.password) };
    setData(prev => [newItem, ...prev]);
    return newItem;
  };

  const remove = (id) => {
    // Simulate DELETE
    setData(prev => prev.filter(item => item.id !== id));
  };

  return { find, save, remove };
};

// Mock Authentication Context - Reflects user's API states
const useMockAuth = () => {
  const [user, setUser] = useState(() => ({
    id: 'user-123',
    isLoggedIn: true,
    twoFactorEnabled: false, // Start disabled
    twoFactorSecret: null, // Stores the mock secret after setup
  }));

  const setTwoFactorSecret = (secret) => {
    setUser(prev => ({ ...prev, twoFactorSecret: secret }));
  };

  const enable2FA = () => {
    setUser(prev => ({ ...prev, twoFactorEnabled: true }));
    // Note: The UI now calls toast.success from the modal when this is triggered
  };

  const disable2FA = () => {
     setUser(prev => ({ ...prev, twoFactorEnabled: false, twoFactorSecret: null }));
     toast.warning('2FA disabled and secret reset.');
  }

  const logout = () => {
    setUser({ id: null, isLoggedIn: false, twoFactorEnabled: false, twoFactorSecret: null });
    toast.warning("Logged out. Vault is inaccessible.");
  };

  return { user, setTwoFactorSecret, enable2FA, disable2FA, logout };
};

// --- UI Components (Shadcn/Tailwind Mocks) ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-lg p-6 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '', type = 'button' }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200';
  let colorStyle = '';
  let paddingStyle = '';

  switch (variant) {
    case 'outline':
      colorStyle = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
      break;
    case 'destructive':
      colorStyle = 'bg-red-600 text-white hover:bg-red-700';
      break;
    default: // default/primary
      colorStyle = 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
  }

  switch (size) {
    case 'icon':
      paddingStyle = 'h-10 w-10 p-0';
      break;
    case 'sm':
      paddingStyle = 'h-8 px-3 text-sm';
      break;
    default:
      paddingStyle = 'h-10 px-4 py-2';
  }

  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${colorStyle} ${paddingStyle} ${disabledStyle} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = (props) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${props.className || ''}`}
  />
);

const Select = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>') right 0.75rem center] bg-no-repeat bg-contain pr-10 ${className}`}
  >
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Label = ({ children }) => <label className="text-sm font-medium text-gray-700 block mb-1">{children}</label>;


// --- 2FA Configuration Modal Component ---

const TwoFAConfigurationModal = ({ isOpen, onClose, user, setTwoFactorSecret, enable2FA, disable2FA }) => {
  const [step, setStep] = useState(0); // 0: Setup, 1: Verify
  const [mockSecret, setMockSecret] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  
  // NOTE: In a real app, this would be computed by the backend (user's provided API)
  const MOCK_QR_CODE = 'https://placehold.co/200x200/2563EB/ffffff?text=MOCK+QR+CODE';
  const MOCK_TOKEN = '123456'; // The token the user must enter to verify

  useEffect(() => {
      // Reset state when modal opens
      if (isOpen) {
          if (user.twoFactorEnabled) {
              setStep(2); // Skip setup if already enabled
          } else if (user.twoFactorSecret) {
              setStep(1); // Skip setup if secret already generated
          } else {
              setStep(0); // Start setup
          }
      }
      setTokenInput('');
  }, [isOpen, user.twoFactorEnabled, user.twoFactorSecret]);

  const handleSetup = () => {
    // Simulates calling the user's POST /setup API
    // Generate a mock secret and save it to the user state
    const newSecret = Math.random().toString(36).substring(2, 12).toUpperCase();
    setTwoFactorSecret(newSecret);
    setMockSecret(newSecret);
    setStep(1); // Move to verification
    toast.info("2FA Secret generated. Time to verify!");
  };

  const handleVerify = () => {
    // Simulates calling the user's POST /verify API
    if (tokenInput.trim() === MOCK_TOKEN) {
      enable2FA();
      toast.success('2FA Verification successful. Vault access granted!', { duration: 3000 });
      onClose();
    } else {
      toast.error('Invalid token. Please try again or use the correct mock token (123456).');
    }
  };

  const copyToClipboard = (text) => {
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success('Secret copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user.twoFactorEnabled ? "2FA Status" : "Configure 2FA"}>
      <div className="space-y-6">
        {user.twoFactorEnabled ? (
            // Step 2: Already Enabled
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-700">2FA is Active</h3>
                <p className="text-gray-600">Your account is protected. You can disable 2FA below if needed.</p>
                <Button 
                    variant="destructive" 
                    onClick={() => { disable2FA(); onClose(); }} 
                    className="mt-4 w-full"
                >
                    <Lock className="w-4 h-4 mr-2" /> Disable 2FA
                </Button>
            </motion.div>
        ) : (
            <>
                {/* Step 0: Initial Setup Button */}
                {step === 0 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                         <p className="text-gray-600">
                             Two-Factor Authentication adds an extra layer of security. Click below to begin the setup process and generate your secret key (simulating a call to your `POST /setup` API).
                         </p>
                         <Button onClick={handleSetup} className="w-full">
                             <Settings className="w-4 h-4 mr-2" /> Generate Secret Key
                         </Button>
                     </motion.div>
                )}
                
                {/* Step 1: Display Secret and QR Code */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <p className="text-sm text-gray-700">
                            **Step 1:** Scan the QR code below or manually enter the secret into your authenticator app (e.g., Google Authenticator, Authy).
                        </p>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-gray-50 border rounded-lg">
                            <img src={MOCK_QR_CODE} alt="Mock QR Code" className="w-32 h-32 rounded-lg border-2 border-gray-300" />
                            <div className="text-center md:text-left space-y-2">
                                <p className="text-gray-500 font-semibold flex items-center justify-center md:justify-start">
                                    <QrCode className='w-4 h-4 mr-1'/> Secret Key
                                </p>
                                <div className="flex items-center space-x-2">
                                    <code className="bg-white p-2 text-lg font-mono rounded border text-blue-600 break-all">
                                        {mockSecret || user.twoFactorSecret}
                                    </code>
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        title="Copy Secret"
                                        onClick={() => copyToClipboard(mockSecret || user.twoFactorSecret)}
                                    >
                                        <ClipboardCopy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700">
                            **Step 2:** Enter the token generated by your app below to verify and enable 2FA (use mock token **123456**).
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="flex space-x-2">
                            <Input
                                type="text"
                                placeholder="Enter 6-digit token (123456)"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                maxLength={6}
                                required
                                className="flex-grow"
                            />
                            <Button type="submit">
                                <CheckCheck className="w-4 h-4 mr-2" /> Verify
                            </Button>
                        </form>
                    </motion.div>
                )}
            </>
        )}
      </div>
    </Modal>
  );
};


// --- Main Application Component ---

const PasswordVault = () => {
  const { user, setTwoFactorSecret, enable2FA, disable2FA, logout } = useMockAuth();
  const db = useMockDatabase();

  const [passwords, setPasswords] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [formData, setFormData] = useState({ service: '', username: '', password: '', category: 'Personal', url: '', notes: '' });

  // Access is blocked if not logged in OR 2FA is not enabled (matches user's API logic)
  const isAccessBlocked = useMemo(() => !user.isLoggedIn || !user.twoFactorEnabled, [user]);

  const categories = ['Personal', 'Work', 'Email', 'Finance', 'Social', 'Development', 'Shopping', 'Other'];

  const fetchPasswords = useCallback(() => {
    if (isAccessBlocked) {
      setPasswords([]);
      return;
    }
    const fetchedData = db.find(user.id).map(pwd => ({
      ...pwd,
      password: showReveal ? decrypt(pwd.encryptedPassword) : '••••••••',
    }));
    setPasswords(fetchedData);
  }, [user.id, user.twoFactorEnabled, user.isLoggedIn, showReveal, db]);

  useEffect(() => {
    // Only fetch if 2FA is enabled and user is logged in
    fetchPasswords();
  }, [fetchPasswords]);

  const handleToggleReveal = () => {
    if (isAccessBlocked) return;
    setShowReveal(prev => !prev);
    toast(`Password visibility is now ${showReveal ? 'HIDDEN' : 'REVEALED'}.`, { duration: 1500 });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (isAccessBlocked) return;

    if (!formData.service || !formData.password) {
      toast.error('Service and Password are required.');
      return;
    }

    db.save(formData);
    toast.success('Password saved successfully!');
    setFormData({ service: '', username: '', password: '', category: 'Personal', url: '', notes: '' });
    setShowAddModal(false);
    fetchPasswords();
  };

  const handleDelete = (id) => {
    if (isAccessBlocked) return;

    db.remove(id);
    toast.warning('Password entry deleted.');
    fetchPasswords();
  };

  const copyToClipboard = (text, type) => {
    try {
      // Use execCommand for broader compatibility in various environments
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy. Try selecting manually.');
    }
  };

  if (!user.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-10">
          <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Vault Access Denied</h1>
          <p className="text-gray-500 mb-6">Please log in to access your secure password vault.</p>
          <Button onClick={() => toast.info('Simulated Login Action')} className="w-full">
            Simulate Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* --- Header & Controls --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Secure Vault
            </h1>
            <p className="text-gray-500 mt-1">Manage your {user.twoFactorEnabled ? passwords.length : '—'} encrypted credentials.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => setShow2FAModal(true)} className="flex-shrink-0">
              {user.twoFactorEnabled ? <Unlock className="w-4 h-4 mr-2 text-green-500" /> : <Lock className="w-4 h-4 mr-2 text-red-500" />}
              2FA: {user.twoFactorEnabled ? 'Enabled' : 'Configure 2FA'}
            </Button>
            <Button onClick={logout} variant="outline" className="flex-shrink-0">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="flex-shrink-0" disabled={isAccessBlocked}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        {/* --- 2FA Warning/Blocker --- */}
        {!user.twoFactorEnabled && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-700">Access Restricted (2FA Required)</h3>
                <p className="text-sm text-red-600">
                  {/* As required by your API, the vault is inaccessible when 2FA is disabled. Please click "Configure 2FA" to enable access. */}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* --- Main Password List --- */}
        <Card className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">Vault Contents</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleReveal}
              disabled={isAccessBlocked || passwords.length === 0}
            >
              {showReveal ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showReveal ? 'Hide Passwords' : 'Reveal Passwords'}
            </Button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {passwords.length === 0 && !isAccessBlocked ? (
              <div className="p-8 text-center text-gray-500">
                <Server className="w-10 h-10 mx-auto mb-3" />
                <p>No passwords found. Click "Add New" to begin.</p>
              </div>
            ) : (
              passwords.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 hover:bg-gray-50 transition duration-150"
                >
                  {/* Service & Details */}
                  <div className="flex-1 min-w-0 pr-4 mb-3 md:mb-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.service}</h3>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="w-3 h-3 mr-1" />
                      {item.username || 'N/A'}
                      <span className="mx-2 text-gray-300">|</span>
                      <Globe className="w-3 h-3 mr-1" />
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{item.url || 'No URL'}</a>
                    </p>
                  </div>

                  {/* Password & Actions */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="font-mono text-base bg-gray-100 p-2 rounded-lg border border-gray-200">
                      {item.password}
                    </div>
                    
                    <Button 
                      size="icon" 
                      variant="outline" 
                      title="Copy Username"
                      onClick={() => copyToClipboard(item.username, 'Username')}
                    >
                      <User className="w-4 h-4" />
                    </Button>

                    <Button 
                      size="icon" 
                      variant="outline" 
                      title="Copy Password"
                      onClick={() => copyToClipboard(showReveal ? decrypt(item.encryptedPassword) : item.password, 'Password')}
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>

                    <Button 
                      size="icon" 
                      variant="destructive" 
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* --- 2FA Configuration Modal --- */}
      <TwoFAConfigurationModal 
        isOpen={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        user={user}
        setTwoFactorSecret={setTwoFactorSecret}
        enable2FA={enable2FA}
        disable2FA={disable2FA}
      />


      {/* --- Add New Modal --- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Password Entry">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Service Name *</Label>
              <Input
                placeholder="e.g., Netflix, Bank of America"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Username/Email</Label>
              <Input
                placeholder="Your username or email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label>URL (Optional)</Label>
            <Input
              placeholder="https://"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Notes (Optional)</Label>
            <textarea
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[100px]"
              placeholder="Any specific instructions or security questions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">
              <Key className="w-4 h-4 mr-2" />
              Save Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PasswordVault;