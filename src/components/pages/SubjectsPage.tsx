import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, ExternalLink, Star, BarChart3, Edit, Trash2, TrendingUp, Users, Menu, X, Home, Calendar, Target, Settings, ChevronRight, FileText, CheckCircle, Circle, PlayCircle, Pin, PinOff } from 'lucide-react';
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
import { Image } from '@/components/ui/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BaseCrudService } from '@/integrations';
import { Subjects } from '@/entities/subjects';
import { StudySessions } from '@/entities/studysessions';
import { LogbookEntries } from '@/entities/logbookentries';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [studySessions, setStudySessions] = useState<StudySessions[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntries[]>([]);
  const [pinnedSubjects, setPinnedSubjects] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subjects | null>(null);
  const [managingContentSubject, setManagingContentSubject] = useState<Subjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [description, setDescription] = useState('');
  const [subjectImage, setSubjectImage] = useState('');
  const [studyMaterialsLink, setStudyMaterialsLink] = useState('');
  const [additionalResourcesLink, setAdditionalResourcesLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  // Content management state
  const [contentModules, setContentModules] = useState<ContentModule[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  // Content module interface
  interface ContentModule {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    order: number;
  }

  useEffect(() => {
    fetchData();
    loadPinnedSubjects();
  }, []);

  const loadPinnedSubjects = () => {
    const saved = localStorage.getItem('pinnedSubjects');
    if (saved) {
      setPinnedSubjects(JSON.parse(saved));
    }
  };

  const savePinnedSubjects = (pinned: string[]) => {
    localStorage.setItem('pinnedSubjects', JSON.stringify(pinned));
    setPinnedSubjects(pinned);
  };

  const fetchData = async () => {
    try {
      const [subjectsResult, sessionsResult, logbookResult] = await Promise.all([
        BaseCrudService.getAll<Subjects>('subjects'),
        BaseCrudService.getAll<StudySessions>('studysessions'),
        BaseCrudService.getAll<LogbookEntries>('logbookentries')
      ]);

      setSubjects(subjectsResult.items);
      setStudySessions(sessionsResult.items);
      setLogbookEntries(logbookResult.items);
    } catch (error) {
      console.error('Error fetching subjects data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubjectName('');
    setSubjectCode('');
    setDescription('');
    setSubjectImage('');
    setStudyMaterialsLink('');
    setAdditionalResourcesLink('');
    setIsActive(true);
    setDifficultyLevel(1);
    setEditingSubject(null);
  };

  const resetContentForm = () => {
    setNewModuleTitle('');
    setNewModuleDescription('');
  };

  const parseContentModules = (contentModulesString?: string): ContentModule[] => {
    if (!contentModulesString) return [];
    try {
      return JSON.parse(contentModulesString);
    } catch {
      return [];
    }
  };

  const calculateProgress = (modules: ContentModule[]) => {
    if (modules.length === 0) return 0;
    const completedCount = modules.filter(module => module.completed).length;
    return Math.round((completedCount / modules.length) * 100);
  };

  const updateSubjectProgress = async (subjectId: string, modules: ContentModule[]) => {
    const totalItems = modules.length;
    const completedItems = modules.filter(module => module.completed).length;
    const progressPercentage = calculateProgress(modules);
    const completionStatus = progressPercentage === 100;

    try {
      const subject = subjects.find(s => s._id === subjectId);
      if (subject) {
        const updatedSubject = {
          ...subject,
          contentModules: JSON.stringify(modules),
          totalContentItems: totalItems,
          completedContentItems: completedItems,
          progressPercentage,
          completionStatus
        };
        await BaseCrudService.update('subjects', updatedSubject);
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating subject progress:', error);
    }
  };

  const handleCreateOrUpdateSubject = async () => {
    if (!subjectName) return;

    try {
      const subjectData: Subjects = {
        _id: editingSubject?._id || crypto.randomUUID(),
        subjectName,
        subjectCode,
        description,
        subjectImage,
        studyMaterialsLink,
        additionalResourcesLink,
        isActive,
        difficultyLevel,
        contentModules: editingSubject?.contentModules || '[]',
        totalContentItems: editingSubject?.totalContentItems || 0,
        completedContentItems: editingSubject?.completedContentItems || 0,
        progressPercentage: editingSubject?.progressPercentage || 0,
        completionStatus: editingSubject?.completionStatus || false
      };

      if (editingSubject) {
        await BaseCrudService.update('subjects', subjectData);
      } else {
        await BaseCrudService.create('subjects', subjectData);
      }

      await fetchData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEditSubject = (subject: Subjects) => {
    setEditingSubject(subject);
    setSubjectName(subject.subjectName || '');
    setSubjectCode(subject.subjectCode || '');
    setDescription(subject.description || '');
    setSubjectImage(subject.subjectImage || '');
    setStudyMaterialsLink(subject.studyMaterialsLink || '');
    setAdditionalResourcesLink(subject.additionalResourcesLink || '');
    setIsActive(subject.isActive ?? true);
    setDifficultyLevel(subject.difficultyLevel || 1);
    setIsDialogOpen(true);
  };

  const handleTogglePin = (subjectId: string) => {
    const isPinned = pinnedSubjects.includes(subjectId);
    let newPinned: string[];
    
    if (isPinned) {
      newPinned = pinnedSubjects.filter(id => id !== subjectId);
    } else {
      newPinned = [...pinnedSubjects, subjectId];
    }
    
    savePinnedSubjects(newPinned);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await BaseCrudService.delete('subjects', subjectId);
        // Remove from pinned subjects if it was pinned
        const newPinned = pinnedSubjects.filter(id => id !== subjectId);
        savePinnedSubjects(newPinned);
        await fetchData();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleManageContent = (subject: Subjects) => {
    setManagingContentSubject(subject);
    setContentModules(parseContentModules(subject.contentModules));
    setIsContentDialogOpen(true);
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;

    const newModule: ContentModule = {
      id: crypto.randomUUID(),
      title: newModuleTitle,
      description: newModuleDescription,
      completed: false,
      order: contentModules.length + 1
    };

    const updatedModules = [...contentModules, newModule];
    setContentModules(updatedModules);
    resetContentForm();
  };

  const handleToggleModuleCompletion = (moduleId: string) => {
    const updatedModules = contentModules.map(module =>
      module.id === moduleId ? { ...module, completed: !module.completed } : module
    );
    setContentModules(updatedModules);
  };

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = contentModules.filter(module => module.id !== moduleId);
    setContentModules(updatedModules);
  };

  const handleSaveContent = async () => {
    if (!managingContentSubject) return;

    await updateSubjectProgress(managingContentSubject._id, contentModules);
    setIsContentDialogOpen(false);
    setManagingContentSubject(null);
    setContentModules([]);
  };

  const getSubjectStats = (subjectName: string) => {
    const sessions = studySessions.filter(session => session.subjectName === subjectName);
    const mistakes = logbookEntries.filter(entry => entry.relatedSubject === subjectName);
    const resolvedMistakes = mistakes.filter(mistake => mistake.isResolved);
    
    return {
      totalSessions: sessions.length,
      totalMistakes: mistakes.length,
      resolvedMistakes: resolvedMistakes.length,
      resolutionRate: mistakes.length > 0 ? Math.round((resolvedMistakes.length / mistakes.length) * 100) : 0
    };
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Medium';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  // Filter subjects based on active tab
  const getFilteredSubjects = () => {
    let filtered: Subjects[];
    
    switch (activeTab) {
      case 'pinned':
        filtered = subjects.filter(subject => pinnedSubjects.includes(subject._id));
        break;
      case 'active':
        filtered = subjects.filter(subject => subject.isActive);
        break;
      case 'inactive':
        filtered = subjects.filter(subject => !subject.isActive);
        break;
      case 'beginner':
        filtered = subjects.filter(subject => (subject.difficultyLevel || 1) <= 2);
        break;
      case 'intermediate':
        filtered = subjects.filter(subject => (subject.difficultyLevel || 1) === 3);
        break;
      case 'advanced':
        filtered = subjects.filter(subject => (subject.difficultyLevel || 1) >= 4);
        break;
      default:
        filtered = subjects;
    }

    // Sort pinned subjects to the top for all tabs except 'pinned'
    if (activeTab !== 'pinned') {
      filtered.sort((a, b) => {
        const aIsPinned = pinnedSubjects.includes(a._id);
        const bIsPinned = pinnedSubjects.includes(b._id);
        
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredSubjects = getFilteredSubjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="font-paragraph text-lg"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          LOADING SUBJECTS...
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
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">SineNix</h2>
                <p className="font-paragraph text-xs text-muted-foreground">Subjects</p>
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
                { icon: BookOpen, label: "Logbook", path: "/logbook", delay: 0.3 },
                { icon: Users, label: "Subjects", path: "/subjects", delay: 0.4, active: true },
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
                { label: "Total Subjects", value: subjects.length, color: "text-secondary" },
                { label: "Active Subjects", value: subjects.filter(s => s.isActive).length, color: "text-green-500" },
                { label: "Study Sessions", value: studySessions.length, color: "text-blue-500" }
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
                  <h1 className="font-heading text-4xl font-bold uppercase tracking-wide">{"SUBJECTS"}</h1>

                </motion.div>
              </div>
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-background/10 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`${viewMode === 'list' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground hover:bg-background/20'}`}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground hover:bg-background/20'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  </div>
                
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="bg-secondary text-black hover:bg-secondary/90">
                        <Plus className="w-5 h-5 mr-2" />
                        ADD SUBJECT
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                {/* ... keep existing dialog content ... */}
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading uppercase tracking-wide text-white">
                    {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                  </DialogTitle>
                  <DialogDescription className="font-paragraph">
                    {editingSubject ? 'Update subject information and resources.' : 'Add a new subject to your study curriculum.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subjectName" className="font-heading uppercase tracking-wide text-sm text-white">
                        Subject Name *
                      </Label>
                      <Input
                        id="subjectName"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="e.g., Mathematics"
                        className="font-paragraph text-white"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="subjectCode" className="font-heading uppercase tracking-wide text-sm text-white">
                        Subject Code
                      </Label>
                      <Input
                        id="subjectCode"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        placeholder="e.g., MATH101"
                        className="font-paragraph text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-heading uppercase tracking-wide text-sm text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the subject..."
                      className="font-paragraph text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="subjectImage" className="font-heading uppercase tracking-wide text-sm text-white">
                      Subject Image URL
                    </Label>
                    <Input
                      id="subjectImage"
                      value={subjectImage}
                      onChange={(e) => setSubjectImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="font-paragraph text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="studyMaterialsLink" className="font-heading uppercase tracking-wide text-sm text-white">
                      Study Materials Link
                    </Label>
                    <Input
                      id="studyMaterialsLink"
                      value={studyMaterialsLink}
                      onChange={(e) => setStudyMaterialsLink(e.target.value)}
                      placeholder="https://example.com/materials"
                      className="font-paragraph text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="additionalResourcesLink" className="font-heading uppercase tracking-wide text-sm text-white">
                      Additional Resources Link
                    </Label>
                    <Input
                      id="additionalResourcesLink"
                      value={additionalResourcesLink}
                      onChange={(e) => setAdditionalResourcesLink(e.target.value)}
                      placeholder="https://example.com/resources"
                      className="font-paragraph text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="difficultyLevel" className="font-heading uppercase tracking-wide text-sm text-white">
                        Difficulty Level
                      </Label>
                      <Select value={difficultyLevel.toString()} onValueChange={(value) => setDifficultyLevel(parseInt(value))}>
                        <SelectTrigger className="font-paragraph text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Beginner</SelectItem>
                          <SelectItem value="2">2 - Easy</SelectItem>
                          <SelectItem value="3">3 - Medium</SelectItem>
                          <SelectItem value="4">4 - Hard</SelectItem>
                          <SelectItem value="5">5 - Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 mt-6 ">
                      <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        className="bg-white data-[state=checked]:bg-white"
                      />
                      <Label htmlFor="isActive" className="font-heading uppercase tracking-wide text-sm text-white">
                        Active Subject
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-white">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrUpdateSubject} className="bg-secondary text-black hover:bg-secondary/90">
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </Button>
                </div>
              </DialogContent>
              </Dialog>

              {/* Content Management Dialog */}
              <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
                setIsContentDialogOpen(open);
                if (!open) {
                  setManagingContentSubject(null);
                  setContentModules([]);
                  resetContentForm();
                }
              }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading uppercase tracking-wide">
                      Manage Content - {managingContentSubject?.subjectName}
                    </DialogTitle>
                    <DialogDescription className="font-paragraph">
                      Add, edit, and track progress of content modules for this subject.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Progress Overview */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading text-sm uppercase tracking-wide text-foreground">Progress</span>
                        <span className="font-heading text-lg font-bold text-secondary">
                          {calculateProgress(contentModules)}%
                        </span>
                      </div>
                      <Progress value={calculateProgress(contentModules)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{contentModules.filter(m => m.completed).length} completed</span>
                        <span>{contentModules.length} total modules</span>
                      </div>
                    </div>

                    {/* Add New Module */}
                    <div className="border border-gridline rounded-lg p-4">
                      <h4 className="font-heading text-sm uppercase tracking-wide mb-3 text-foreground">Add New Module</h4>
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <Label htmlFor="moduleTitle" className="font-heading uppercase tracking-wide text-xs">
                            Module Title *
                          </Label>
                          <Input
                            id="moduleTitle"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="e.g., Introduction to Calculus"
                            className="font-paragraph"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="moduleDescription" className="font-heading uppercase tracking-wide text-xs">
                            Description
                          </Label>
                          <Textarea
                            id="moduleDescription"
                            value={newModuleDescription}
                            onChange={(e) => setNewModuleDescription(e.target.value)}
                            placeholder="Brief description of the module..."
                            className="font-paragraph"
                            rows={2}
                          />
                        </div>
                        <Button onClick={handleAddModule} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Module
                        </Button>
                      </div>
                    </div>

                    {/* Content Modules List */}
                    <div className="space-y-3">
                      <h4 className="font-heading text-sm uppercase tracking-wide text-foreground">Content Modules ({contentModules.length})</h4>
                      {contentModules.length > 0 ? (
                        <div className="space-y-2">
                          {contentModules.map((module, index) => (
                            <motion.div
                              key={module.id}
                              className="flex items-center gap-3 p-3 border border-gridline rounded-lg hover:border-secondary/50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleModuleCompletion(module.id)}
                                className="p-1 h-auto"
                              >
                                {module.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <h5 className={`font-heading font-medium ${module.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>
                                  {module.title}
                                </h5>
                                {module.description && (
                                  <p className="font-paragraph text-sm text-muted-foreground">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModule(module.id)}
                                className="text-red-600 hover:text-red-700 p-1 h-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="font-paragraph">No content modules yet. Add your first module above.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveContent} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      Save Content
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Subjects Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[100rem] mx-auto px-6 py-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { 
              title: "Total Subjects", 
              value: subjects.length, 
              icon: BookOpen, 
              color: "text-secondary",
              delay: 0 
            },
            { 
              title: "Active Subjects", 
              value: subjects.filter(subject => subject.isActive).length, 
              icon: Star, 
              color: "text-green-500",
              delay: 0.1 
            },
            { 
              title: "Total Sessions", 
              value: studySessions.length, 
              icon: BarChart3, 
              color: "text-secondary",
              delay: 0.2 
            },
            { 
              title: "Avg Difficulty", 
              value: subjects.length > 0 ? 
                (subjects.reduce((sum, subject) => sum + (subject.difficultyLevel || 1), 0) / subjects.length).toFixed(1) : 
                '0', 
              icon: TrendingUp, 
              color: "text-secondary",
              delay: 0.3 
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + stat.delay }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-base font-medium uppercase tracking-wide text-muted-foreground leading-relaxed">
                        {stat.title}
                      </p>
                      <motion.p 
                        className="font-heading text-2xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 + stat.delay, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, delay: 0.8 + stat.delay }}
                    >
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Subjects Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <TabsList className="grid w-full grid-cols-7 mb-8 bg-card border border-gridline">
                <TabsTrigger 
                  value="all" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  All ({subjects.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="pinned" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Pinned ({pinnedSubjects.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Active ({subjects.filter(s => s.isActive).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="inactive" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Inactive ({subjects.filter(s => !s.isActive).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="beginner" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Beginner ({subjects.filter(s => (s.difficultyLevel || 1) <= 2).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="intermediate" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Intermediate ({subjects.filter(s => (s.difficultyLevel || 1) === 3).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="font-heading uppercase tracking-wide text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  Advanced ({subjects.filter(s => (s.difficultyLevel || 1) >= 4).length})
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value={activeTab} className="mt-0">
              <AnimatePresence mode="wait">
                {filteredSubjects.length > 0 ? (
                  <motion.div 
                    key={`${viewMode}-${activeTab}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={viewMode === 'grid' ? 
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : 
                      "space-y-6"
                    }
                  >
                    {filteredSubjects.map((subject, index) => {
                const stats = getSubjectStats(subject.subjectName || '');
                
                return (
                  <motion.div
                    key={subject._id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    onHoverStart={() => setHoveredCard(subject._id)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    <Card className={`border-gridline transition-all duration-300 ${
                      hoveredCard === subject._id ? 'border-secondary shadow-lg shadow-secondary/20' : 'hover:border-secondary/50'
                    } ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col h-full'}`}>
                      <CardHeader className={`${viewMode === 'list' ? 'flex-1' : 'pb-4'}`}>
                        {subject.subjectImage && viewMode === 'grid' && (
                          <motion.div 
                            className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={subject.subjectImage}
                              alt={subject.subjectName || 'Subject image'}
                              width={400}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        )}
                        
                        <div className={`flex items-start justify-between ${viewMode === 'list' ? 'flex-row' : ''}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="font-heading text-xl uppercase tracking-wide">
                                {subject.subjectName}
                              </CardTitle>
                              <AnimatePresence>
                                {pinnedSubjects.includes(subject._id) && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, rotate: 180 }}
                                    transition={{ duration: 0.3, type: "spring" }}
                                  >
                                    <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary border-secondary/50">
                                      <Pin className="w-3 h-3 mr-1" />
                                      PINNED
                                    </Badge>
                                  </motion.div>
                                )}
                                {!subject.isActive && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Badge variant="secondary" className="text-xs">
                                      INACTIVE
                                    </Badge>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {subject.subjectCode && (
                              <motion.p 
                                className="font-paragraph text-sm text-muted-foreground mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {subject.subjectCode}
                              </motion.p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <Badge className={`text-xs border ${getDifficultyColor(subject.difficultyLevel || 1)}`}>
                                  {getDifficultyLabel(subject.difficultyLevel || 1)}
                                </Badge>
                              </motion.div>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePin(subject._id)}
                                className={`${
                                  pinnedSubjects.includes(subject._id)
                                    ? 'text-secondary border-secondary/50 hover:bg-secondary/10'
                                    : 'text-muted-foreground hover:text-secondary'
                                }`}
                              >
                                {pinnedSubjects.includes(subject._id) ? (
                                  <PinOff className="w-4 h-4" />
                                ) : (
                                  <Pin className="w-4 h-4" />
                                )}
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSubject(subject)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject._id)}
                                className="text-red-600 hover:text-red-700"
                                dir="ltr">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                        {subject.description && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.4 }}
                          >
                            <CardDescription className="font-paragraph">
                              {subject.description}
                            </CardDescription>
                          </motion.div>
                        )}
                      </CardHeader>
                      
                      <CardContent className={`space-y-4 flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'min-w-[300px]' : ''}`}>
                        {/* Progress Bar */}
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-heading font-bold text-secondary text-lg">
                              {subject.progressPercentage || 0}%
                            </span>
                          </div>
                          <Progress value={subject.progressPercentage || 0} className="h-2 bg-black [&>div]:bg-secondary" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{subject.completedContentItems || 0} completed</span>
                            <span>{subject.totalContentItems || 0} total</span>
                          </div>
                        </motion.div>

                        {/* Content Management Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            onClick={() => handleManageContent(subject)}
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start border-secondary/50 hover:border-secondary hover:bg-secondary/10 text-muted-foreground"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Manage Content ({subject.totalContentItems || 0})
                          </Button>
                        </motion.div>

                        {/* Links */}
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          {subject.studyMaterialsLink && (
                            <motion.div
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                                <a href={subject.studyMaterialsLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Study Materials
                                </a>
                              </Button>
                            </motion.div>
                          )}
                          {subject.additionalResourcesLink && (
                            <motion.div
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                                <a href={subject.additionalResourcesLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Additional Resources
                                </a>
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Bottom section - Study Stats and Action Buttons */}
                        <div className="mt-auto space-y-4">
                          {/* Study Stats */}
                          <motion.div 
                            className="grid grid-cols-2 gap-4 p-4 bg-cyber-gray rounded-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="text-center">
                              <motion.div 
                                className="font-heading text-lg font-bold text-secondary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.0, type: "spring" }}
                              >
                                {stats.totalSessions}
                              </motion.div>
                              <p className="font-paragraph text-xs text-muted-foreground">Sessions</p>
                            </div>
                            <div className="text-center">
                              <motion.div 
                                className="font-heading text-lg font-bold text-secondary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.1, type: "spring" }}
                              >
                                {stats.resolutionRate}%
                              </motion.div>
                              <p className="font-paragraph text-xs text-muted-foreground">Resolution</p>
                            </div>
                          </motion.div>

                          {/* Action Buttons */}
                          <motion.div 
                            className="grid grid-cols-2 gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button asChild size="sm" className="bg-secondary text-black hover:bg-secondary/90 w-full">
                                <Link to="/calendar">
                                  Schedule Session
                                </Link>
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/logbook">
                                  Log Mistake
                                </Link>
                              </Button>
                            </motion.div>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-gridline">
                      <CardContent className="text-center py-12">
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
                          transition={{ delay: 0.2 }}
                        >
                          {activeTab === 'all' ? 'No Subjects Yet' : 
                           activeTab === 'pinned' ? 'No Pinned Subjects' :
                           `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Subjects`}
                        </motion.h3>
                        <motion.p 
                          className="font-paragraph text-muted-foreground mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {activeTab === 'all' 
                            ? 'Start by adding your first study subject to organize your learning.'
                            : activeTab === 'pinned'
                            ? 'Pin subjects by clicking the pin icon on any subject card for quick access.'
                            : `No subjects found in the ${activeTab} category. Try a different filter or add new subjects.`
                          }
                        </motion.p>
                        {activeTab === 'all' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                              <Plus className="w-4 h-4 mr-2" />
                              ADD FIRST SUBJECT
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}