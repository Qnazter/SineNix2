import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Target, TrendingUp, Clock, AlertCircle, CheckCircle, Menu, X, Home, BarChart3, Users, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { StudySessions } from '@/entities/studysessions';
import { LogbookEntries } from '@/entities/logbookentries';
import { Subjects } from '@/entities/subjects';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function DashboardPage() {
  const [studySessions, setStudySessions] = useState<StudySessions[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntries[]>([]);
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingSessions = studySessions
    .filter(session => {
      if (!session.sessionDate) return false;
      const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
      return sessionDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = typeof a.sessionDate === 'string' ? parseISO(a.sessionDate) : a.sessionDate!;
      const dateB = typeof b.sessionDate === 'string' ? parseISO(b.sessionDate) : b.sessionDate!;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const recentMistakes = logbookEntries
    .sort((a, b) => {
      const dateA = a.dateRecorded ? (typeof a.dateRecorded === 'string' ? parseISO(a.dateRecorded) : a.dateRecorded) : new Date(0);
      const dateB = b.dateRecorded ? (typeof b.dateRecorded === 'string' ? parseISO(b.dateRecorded) : b.dateRecorded) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);

  const activeSubjects = subjects.filter(subject => subject.isActive);
  const totalMistakes = logbookEntries.length;
  const resolvedMistakes = logbookEntries.filter(entry => entry.isResolved).length;
  const progressPercentage = totalMistakes > 0 ? (resolvedMistakes / totalMistakes) * 100 : 0;

  const getSessionStatus = (session: StudySessions) => {
    if (!session.sessionDate) return 'scheduled';
    const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
    
    if (isToday(sessionDate)) return 'today';
    if (isTomorrow(sessionDate)) return 'tomorrow';
    return 'upcoming';
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
          LOADING DASHBOARD...
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
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Target className="w-8 h-8 text-secondary" />
              </motion.div>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">SineNix</h2>
                <p className="font-paragraph text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
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
                { icon: BarChart3, label: "Dashboard", path: "/dashboard", delay: 0.1, active: true },
                { icon: Calendar, label: "Calendar", path: "/calendar", delay: 0.2 },
                { icon: BookOpen, label: "Logbook", path: "/logbook", delay: 0.3 },
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
                { label: "Today's Sessions", value: upcomingSessions.filter(session => {
                  if (!session.sessionDate) return false;
                  const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
                  return isToday(sessionDate);
                }).length, color: "text-secondary" },
                { label: "Pending Mistakes", value: logbookEntries.filter(entry => !entry.isResolved).length, color: "text-yellow-500" },
                { label: "Active Subjects", value: activeSubjects.length, color: "text-green-500" }
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  type="button"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-6 h-6 pointer-events-none" />
                </motion.button>
                
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="font-heading text-4xl font-bold uppercase tracking-wide">{"DASHBOARD"}</h1>

                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[100rem] mx-auto px-6 py-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            {
              title: "Total Sessions",
              value: studySessions.length,
              icon: Calendar,
              description: "Scheduled study sessions",
              color: "text-secondary",
              bgGradient: "from-secondary/10 to-secondary/5",
              delay: 0
            },
            {
              title: "Active Subjects",
              value: activeSubjects.length,
              icon: Target,
              description: "Currently studying",
              color: "text-neon-blue",
              bgGradient: "from-neon-blue/10 to-neon-blue/5",
              delay: 0.1
            },
            {
              title: "Logged Mistakes",
              value: totalMistakes,
              icon: BookOpen,
              description: "Learning opportunities",
              color: "text-neon-pink",
              bgGradient: "from-neon-pink/10 to-neon-pink/5",
              delay: 0.2
            },
            {
              title: "Resolution Rate",
              value: `${Math.round(progressPercentage)}%`,
              icon: TrendingUp,
              description: "Mistakes resolved",
              color: "text-neon-green",
              bgGradient: "from-neon-green/10 to-neon-green/5",
              delay: 0.3
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5 + stat.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredCard(stat.title)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`border-gridline transition-all duration-500 cursor-pointer relative overflow-hidden ${
                hoveredCard === stat.title 
                  ? 'border-secondary shadow-2xl shadow-secondary/25 bg-gradient-to-br ' + stat.bgGradient
                  : 'hover:border-secondary/50 hover:shadow-lg'
              }`}>
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ 
                    x: hoveredCard === stat.title ? '100%' : '-100%'
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + stat.delay }}
                  >
                    <CardTitle className="font-heading text-sm font-medium uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.8 + stat.delay,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.3,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color} drop-shadow-lg`} />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="font-heading text-2xl font-bold"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.9 + stat.delay,
                      type: "spring",
                      stiffness: 150,
                      damping: 10
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <motion.p 
                    className="font-paragraph text-xs text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + stat.delay }}
                  >
                    {stat.description}
                  </motion.p>
                  
                  {/* Floating particles effect on hover */}
                  <AnimatePresence>
                    {hoveredCard === stat.title && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 ${stat.color.replace('text-', 'bg-')} rounded-full`}
                            initial={{ 
                              opacity: 0,
                              x: Math.random() * 100,
                              y: Math.random() * 100,
                              scale: 0
                            }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              y: [Math.random() * 100, Math.random() * 50],
                              scale: [0, 1, 0]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              duration: 2,
                              delay: i * 0.1,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredCard('upcoming-sessions')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <Card className={`border-gridline transition-all duration-500 relative overflow-hidden ${
              hoveredCard === 'upcoming-sessions' 
                ? 'border-secondary shadow-2xl shadow-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent'
                : 'hover:border-secondary/50'
            }`}>
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: hoveredCard === 'upcoming-sessions' 
                    ? ['0 0 0 1px rgba(255, 127, 80, 0.3)', '0 0 20px 1px rgba(255, 127, 80, 0.1)', '0 0 0 1px rgba(255, 127, 80, 0.3)']
                    : '0 0 0 1px transparent'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <CardHeader className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: hoveredCard === 'upcoming-sessions' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.5 }
                      }}
                    >
                      <Clock className="h-5 w-5 text-secondary drop-shadow-lg" />
                    </motion.div>
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription className="font-paragraph">
                    Your next scheduled study sessions
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                {upcomingSessions.length > 0 ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <AnimatePresence>
                      {upcomingSessions.map((session, index) => {
                        const status = getSessionStatus(session);
                        const sessionDate = session.sessionDate ? 
                          (typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate) : 
                          null;
                        
                        return (
                          <motion.div 
                            key={session._id} 
                            className="flex items-center justify-between p-3 border border-gridline rounded-lg hover:border-secondary/50 transition-all duration-300 cursor-pointer group"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 2.0 + (index * 0.1),
                              type: "spring",
                              stiffness: 100
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div>
                              <motion.h4 
                                className="font-heading font-semibold group-hover:text-secondary transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.2 + (index * 0.1) }}
                              >
                                {session.sessionName}
                              </motion.h4>
                              <motion.p 
                                className="font-paragraph text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.3 + (index * 0.1) }}
                              >
                                {session.subjectName} • {sessionDate ? format(sessionDate, 'MMM dd, yyyy') : 'No date'}
                              </motion.p>
                            </div>
                            <div className="flex items-center gap-2">
                              <AnimatePresence>
                                {session.isDeadline && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                                    animate={{ 
                                      opacity: 1, 
                                      scale: 1, 
                                      rotate: [0, 10, -10, 0] 
                                    }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ 
                                      scale: { duration: 0.3, delay: 2.4 + (index * 0.1) },
                                      rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
                                    }}
                                  >
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  delay: 2.5 + (index * 0.1),
                                  type: "spring",
                                  stiffness: 200
                                }}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Badge 
                                  variant={status === 'today' ? 'default' : 'secondary'}
                                  className={status === 'today' ? 'animate-pulse' : ''}
                                >
                                  {status === 'today' ? 'TODAY' : status === 'tomorrow' ? 'TOMORROW' : 'UPCOMING'}
                                </Badge>
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300">
                        <Link to="/calendar">VIEW ALL SESSIONS</Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <motion.p 
                      className="font-paragraph text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.0 }}
                    >
                      No upcoming sessions scheduled
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button asChild className="mt-4 bg-secondary text-black hover:bg-secondary/90">
                        <Link to="/calendar">SCHEDULE SESSION</Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Mistakes */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredCard('recent-mistakes')}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <Card className={`border-gridline transition-all duration-500 relative overflow-hidden ${
              hoveredCard === 'recent-mistakes' 
                ? 'border-secondary shadow-2xl shadow-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent'
                : 'hover:border-secondary/50'
            }`}>
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: hoveredCard === 'recent-mistakes' 
                    ? ['0 0 0 1px rgba(255, 127, 80, 0.3)', '0 0 20px 1px rgba(255, 127, 80, 0.1)', '0 0 0 1px rgba(255, 127, 80, 0.3)']
                    : '0 0 0 1px transparent'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <CardHeader className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: hoveredCard === 'recent-mistakes' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.5 }
                      }}
                    >
                      <BookOpen className="h-5 w-5 text-secondary drop-shadow-lg" />
                    </motion.div>
                    Recent Mistakes
                  </CardTitle>
                  <CardDescription className="font-paragraph">
                    Latest learning opportunities logged
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                {recentMistakes.length > 0 ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.0 }}
                  >
                    <AnimatePresence>
                      {recentMistakes.map((mistake, index) => {
                        const mistakeDate = mistake.dateRecorded ? 
                          (typeof mistake.dateRecorded === 'string' ? parseISO(mistake.dateRecorded) : mistake.dateRecorded) : 
                          null;
                        
                        return (
                          <motion.div 
                            key={mistake._id} 
                            className="flex items-start justify-between p-3 border border-gridline rounded-lg hover:border-secondary/50 transition-all duration-300 cursor-pointer group"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 2.2 + (index * 0.1),
                              type: "spring",
                              stiffness: 100
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex-1">
                              <motion.h4 
                                className="font-heading font-semibold text-sm mb-1 group-hover:text-secondary transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.4 + (index * 0.1) }}
                              >
                                {mistake.relatedSubject}
                              </motion.h4>
                              <motion.p 
                                className="font-paragraph text-sm text-muted-foreground mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5 + (index * 0.1) }}
                              >
                                {mistake.mistakeDescription}
                              </motion.p>
                              <motion.p 
                                className="font-paragraph text-xs text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.6 + (index * 0.1) }}
                              >
                                {mistakeDate ? format(mistakeDate, 'MMM dd, yyyy') : 'No date'}
                              </motion.p>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.div
                                initial={{ opacity: 0, scale: 0, rotate: 180 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1, 
                                  rotate: mistake.isResolved ? [0, 360] : [0, 10, -10, 0]
                                }}
                                transition={{ 
                                  scale: { duration: 0.3, delay: 2.7 + (index * 0.1) },
                                  rotate: mistake.isResolved 
                                    ? { duration: 0.8, delay: 2.8 + (index * 0.1) }
                                    : { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
                                }}
                              >
                                {mistake.isResolved ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  delay: 2.8 + (index * 0.1),
                                  type: "spring",
                                  stiffness: 200
                                }}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Badge 
                                  variant={mistake.isResolved ? 'default' : 'secondary'}
                                  className={mistake.isResolved ? 'bg-green-100 text-green-800' : 'animate-pulse'}
                                >
                                  {mistake.isResolved ? 'RESOLVED' : 'PENDING'}
                                </Badge>
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild className="w-full bg-secondary text-black hover:bg-secondary/90 transition-all duration-300">
                        <Link to="/logbook">VIEW ALL ENTRIES</Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <motion.p 
                      className="font-paragraph text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                    >
                      No mistakes logged yet
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button asChild className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        <Link to="/logbook">ADD ENTRY</Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
          whileHover={{ scale: 1.01 }}
          onHoverStart={() => setHoveredCard('progress-overview')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <Card className={`border-gridline mt-8 transition-all duration-500 relative overflow-hidden ${
            hoveredCard === 'progress-overview' 
              ? 'border-secondary shadow-2xl shadow-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent'
              : 'hover:border-secondary/50'
          }`}>
            {/* Animated progress bar background */}
            <motion.div
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-secondary via-neon-green to-neon-blue"
              initial={{ width: '0%' }}
              animate={{ width: hoveredCard === 'progress-overview' ? '100%' : '0%' }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            <CardHeader className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.4 }}
              >
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: hoveredCard === 'progress-overview' ? [1, 1.3, 1] : 1
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 0.5 }
                    }}
                  >
                    <TrendingUp className="h-5 w-5 text-secondary drop-shadow-lg" />
                  </motion.div>
                  Learning Progress
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Overall mistake resolution and learning improvement
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.6 }}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <motion.span 
                      className="font-paragraph text-sm font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.8 }}
                    >
                      Mistake Resolution Rate
                    </motion.span>
                    <motion.span 
                      className="font-heading text-sm font-bold"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 4.0,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {Math.round(progressPercentage)}%
                    </motion.span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 4.2, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  >
                    <Progress value={progressPercentage} className="h-2 bg-black [&>div]:bg-secondary" />
                  </motion.div>
                  
                  {/* Animated progress indicator */}
                  <motion.div
                    className="relative mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 5.7 }}
                  >
                    <motion.div
                      className="absolute h-4 w-4 bg-secondary rounded-full shadow-lg"
                      initial={{ left: '0%' }}
                      animate={{ left: `${progressPercentage}%` }}
                      transition={{ duration: 2, delay: 4.2, ease: "easeOut" }}
                      style={{ transform: 'translateX(-50%)' }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-secondary rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="grid grid-cols-2 gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.4 }}
                >
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-green-50 border border-green-200"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgb(240, 253, 244)",
                      transition: { duration: 0.2 }
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 4.6, type: "spring" }}
                  >
                    <motion.div 
                      className="font-heading text-2xl font-bold text-secondary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 4.8,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {resolvedMistakes}
                    </motion.div>
                    <motion.p 
                      className="font-paragraph text-sm text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 5.0 }}
                    >
                      Resolved
                    </motion.p>
                    
                    {/* Success particles */}
                    <AnimatePresence>
                      {hoveredCard === 'progress-overview' && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-green-500 rounded-full"
                              initial={{ 
                                opacity: 0,
                                x: Math.random() * 50,
                                y: Math.random() * 50,
                                scale: 0
                              }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                y: [Math.random() * 50, Math.random() * 20],
                                scale: [0, 1, 0]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ 
                                duration: 2,
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatDelay: 1
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgb(254, 252, 232)",
                      transition: { duration: 0.2 }
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 4.8, type: "spring" }}
                  >
                    <motion.div 
                      className="font-heading text-2xl font-bold text-yellow-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 5.0,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {totalMistakes - resolvedMistakes}
                    </motion.div>
                    <motion.p 
                      className="font-paragraph text-sm text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 5.2 }}
                    >
                      Pending
                    </motion.p>
                    
                    {/* Pending pulse effect */}
                    <AnimatePresence>
                      {(totalMistakes - resolvedMistakes) > 0 && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2 border-yellow-400"
                          animate={{ 
                            opacity: [0, 0.5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 5.4 }}
        >
          {[
            {
              to: "/calendar",
              icon: Calendar,
              text: "Schedule Session",
              description: "Plan your next study session",
              gradient: "from-secondary to-neon-green",
              delay: 0
            },
            {
              to: "/logbook", 
              icon: BookOpen,
              text: "Log Mistake",
              description: "Record a learning opportunity",
              gradient: "from-neon-pink to-neon-purple",
              delay: 0.1
            },
            {
              to: "/insights",
              icon: TrendingUp, 
              text: "View Insights",
              description: "Analyze your progress",
              gradient: "from-neon-blue to-secondary",
              delay: 0.2
            }
          ].map((action, index) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 5.6 + action.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredCard(`action-${index}`)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Button 
                asChild 
                size="lg" 
                className={`h-20 bg-gradient-to-r ${action.gradient} text-cyber-dark hover:shadow-2xl hover:shadow-secondary/25 border-2 border-transparent hover:border-secondary transition-all duration-500 relative overflow-hidden group`}
              >
                <Link to={action.to} className="flex flex-col items-center gap-2 relative z-10">
                  {/* Animated background shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ 
                      x: hoveredCard === `action-${index}` ? '100%' : '-100%'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 5.8 + action.delay,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.2,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <action.icon className="h-6 w-6 drop-shadow-lg" />
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 6.0 + action.delay }}
                  >
                    <span className="font-heading uppercase tracking-wide text-sm font-bold">
                      {action.text}
                    </span>
                    <motion.p 
                      className="text-xs opacity-80 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      transition={{ delay: 6.2 + action.delay }}
                    >
                      {action.description}
                    </motion.p>
                  </motion.div>
                  
                  {/* Floating action particles */}
                  <AnimatePresence>
                    {hoveredCard === `action-${index}` && (
                      <>
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            initial={{ 
                              opacity: 0,
                              x: Math.random() * 100,
                              y: Math.random() * 80,
                              scale: 0
                            }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              y: [Math.random() * 80, Math.random() * 40],
                              scale: [0, 1, 0]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              duration: 1.5,
                              delay: i * 0.1,
                              repeat: Infinity,
                              repeatDelay: 0.5
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}