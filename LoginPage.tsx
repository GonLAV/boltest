import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../auth.api';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [orgUrl, setOrgUrl] = useState('https://tlvtfs03.ciosus.com/tfs/BoltCollection');
  const [project, setProject] = useState('Epos');
  const [pat, setPat] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const res = await authApi.testConnection({ orgUrl, project, pat });
      if (res.data?.success) {
        toast.success('Connection successful');
      } else {
        toast.error(res.data?.message || 'Connection failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('[DEBUG] Submitting login to API base:', (window as any).__BOLTEST_API_BASE || '(unknown)');
      const res = await authApi.login({ orgUrl, project, pat });
      if (res.data?.success) {
        const token = res.data.token;
        if (token) {
          // persist token; interceptor will attach it to requests
          localStorage.setItem('boltest:token', token);
        }

        localStorage.setItem('boltest:project', project);
        localStorage.setItem('boltest:orgUrl', orgUrl);
        localStorage.setItem('boltest:pat', pat); // Store PAT for use in API calls
        toast.success('Logged in successfully');
        navigate('/app/dashboard');
      } else {
        toast.error(res.data?.message || 'Login failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loginScreen">
      <div className="login-container">
        <div className="login-logo">🧪</div>
        <h1 className="login-title">BOLTEST</h1>
        <p className="login-subtitle">It&apos;s simple to take the next step</p>
        <p className="login-subtitle">Made by Gon Shaul Lavan — keep on going to the next step</p>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="orgName">Organization URL</label>
            <input
              id="orgName"
              className="form-input"
              placeholder="https://your-org.tfs"
              value={orgUrl}
              onChange={(e) => setOrgUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="projectName">Project Name</label>
            <input
              id="projectName"
              className="form-input"
              placeholder="your-project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patToken">Personal Access Token</label>
            <input
              id="patToken"
              className="form-input"
              placeholder="Enter your PAT"
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-actions">
            <button
              type="button"
              className="btn-secondary login-test-btn"
              onClick={handleTestConnection}
              disabled={loading}
            >
              ⚡ Test Connection
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connecting…' : '🔐 Connect to TFS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
