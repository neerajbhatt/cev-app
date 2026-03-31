import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setToken, clearToken } from '../api'

const AppContext = createContext(null)

const MONTHS = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026']
const REQUIRED_DOCS = ['Paystub / Wage Statement', 'Training Enrollment Letter', 'Employer Verification Form']

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [compliance, setCompliance] = useState([])
  const [activities, setActivities] = useState([])
  const [documents, setDocuments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [delegates, setDelegates] = useState([])
  const [authLoading, setAuthLoading] = useState(true)

  const loadAll = useCallback(async () => {
    const [comp, acts, docs, notifs, dels] = await Promise.all([
      api.getCompliance(),
      api.getActivities(),
      api.getDocuments(),
      api.getNotifications(),
      api.getDelegates(),
    ])
    setCompliance(comp)
    setActivities(acts)
    setDocuments(docs)
    setNotifications(notifs)
    setDelegates(dels)
  }, [])

  // Restore session on page load
  useEffect(() => {
    const saved = localStorage.getItem('cev_token')
    if (saved) {
      setToken(saved)
      api.getProfile()
        .then((profile) => { setUser(profile); loadAll().catch(console.error) })
        .catch(() => clearToken())
        .finally(() => setAuthLoading(false))
    } else {
      setAuthLoading(false)
    }
  }, [loadAll])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
    loadAll().catch(console.error) // load data in background, don't block navigation
  }

  const register = async (formData) => {
    const data = await api.register(formData)
    setToken(data.token)
    setUser(data.user)
    loadAll().catch(console.error)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setCompliance([])
    setActivities([])
    setDocuments([])
    setNotifications([])
    setDelegates([])
  }

  const addActivity = async (activity) => {
    const newAct = await api.addActivity(activity)
    setActivities(prev => [...prev, newAct])
    const comp = await api.getCompliance()
    setCompliance(comp)
  }

  const deleteActivity = async (id) => {
    await api.deleteActivity(id)
    setActivities(prev => prev.filter(a => a.id !== id))
    const comp = await api.getCompliance()
    setCompliance(comp)
  }

  const addDocument = async (formData) => {
    const doc = await api.uploadDocument(formData)
    setDocuments(prev => [doc, ...prev])
    const notifs = await api.getNotifications()
    setNotifications(notifs)
  }

  const markNotificationRead = async (id) => {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await api.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const addDelegate = async (delegate) => {
    const newDel = await api.addDelegate(delegate)
    setDelegates(prev => [...prev, newDel])
  }

  const removeDelegate = async (id) => {
    await api.removeDelegate(id)
    setDelegates(prev => prev.filter(d => d.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      user, compliance, activities, documents, notifications, delegates,
      unreadCount, MONTHS, REQUIRED_DOCS, authLoading,
      login, register, logout,
      addActivity, deleteActivity, addDocument,
      markNotificationRead, markAllRead,
      addDelegate, removeDelegate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
