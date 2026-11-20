import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Default sample role configurations for fallback
const DEMO_USERS = [
  {
    id: 'usr-cit-01',
    email: 'citizen@cleantn360.org',
    full_name: 'Citizen Member',
    role: 'citizen',
    phone: '+91 98400 00001',
    district: 'Coimbatore',
    city: 'Central',
    address: 'Tamil Nadu',
    account_status: 'active'
  },
  {
    id: 'usr-col-01',
    email: 'collector@cleantn360.org',
    full_name: 'Sanitation Collector',
    role: 'collector',
    phone: '+91 98400 00002',
    district: 'Coimbatore',
    city: 'Central',
    address: 'Sanitation Ward Office',
    assigned_point_code: 'CTN-CBE-001',
    account_status: 'active'
  },
  {
    id: 'usr-adm-01',
    email: 'admin@cleantn360.org',
    full_name: 'District Administrator',
    role: 'admin',
    phone: '+91 98400 00003',
    district: 'Coimbatore',
    city: 'Collectorate Complex',
    address: 'District Collectorate Office',
    account_status: 'active'
  },
  {
    id: 'usr-sta-01',
    email: 'stateadmin@cleantn360.org',
    full_name: 'State Administrator',
    role: 'state_admin',
    phone: '+91 98400 00004',
    district: 'Statewide',
    city: 'Secretariat, Chennai',
    address: 'Municipal Administration Dept',
    account_status: 'active'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // 1. One-time clean-up: Purge any old demo dummy user from localStorage
    const saved = localStorage.getItem('cleantn_session_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'usr-cit-01' || parsed.email === 'citizen@cleantn360.gov.in') {
          localStorage.removeItem('cleantn_session_user');
          localStorage.removeItem('cleantn_deposits');
          localStorage.removeItem('cleantn_tx');
          localStorage.removeItem('cleantn_wallet');
          localStorage.removeItem('cleantn_redemptions');
          localStorage.removeItem('cleantn_notifications');
        }
      } catch (e) {
        localStorage.removeItem('cleantn_session_user');
      }
    }

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            // Restore any stored local demo session
            restoreLocalSession();
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(null);
            }
          });

          return () => subscription.unsubscribe();
        } catch (err) {
          console.warn('Supabase auth init error:', err);
          restoreLocalSession();
        } finally {
          setLoading(false);
        }
      } else {
        restoreLocalSession();
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  function restoreLocalSession() {
    const saved = localStorage.getItem('cleantn_session_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'usr-cit-01' || parsed.email === 'citizen@cleantn360.gov.in') {
          localStorage.removeItem('cleantn_session_user');
          setUser(null);
          setProfile(null);
          return;
        }
        setUser({ id: parsed.id, email: parsed.email });
        setProfile(parsed);
      } catch (e) {
        setUser(null);
        setProfile(null);
      }
    } else {
      // Clean start: Not logged in! User must register or login
      setUser(null);
      setProfile(null);
    }
  }

  async function fetchProfile(userId) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
    }
  }

  // Citizen Registration
  async function registerCitizen(data) {
    const { email, password, fullName, phone, district, city, address } = data;
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanDistrict = district || 'Coimbatore';
    const cleanCity = city.trim() || 'Mettupalayam';
    const cleanAddress = address.trim() || '';

    let supabaseSucceeded = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              district: cleanDistrict,
              city: cleanCity,
              address: cleanAddress,
              role: 'citizen'
            }
          }
        });

        if (error) {
          const isRateLimit = error.message?.toLowerCase().includes('rate limit') ||
                              error.message?.toLowerCase().includes('email') ||
                              error.status === 429;
          if (isRateLimit) {
            console.warn('Supabase email confirmation rate limit reached. Proceeding with instant local registration fallback:', error.message);
          } else {
            throw error;
          }
        } else {
          supabaseSucceeded = true;
          const userObj = {
            id: authData?.user?.id || 'usr-cit-' + Date.now().toString(36),
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone,
            district: cleanDistrict,
            city: cleanCity,
            address: cleanAddress,
            role: 'citizen',
            account_status: 'active',
            created_at: new Date().toISOString()
          };
          setUser({ id: userObj.id, email: userObj.email });
          setProfile(userObj);
          localStorage.setItem('cleantn_session_user', JSON.stringify(userObj));

          // Also save credentials locally for offline/rate-limit persistence
          const registered = JSON.parse(localStorage.getItem('cleantn_registered_users') || '[]');
          const filtered = registered.filter(u => u.email.toLowerCase() !== cleanEmail.toLowerCase());
          filtered.push({ ...userObj, password });
          localStorage.setItem('cleantn_registered_users', JSON.stringify(filtered));

          return { user: userObj };
        }
      } catch (err) {
        const isRateLimit = err.message?.toLowerCase().includes('rate limit') ||
                            err.message?.toLowerCase().includes('email') ||
                            err.status === 429;
        if (isRateLimit) {
          console.warn('Supabase email rate limit caught. Proceeding with instant registration:', err.message);
        } else {
          throw err;
        }
      }
    }

    // Instant local registration fallback (so citizen is NEVER blocked by Supabase SMTP rate limits)
    const newCitizen = {
      id: 'usr-cit-' + Date.now().toString(36),
      email: cleanEmail,
      full_name: cleanName,
      role: 'citizen',
      phone: cleanPhone,
      district: cleanDistrict,
      city: cleanCity,
      address: cleanAddress,
      account_status: 'active',
      created_at: new Date().toISOString()
    };

    const registered = JSON.parse(localStorage.getItem('cleantn_registered_users') || '[]');
    const filtered = registered.filter(u => u.email.toLowerCase() !== cleanEmail.toLowerCase());
    filtered.push({ ...newCitizen, password });
    localStorage.setItem('cleantn_registered_users', JSON.stringify(filtered));

    localStorage.setItem('cleantn_session_user', JSON.stringify(newCitizen));
    setUser({ id: newCitizen.id, email: newCitizen.email });
    setProfile(newCitizen);

    return { user: newCitizen };
  }

  // Login
  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!error && data?.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
          return data;
        }
      } catch (err) {
        console.warn('Supabase signIn failed, checking registered users:', err.message);
      }
    }

    // 2. Check locally registered users (e.g. Makizh N)
    const registeredUsers = JSON.parse(localStorage.getItem('cleantn_registered_users') || '[]');
    const registered = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (registered) {
      if (registered.password && registered.password !== password) {
        throw new Error('Incorrect password. Please verify and try again.');
      }
      localStorage.setItem('cleantn_session_user', JSON.stringify(registered));
      setUser({ id: registered.id, email: registered.email });
      setProfile(registered);
      return { user: registered };
    }

    // 3. Fallback generic role accounts
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      localStorage.setItem('cleantn_session_user', JSON.stringify(found));
      setUser({ id: found.id, email: found.email });
      setProfile(found);
      return { user: found };
    }

    throw new Error('Account not found. Please click Register as Citizen to create your account.');
  }

  // Clear all local data and credentials
  function clearAllLocalDataAndLogout() {
    localStorage.removeItem('cleantn_session_user');
    localStorage.removeItem('cleantn_registered_users');
    localStorage.removeItem('cleantn_deposits');
    localStorage.removeItem('cleantn_tx');
    localStorage.removeItem('cleantn_wallet');
    localStorage.removeItem('cleantn_redemptions');
    localStorage.removeItem('cleantn_notifications');
    localStorage.removeItem('cleantn_tickets');
    localStorage.removeItem('cleantn_audits');
    setUser(null);
    setProfile(null);
  }

  // Quick switch role (PRESERVES the actual registered user's name like Makizh N!)
  function switchDemoRole(roleName) {
    if (profile && profile.full_name && !profile.full_name.includes('Member') && !profile.full_name.includes('Collector') && !profile.full_name.includes('Administrator')) {
      const updatedProfile = {
        ...profile,
        role: roleName
      };
      localStorage.setItem('cleantn_session_user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return;
    }

    const target = DEMO_USERS.find(u => u.role === roleName) || DEMO_USERS[0];
    localStorage.setItem('cleantn_session_user', JSON.stringify(target));
    setUser({ id: target.id, email: target.email });
    setProfile(target);
  }

  // Forgot password
  async function resetPassword(email) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
    }
    return true;
  }

  // Logout
  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('cleantn_session_user');
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile?.role || 'citizen',
        registerCitizen,
        login,
        logout,
        clearAllLocalDataAndLogout,
        resetPassword,
        switchDemoRole,
        isSupabaseConfigured,
        demoUsers: DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

