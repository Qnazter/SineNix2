import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, AlertCircle, CheckCircle, Filter, Search, Edit, Trash2, Menu, X, Home, BarChart3, Users, Settings, ChevronRight, Calendar, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { LogbookEntries } from '@/entities/logbookentries';
import { Subjects } from '@/entities/subjects';
import { format, parseISO } from 'date-fns';

export default function LogbookPage() {
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntries[]>([]);
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogbookEntries[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntries | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [dateRecorded, setDateRecorded] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [relatedSubject, setRelatedSubject] = useState('');
  const [severityLevel, setSeverityLevel] = useState(1);
  const [correctionAction, setCorrectionAction] = useState('');
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEntries();
    // Trigger re-animation when filters change
    setAnimationKey(prev => prev + 1);
  }, [logbookEntries, searchTerm, filterSubject, filterStatus]);

  const fetchData = async () => {
    try {
      const [entriesResult, subjectsResult] = await Promise.all([
        BaseCrudService.getAll<LogbookEntries>('logbookentries'),
        BaseCrudService.getAll<Subjects>('subjects')
      ]);

      setLogbookEntries(entriesResult.items);
      setSubjects(subjectsResult.items);
    } catch (error) {
      console.error('Error fetching logbook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = logbookEntries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.mistakeDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.relatedSubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.correctionAction?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(entry => entry.relatedSubject === filterSubject);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(entry => 
        filterStatus === 'resolved' ? entry.isResolved : !entry.isResolved
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.dateRecorded ? (typeof a.dateRecorded === 'string' ? parseISO(a.dateRecorded) : a.dateRecorded) : new Date(0);
      const dateB = b.dateRecorded ? (typeof b.dateRecorded === 'string' ? parseISO(b.dateRecorded) : b.dateRecorded) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredEntries(filtered);
  };

  const resetForm = () => {
    setMistakeDescription('');
    setDateRecorded(format(new Date(), 'yyyy-MM-dd'));
    setRelatedSubject('');
    setSeverityLevel(1);
    setCorrectionAction('');
    setIsResolved(false);
    setEditingEntry(null);
  };

  const handleCreateOrUpdateEntry = async () => {
    if (!mistakeDescription || !relatedSubject) return;

    try {
      const entryData: LogbookEntries = {
        _id: editingEntry?._id || crypto.randomUUID(),
        mistakeDescription,
        dateRecorded,
        relatedSubject,
        severityLevel,
        correctionAction,
        isResolved
      };

      if (editingEntry) {
        await BaseCrudService.update('logbookentries', entryData);
      } else {
        await BaseCrudService.create('logbookentries', entryData);
      }

      await fetchData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving logbook entry:', error);
    }
  };

  const handleEditEntry = (entry: LogbookEntries) => {
    setEditingEntry(entry);
    setMistakeDescription(entry.mistakeDescription || '');
    setDateRecorded(entry.dateRecorded ? 
      (typeof entry.dateRecorded === 'string' ? entry.dateRecorded.split('T')[0] : format(entry.dateRecorded, 'yyyy-MM-dd')) : 
      format(new Date(), 'yyyy-MM-dd')
    );
    setRelatedSubject(entry.relatedSubject || '');
    setSeverityLevel(entry.severityLevel || 1);
    setCorrectionAction(entry.correctionAction || '');
    setIsResolved(entry.isResolved || false);
    setIsDialogOpen(true);
  };

  const handleToggleResolved = async (entry: LogbookEntries) => {
    try {
      const updatedEntry = { ...entry, isResolved: !entry.isResolved };
      await BaseCrudService.update('logbookentries', updatedEntry);
      await fetchData();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this mistake entry?')) {
      try {
        await BaseCrudService.delete('logbookentries', entryId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 4: return 'bg-red-100 text-red-800 border-red-200';
      case 5: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Minor';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Critical';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="font-paragraph text-lg"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          LOADING LOGBOOK...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-gridline transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <motion.div 
            className="flex items-center justify-between p-6 border-b border-gridline"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div>
                <BookOpen className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">SineNix</h2>
                <p className="font-paragraph text-xs text-muted-foreground">Logbook</p>
              </div>
            </div>
            <motion.button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Navigation Menu */}
          <motion.nav 
            className="flex-1 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              {[
                { icon: Home, label: "Home", path: "/", delay: 0 },
                { icon: BarChart3, label: "Dashboard", path: "/dashboard", delay: 0.1 },
                { icon: Calendar, label: "Calendar", path: "/calendar", delay: 0.2 },
                { icon: BookOpen, label: "Logbook", path: "/logbook", delay: 0.3, active: true },
                { icon: Users, label: "Subjects", path: "/subjects", delay: 0.4 },
                { icon: TrendingUp, label: "Insights", path: "/insights", delay: 0.5 }
              ].map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + item.delay }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      item.active 
                        ? 'bg-secondary text-secondary-foreground shadow-lg' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <motion.div
                      animate={item.active ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 1, delay: 0.8 + item.delay }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-paragraph font-medium">{item.label}</span>
                    {item.active && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.0 + item.delay }}
                      >
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>

          {/* Quick Stats in Sidebar */}
          <motion.div 
            className="p-6 border-t border-gridline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide mb-4 text-muted-foreground">
              Quick Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total Mistakes", value: logbookEntries.length, color: "text-secondary" },
                { label: "Pending", value: logbookEntries.filter(entry => !entry.isResolved).length, color: "text-yellow-500" },
                { label: "Resolved", value: logbookEntries.filter(entry => entry.isResolved).length, color: "text-green-500" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.4 + (index * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="font-paragraph text-sm text-muted-foreground">{stat.label}</span>
                  <motion.span 
                    className={`font-heading text-sm font-bold ${stat.color}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 + (index * 0.1), type: "spring" }}
                  >
                    {stat.value}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar Footer */}
          <motion.div 
            className="p-6 border-t border-gridline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with Mobile Menu Button */}
        <motion.header 
          className="bg-primary text-primary-foreground py-8 px-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-[100rem] mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.button>
                
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="font-heading text-4xl font-bold uppercase tracking-wide">MISTAKE LOGBOOK</h1>

                </motion.div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-secondary text-black hover:bg-secondary/90">
                      <Plus className="w-5 h-5 mr-2 text-black" />
                      LOG MISTAKE
                    </Button>
                  </motion.div>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-heading uppercase tracking-wide text-white">
                    {editingEntry ? 'Edit Mistake Entry' : 'Log New Mistake'}
                  </DialogTitle>

                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mistakeDescription" className="font-heading uppercase tracking-wide text-sm text-white">
                      Mistake Description *
                    </Label>
                    <Textarea
                      id="mistakeDescription"
                      value={mistakeDescription}
                      onChange={(e) => setMistakeDescription(e.target.value)}
                      placeholder="Describe what went wrong..."
                      className="font-paragraph text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="dateRecorded" className="font-heading uppercase tracking-wide text-sm text-white">Date</Label>
                    <Input
                      id="dateRecorded"
                      type="date"
                      value={dateRecorded}
                      onChange={(e) => setDateRecorded(e.target.value)}
                      className="font-paragraph text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="relatedSubject" className="font-heading uppercase tracking-wide text-sm text-white">
                      Related Subject *
                    </Label>
                    <Select value={relatedSubject} onValueChange={setRelatedSubject}>
                      <SelectTrigger className="font-paragraph text-white">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject.subjectName || ''}>
                            {subject.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="severityLevel" className="font-heading uppercase tracking-wide text-sm text-white">
                      Severity Level
                    </Label>
                    <Select value={severityLevel.toString()} onValueChange={(value) => setSeverityLevel(parseInt(value))}>
                      <SelectTrigger className="font-paragraph text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Minor</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="correctionAction" className="font-heading uppercase tracking-wide text-sm text-white">
                      Correction Action
                    </Label>
                    <Textarea
                      id="correctionAction"
                      value={correctionAction}
                      onChange={(e) => setCorrectionAction(e.target.value)}
                      placeholder="How will you fix this mistake?"
                      className="font-paragraph text-white"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isResolved"
                      checked={isResolved}
                      onCheckedChange={setIsResolved}
                      className="bg-white data-[state=checked]:bg-white"
                    />
                    <Label htmlFor="isResolved" className="font-heading uppercase tracking-wide text-sm text-white">
                      Mark as Resolved
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-white">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrUpdateEntry} className="bg-secondary text-black hover:bg-secondary/90">
                    {editingEntry ? 'Update Entry' : 'Log Mistake'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </motion.header>

        {/* Main Logbook Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[100rem] mx-auto px-8 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          key={`filters-${animationKey}`}
        >
          <Card className="border-gridline mb-8">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 0.8 }}
                  >
                    <Filter className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Filter & Search
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <motion.div 
                  className="grid gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <Label className="font-heading uppercase tracking-wide text-sm">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search mistakes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-paragraph"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="grid gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Label className="font-heading uppercase tracking-wide text-sm">Subject</Label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="font-paragraph">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject.subjectName || ''}>
                          {subject.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="grid gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <Label className="font-heading uppercase tracking-wide text-sm">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="font-paragraph">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="flex items-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSubject('all');
                      setFilterStatus('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          key={`stats-${animationKey}`}
        >
          {[
            {
              title: "Total Mistakes",
              value: logbookEntries.length,
              icon: BookOpen,
              color: "text-secondary",
              delay: 0
            },
            {
              title: "Resolved",
              value: logbookEntries.filter(entry => entry.isResolved).length,
              icon: CheckCircle,
              color: "text-green-500",
              delay: 0.1
            },
            {
              title: "Pending",
              value: logbookEntries.filter(entry => !entry.isResolved).length,
              icon: AlertCircle,
              color: "text-yellow-500",
              delay: 0.2
            },
            {
              title: "Resolution Rate",
              value: `${logbookEntries.length > 0 ? Math.round((logbookEntries.filter(entry => entry.isResolved).length / logbookEntries.length) * 100) : 0}%`,
              icon: null,
              color: "text-secondary",
              delay: 0.3
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 1.6 + stat.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredCard(stat.title)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`border-gridline transition-all duration-300 ${
                hoveredCard === stat.title ? 'border-secondary shadow-lg shadow-secondary/20' : 'hover:border-secondary/50'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <motion.p 
                        className={`font-heading text-2xl font-bold leading-none ${
                          stat.title === "Resolved" ? "text-green-600" : 
                          stat.title === "Pending" ? "text-yellow-600" : 
                          stat.title === "Resolution Rate" ? "text-secondary" : ""
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1.8 + stat.delay,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {stat.icon ? (
                        <motion.div
                          animate={{ 
                            rotate: hoveredCard === stat.title ? 360 : 0,
                            scale: hoveredCard === stat.title ? 1.2 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center"
                          animate={{ 
                            rotate: hoveredCard === stat.title ? 360 : 0,
                            scale: hoveredCard === stat.title ? 1.2 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-secondary font-heading font-bold text-sm">%</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Logbook Entries */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          key={`entries-${animationKey}`}
        >
          <Card className="border-gridline">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 }}
              >
                <CardTitle className="font-heading text-xl uppercase tracking-wide">
                  Mistake Entries ({filteredEntries.length})
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Your recorded learning mistakes and corrections
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {filteredEntries.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4 }}
                >
                  <AnimatePresence>
                    {filteredEntries.map((entry, index) => {
                      const entryDate = entry.dateRecorded ? 
                        (typeof entry.dateRecorded === 'string' ? parseISO(entry.dateRecorded) : entry.dateRecorded) : 
                        null;
                      
                      return (
                        <motion.div 
                          key={entry._id} 
                          className="border border-gridline rounded-lg p-6 hover:border-secondary/50 transition-colors"
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 2.6 + (index * 0.1),
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ 
                            scale: 1.02,
                            y: -5,
                            transition: { duration: 0.2 }
                          }}
                          onHoverStart={() => setHoveredCard(entry._id)}
                          onHoverEnd={() => setHoveredCard(null)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 pr-4">
                                <motion.div 
                                  className="flex items-center gap-3 mb-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 2.8 + (index * 0.1) }}
                                >
                                  <h3 className="font-heading font-semibold text-lg">{entry.relatedSubject}</h3>
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 3.0 + (index * 0.1), type: "spring" }}
                                  >
                                    <Badge className={`text-xs border ${getSeverityColor(entry.severityLevel || 1)}`}>
                                      {getSeverityLabel(entry.severityLevel || 1)}
                                    </Badge>
                                  </motion.div>
                                </motion.div>
                                <motion.p 
                                  className="font-paragraph text-muted-foreground text-sm mb-3"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 3.2 + (index * 0.1) }}
                                >
                                  {entryDate ? format(entryDate, 'MMM dd, yyyy') : 'No date'}
                                </motion.p>
                                
                                {/* Resolution Status Toggle - Now Outside and Prominent */}
                                <motion.div 
                                  className="flex items-center gap-3 mb-3"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 3.4 + (index * 0.1) }}
                                >
                                  <span className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
                                    Status:
                                  </span>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer"
                                    onClick={() => handleToggleResolved(entry)}
                                  >
                                    <Badge 
                                      variant={entry.isResolved ? 'default' : 'secondary'}
                                      className={`px-3 py-1 text-sm font-medium transition-all duration-200 hover:shadow-md ${
                                        entry.isResolved 
                                          ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                                          : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
                                      }`}
                                    >
                                      <motion.div
                                        className="flex items-center gap-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 3.6 + (index * 0.1) }}
                                      >
                                        {entry.isResolved ? (
                                          <>
                                            <CheckCircle className="w-4 h-4" />
                                            RESOLVED
                                          </>
                                        ) : (
                                          <>
                                            <AlertCircle className="w-4 h-4" />
                                            PENDING
                                          </>
                                        )}
                                      </motion.div>
                                    </Badge>
                                  </motion.div>
                                  <motion.span 
                                    className="text-xs text-muted-foreground italic"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 3.8 + (index * 0.1) }}
                                  >
                                    Click to toggle
                                  </motion.span>
                                </motion.div>
                              </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 4.0 + (index * 0.1) }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditEntry(entry)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 4.2 + (index * 0.1) }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                          <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3.8 + (index * 0.1) }}
                          >
                            <div>
                              <h4 className="font-heading font-medium text-sm uppercase tracking-wide mb-1">
                                Mistake Description
                              </h4>
                              <p className="font-paragraph text-sm">{entry.mistakeDescription}</p>
                            </div>

                            {entry.correctionAction && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 4.0 + (index * 0.1) }}
                              >
                                <h4 className="font-heading font-medium text-sm uppercase tracking-wide mb-1">
                                  Correction Action
                                </h4>
                                <p className="font-paragraph text-sm text-muted-foreground">{entry.correctionAction}</p>
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.4 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <motion.h3 
                    className="font-heading text-lg font-semibold mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6 }}
                  >
                    No Mistakes Found
                  </motion.h3>
                  <motion.p 
                    className="font-paragraph text-muted-foreground mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 }}
                  >
                    {logbookEntries.length === 0 
                      ? "Start logging your learning mistakes to track improvement."
                      : "No mistakes match your current filters."
                    }
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      LOG FIRST MISTAKE
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}