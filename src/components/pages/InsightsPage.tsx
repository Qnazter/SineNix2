import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar, BookOpen, Target, PieChart, Menu, X, Home, Users, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BaseCrudService } from '@/integrations';
import { StudySessions } from '@/entities/studysessions';
import { LogbookEntries } from '@/entities/logbookentries';
import { Subjects } from '@/entities/subjects';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subWeeks, subMonths } from 'date-fns';

export default function InsightsPage() {
  const [studySessions, setStudySessions] = useState<StudySessions[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntries[]>([]);
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Trigger re-animation when time range changes
    setAnimationKey(prev => prev + 1);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [sessionsResult, logbookResult, subjectsResult] = await Promise.all([
        BaseCrudService.getAll<StudySessions>('studysessions'),
        BaseCrudService.getAll<LogbookEntries>('logbookentries'),
        BaseCrudService.getAll<Subjects>('subjects')
      ]);

      setStudySessions(sessionsResult.items);
      setLogbookEntries(logbookResult.items);
      setSubjects(subjectsResult.items);
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'quarter':
        startDate = subMonths(now, 3);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    const filteredSessions = studySessions.filter(session => {
      if (!session.sessionDate) return false;
      const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
      return sessionDate >= startDate;
    });

    const filteredEntries = logbookEntries.filter(entry => {
      if (!entry.dateRecorded) return false;
      const entryDate = typeof entry.dateRecorded === 'string' ? parseISO(entry.dateRecorded) : entry.dateRecorded;
      return entryDate >= startDate;
    });

    return { filteredSessions, filteredEntries };
  };

  const { filteredSessions, filteredEntries } = getFilteredData();

  // Subject performance data
  const getSubjectPerformanceData = () => {
    return subjects.map(subject => {
      const subjectSessions = filteredSessions.filter(session => session.subjectName === subject.subjectName);
      const subjectMistakes = filteredEntries.filter(entry => entry.relatedSubject === subject.subjectName);
      const resolvedMistakes = subjectMistakes.filter(mistake => mistake.isResolved);
      
      return {
        name: subject.subjectName || 'Unknown',
        sessions: subjectSessions.length,
        mistakes: subjectMistakes.length,
        resolved: resolvedMistakes.length,
        resolutionRate: subjectMistakes.length > 0 ? Math.round((resolvedMistakes.length / subjectMistakes.length) * 100) : 0,
        difficulty: subject.difficultyLevel || 1
      };
    }).filter(data => data.sessions > 0 || data.mistakes > 0);
  };

  // Weekly activity data
  const getWeeklyActivityData = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return weekDays.map(day => {
      const daySessions = filteredSessions.filter(session => {
        if (!session.sessionDate) return false;
        const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
        return isSameDay(sessionDate, day);
      });

      const dayMistakes = filteredEntries.filter(entry => {
        if (!entry.dateRecorded) return false;
        const entryDate = typeof entry.dateRecorded === 'string' ? parseISO(entry.dateRecorded) : entry.dateRecorded;
        return isSameDay(entryDate, day);
      });

      return {
        day: format(day, 'EEE'),
        sessions: daySessions.length,
        mistakes: dayMistakes.length
      };
    });
  };

  // Mistake severity distribution
  const getMistakeSeverityData = () => {
    const severityCount = [1, 2, 3, 4, 5].map(level => ({
      level: `Level ${level}`,
      count: filteredEntries.filter(entry => entry.severityLevel === level).length,
      color: level === 1 ? '#22c55e' : level === 2 ? '#3b82f6' : level === 3 ? '#eab308' : level === 4 ? '#f97316' : '#ef4444'
    }));

    return severityCount.filter(item => item.count > 0);
  };

  // Study consistency score
  const getConsistencyScore = () => {
    if (filteredSessions.length === 0) return 0;
    
    const totalDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const uniqueDays = new Set(
      filteredSessions
        .filter(session => session.sessionDate)
        .map(session => {
          const date = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate!;
          return format(date, 'yyyy-MM-dd');
        })
    ).size;

    return Math.round((uniqueDays / totalDays) * 100);
  };

  const subjectPerformanceData = getSubjectPerformanceData();
  const weeklyActivityData = getWeeklyActivityData();
  const mistakeSeverityData = getMistakeSeverityData();
  const consistencyScore = getConsistencyScore();

  const totalMistakes = filteredEntries.length;
  const resolvedMistakes = filteredEntries.filter(entry => entry.isResolved).length;
  const resolutionRate = totalMistakes > 0 ? Math.round((resolvedMistakes / totalMistakes) * 100) : 0;

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
          LOADING INSIGHTS...
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
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">SineNix</h2>
                <p className="font-paragraph text-xs text-muted-foreground">Insights</p>
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
                { icon: Users, label: "Subjects", path: "/subjects", delay: 0.4 },
                { icon: TrendingUp, label: "Insights", path: "/insights", delay: 0.5, active: true }
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
                { label: "Study Sessions", value: filteredSessions.length, color: "text-secondary" },
                { label: "Resolution Rate", value: `${resolutionRate}%`, color: "text-green-500" },
                { label: "Active Subjects", value: subjectPerformanceData.length, color: "text-blue-500" }
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
                  <h1 className="font-heading text-4xl font-bold uppercase tracking-wide">{"INSIGHTS"}</h1>

                </motion.div>
              </div>
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40 bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Insights Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[100rem] mx-auto px-6 py-8">
        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          key={`metrics-${animationKey}`}
        >
          {[
            {
              title: "Study Sessions",
              value: filteredSessions.length,
              icon: Calendar,
              color: "text-secondary",
              delay: 0
            },
            {
              title: "Resolution Rate",
              value: `${resolutionRate}%`,
              icon: TrendingUp,
              color: "text-secondary",
              delay: 0.1
            },
            {
              title: "Consistency Score",
              value: `${consistencyScore}%`,
              icon: Target,
              color: "text-secondary",
              delay: 0.2
            },
            {
              title: "Active Subjects",
              value: subjectPerformanceData.length,
              icon: BookOpen,
              color: "text-secondary",
              delay: 0.3
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5 + metric.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredCard(metric.title)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`border-gridline transition-all duration-300 h-full flex flex-col ${
                hoveredCard === metric.title ? 'border-secondary shadow-lg shadow-secondary/20' : 'hover:border-secondary/50'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                  <CardTitle className="font-heading text-sm font-medium uppercase tracking-wide">
                    {metric.title}
                  </CardTitle>
                  <motion.div
                    animate={{ 
                      rotate: hoveredCard === metric.title ? 360 : 0,
                      scale: hoveredCard === metric.title ? 1.2 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </motion.div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <motion.div 
                    className="font-heading text-2xl font-bold text-center mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.7 + metric.delay,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {metric.value}
                  </motion.div>
                  <motion.p 
                    className="font-paragraph text-xs text-muted-foreground text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + metric.delay }}
                  >
                    {metric.title === "Study Sessions" ? "In selected period" :
                     metric.title === "Resolution Rate" ? "Mistakes resolved" :
                     metric.title === "Consistency Score" ? "Study frequency" :
                     "With activity"}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          key={`charts-${animationKey}`}
        >
          {/* Subject Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 1.2 }}
                  >
                    <BarChart3 className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Subject Performance
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Sessions and mistake resolution by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformanceData.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subjectPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fontFamily: 'azeret-mono' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fontFamily: 'azeret-mono' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E0E0E0',
                            fontFamily: 'azeret-mono'
                          }} 
                        />
                        <Bar dataKey="sessions" fill="#FF7F50" name="Sessions" />
                        <Bar dataKey="resolved" fill="#22c55e" name="Resolved Mistakes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
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
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="font-paragraph text-muted-foreground">No performance data available</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 1.4 }}
                  >
                    <Calendar className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Weekly Activity
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Study sessions and mistakes by day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12, fontFamily: 'azeret-mono' }}
                      />
                      <YAxis tick={{ fontSize: 12, fontFamily: 'azeret-mono' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E0E0E0',
                          fontFamily: 'azeret-mono'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#FF7F50" 
                        strokeWidth={3}
                        name="Sessions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mistakes" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        name="Mistakes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          key={`widgets-${animationKey}`}
        >
          {/* Mistake Severity Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 2.0 }}
                  >
                    <PieChart className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Mistake Severity
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Distribution of mistake severity levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mistakeSeverityData.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 2.2 }}
                  >
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={mistakeSeverityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          label={({ level, count }) => `${level}: ${count}`}
                        >
                          {mistakeSeverityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E0E0E0',
                            fontFamily: 'azeret-mono'
                          }} 
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="font-paragraph text-muted-foreground">No severity data available</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Consistency */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 2.2 }}
                  >
                    <Target className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Study Consistency
                </CardTitle>
                <CardDescription className="font-paragraph">
                  How regularly you study
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <motion.div 
                    className="font-heading text-4xl font-bold text-secondary mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 2.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {consistencyScore}%
                  </motion.div>
                  <p className="font-paragraph text-sm text-muted-foreground">
                    Consistency Score
                  </p>
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 2.6 }}
                  style={{ transformOrigin: "left" }}
                >
                  <Progress value={consistencyScore} className="h-3 bg-black [&>div]:bg-secondary" />
                </motion.div>
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8 }}
                  >
                    <Badge variant={consistencyScore >= 70 ? 'default' : consistencyScore >= 40 ? 'secondary' : 'destructive'}>
                      {consistencyScore >= 70 ? 'EXCELLENT' : consistencyScore >= 40 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performing Subject */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-gridline hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 2.4 }}
                  >
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Top Performer
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Best performing subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformanceData.length > 0 ? (
                  (() => {
                    const topSubject = subjectPerformanceData.reduce((prev, current) => 
                      (prev.resolutionRate > current.resolutionRate) ? prev : current
                    );
                    
                    return (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.6 }}
                      >
                        <div className="text-center">
                          <motion.h3 
                            className="font-heading text-lg font-semibold"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 2.8 }}
                          >
                            {topSubject.name}
                          </motion.h3>
                          <motion.p 
                            className="font-paragraph text-sm text-muted-foreground"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 3.0 }}
                          >
                            {topSubject.resolutionRate}% Resolution Rate
                          </motion.p>
                        </div>
                        <motion.div 
                          className="grid grid-cols-2 gap-4 text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 3.2 }}
                        >
                          <div>
                            <motion.div 
                              className="font-heading text-xl font-bold text-secondary"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 3.4, type: "spring" }}
                            >
                              {topSubject.sessions}
                            </motion.div>
                            <p className="font-paragraph text-xs text-muted-foreground">Sessions</p>
                          </div>
                          <div>
                            <motion.div 
                              className="font-heading text-xl font-bold text-green-600"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 3.6, type: "spring" }}
                            >
                              {topSubject.resolved}
                            </motion.div>
                            <p className="font-paragraph text-xs text-muted-foreground">Resolved</p>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 3.8 }}
                          style={{ transformOrigin: "left" }}
                        >
                          <Progress value={topSubject.resolutionRate} className="h-2" />
                        </motion.div>
                      </motion.div>
                    );
                  })()
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="font-paragraph text-muted-foreground">No performance data</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Subject Details Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 4.0 }}
          key={`table-${animationKey}`}
        >
          <Card className="border-gridline">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.2 }}
              >
                <CardTitle className="font-heading text-xl uppercase tracking-wide">
                  Detailed Subject Analysis
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Complete breakdown of performance by subject
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {subjectPerformanceData.length > 0 ? (
                <motion.div 
                  className="overflow-x-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.4 }}
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gridline">
                        <th className="text-left py-3 font-heading text-sm uppercase tracking-wide">Subject</th>
                        <th className="text-center py-3 font-heading text-sm uppercase tracking-wide">Sessions</th>
                        <th className="text-center py-3 font-heading text-sm uppercase tracking-wide">Mistakes</th>
                        <th className="text-center py-3 font-heading text-sm uppercase tracking-wide">Resolved</th>
                        <th className="text-center py-3 font-heading text-sm uppercase tracking-wide">Rate</th>
                        <th className="text-center py-3 font-heading text-sm uppercase tracking-wide">Difficulty</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {subjectPerformanceData.map((subject, index) => (
                          <motion.tr 
                            key={index} 
                            className="border-b border-gridline/50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 4.6 + (index * 0.1) }}
                            whileHover={{ 
                              backgroundColor: "rgba(255, 127, 80, 0.05)",
                              transition: { duration: 0.2 }
                            }}
                          >
                            <td className="py-3 font-paragraph font-medium">{subject.name}</td>
                            <td className="text-center py-3 font-paragraph">{subject.sessions}</td>
                            <td className="text-center py-3 font-paragraph">{subject.mistakes}</td>
                            <td className="text-center py-3 font-paragraph text-green-600">{subject.resolved}</td>
                            <td className="text-center py-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 4.8 + (index * 0.1), type: "spring" }}
                              >
                                <Badge variant={subject.resolutionRate >= 70 ? 'default' : 'secondary'}>
                                  {subject.resolutionRate}%
                                </Badge>
                              </motion.div>
                            </td>
                            <td className="text-center py-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 5.0 + (index * 0.1), type: "spring" }}
                              >
                                <Badge variant="outline">
                                  Level {subject.difficulty}
                                </Badge>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.4 }}
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
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <p className="font-paragraph text-muted-foreground">No subject data available for analysis</p>
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