import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, AlertCircle, Menu, X, Home, BarChart3, BookOpen, Users, Settings, ChevronRight as ChevronRightIcon, Target, TrendingUp } from 'lucide-react';
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
import { StudySessions } from '@/entities/studysessions';
import { Subjects } from '@/entities/subjects';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studySessions, setStudySessions] = useState<StudySessions[]>([]);
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [sessionName, setSessionName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [isDeadline, setIsDeadline] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResult, subjectsResult] = await Promise.all([
        BaseCrudService.getAll<StudySessions>('studysessions'),
        BaseCrudService.getAll<Subjects>('subjects')
      ]);

      setStudySessions(sessionsResult.items);
      setSubjects(subjectsResult.items);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName || !sessionDate || !subjectName) return;

    try {
      const newSession: StudySessions = {
        _id: crypto.randomUUID(),
        sessionName,
        sessionDate,
        startTime,
        endTime,
        subjectName,
        isDeadline,
        notes
      };

      await BaseCrudService.create('studysessions', newSession);
      await fetchData();
      
      // Reset form
      setSessionName('');
      setSessionDate('');
      setStartTime('');
      setEndTime('');
      setSubjectName('');
      setIsDeadline(false);
      setNotes('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days for the calendar grid (including previous/next month days)
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Get the first day of the week for the start of the month
  const startOfWeekDate = new Date(startDate);
  startOfWeekDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Get the last day of the week for the end of the month
  const endOfWeekDate = new Date(endDate);
  endOfWeekDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });

  const getSessionsForDate = (date: Date) => {
    return studySessions.filter(session => {
      if (!session.sessionDate) return false;
      const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
      return isSameDay(sessionDate, date);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSessionDate(format(date, 'yyyy-MM-dd'));
    setIsDialogOpen(true);
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
          LOADING CALENDAR...
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
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">SineNix</h2>
                <p className="font-paragraph text-xs text-muted-foreground">Calendar</p>
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
                { icon: Calendar, label: "Calendar", path: "/calendar", delay: 0.2, active: true },
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
                        <ChevronRightIcon className="w-4 h-4 ml-auto" />
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
                { label: "Total Sessions", value: studySessions.length, color: "text-secondary" },
                { label: "This Week", value: studySessions.filter(session => {
                  if (!session.sessionDate) return false;
                  const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
                  const now = new Date();
                  const weekStartDate = startOfWeek(now);
                  const weekEndDate = endOfWeek(now);
                  return sessionDate >= weekStartDate && sessionDate <= weekEndDate;
                }).length, color: "text-green-500" },
                { label: "Deadlines", value: studySessions.filter(session => session.isDeadline).length, color: "text-red-500" }
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
          className="bg-primary text-primary-foreground py-12 px-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-[100rem] mx-auto px-12">
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
                  <h1 className="font-heading text-4xl font-bold uppercase tracking-wide">{"CALENDAR"}</h1>

                </motion.div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-secondary text-black hover:bg-secondary/90">
                      <Plus className="w-5 h-5 mr-2" />
                      ADD SESSION
                    </Button>
                  </motion.div>
                </DialogTrigger>
                {/* ... keep existing dialog content ... */}
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-heading uppercase tracking-wide text-white">Create Study Session</DialogTitle>
                    <DialogDescription className="font-paragraph">
                      Schedule a new study session with details and timing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sessionName" className="font-heading uppercase tracking-wide text-sm text-white">Session Name</Label>
                      <Input
                        id="sessionName"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="e.g., Mathematics Review"
                        className="font-paragraph text-white"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="sessionDate" className="font-heading uppercase tracking-wide text-sm text-white">Date</Label>
                      <Input
                        id="sessionDate"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="font-paragraph text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startTime" className="font-heading uppercase tracking-wide text-sm text-white">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="font-paragraph text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endTime" className="font-heading uppercase tracking-wide text-sm text-white">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="font-paragraph text-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subjectName" className="font-heading uppercase tracking-wide text-sm text-white">Subject</Label>
                      <Select value={subjectName} onValueChange={setSubjectName}>
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDeadline"
                        checked={isDeadline}
                        onCheckedChange={setIsDeadline}
                        className="bg-white data-[state=checked]:bg-white"
                      />
                      <Label htmlFor="isDeadline" className="font-heading uppercase tracking-wide text-sm text-white">
                        Mark as Deadline
                      </Label>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes" className="font-heading uppercase tracking-wide text-sm text-white">Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes or objectives..."
                        className="font-paragraph"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 text-white">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSession} className="bg-secondary text-black hover:bg-secondary/90">
                      Create Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.header>

        {/* Main Calendar Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[100rem] mx-auto px-6 py-8">
        {/* Calendar Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-gridline mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <CardTitle className="font-heading text-2xl uppercase tracking-wide">
                    {format(currentDate, 'MMMM yyyy').toUpperCase()}
                  </CardTitle>
                  <CardDescription className="font-paragraph">
                    Click on any date to schedule a new session
                  </CardDescription>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      TODAY
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <motion.div 
                className="grid grid-cols-7 gap-1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                {/* Day headers */}
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                  <motion.div 
                    key={day} 
                    className="p-2 text-center font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + (index * 0.05) }}
                  >
                    {day}
                  </motion.div>
                ))}
                
                {/* Calendar days */}
                <AnimatePresence>
                  {calendarDays.map((day, index) => {
                    const sessionsForDay = getSessionsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayKey = format(day, 'yyyy-MM-dd');
                    
                    return (
                      <motion.div
                        key={dayKey}
                        className={`
                          min-h-[100px] p-2 border border-gridline cursor-pointer hover:bg-secondary/5 transition-colors
                          ${!isCurrentMonth ? 'opacity-50' : ''}
                          ${isToday ? 'bg-secondary/10 border-secondary' : ''}
                          ${hoveredDay === dayKey ? 'bg-secondary/20 border-secondary' : ''}
                        `}
                        onClick={() => handleDateClick(day)}
                        onHoverStart={() => setHoveredDay(dayKey)}
                        onHoverEnd={() => setHoveredDay(null)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: 1.4 + (index * 0.02),
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div 
                          className={`font-heading text-sm font-semibold mb-1 ${isToday ? 'text-secondary' : ''}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6 + (index * 0.02) }}
                        >
                          {format(day, 'd')}
                        </motion.div>
                        <div className="space-y-1">
                          <AnimatePresence>
                            {sessionsForDay.slice(0, 2).map((session, sessionIndex) => (
                              <motion.div
                                key={session._id}
                                className={`
                                  text-xs p-1 rounded font-paragraph truncate
                                  ${session.isDeadline 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : 'bg-secondary/20 text-secondary-foreground border border-secondary/30'
                                  }
                                `}
                                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                transition={{ 
                                  delay: 1.8 + (index * 0.02) + (sessionIndex * 0.1),
                                  type: "spring"
                                }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="flex items-center gap-1">
                                  {session.isDeadline && (
                                    <motion.div
                                      animate={{ rotate: [0, 10, -10, 0] }}
                                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                    </motion.div>
                                  )}
                                  <span className="truncate">{session.sessionName}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {sessionsForDay.length > 2 && (
                            <motion.div 
                              className="text-xs text-muted-foreground font-paragraph"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.0 + (index * 0.02) }}
                            >
                              +{sessionsForDay.length - 2} more
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
        >
          <Card className="border-gridline">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.4 }}
              >
                <CardTitle className="font-heading text-xl uppercase tracking-wide flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, delay: 2.6 }}
                  >
                    <Clock className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Upcoming Sessions
                </CardTitle>
                <CardDescription className="font-paragraph">
                  Your scheduled study sessions for the next few days
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {studySessions.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                >
                  <AnimatePresence>
                    {studySessions
                      .filter(session => {
                        if (!session.sessionDate) return false;
                        const sessionDate = typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate;
                        return sessionDate >= new Date();
                      })
                      .sort((a, b) => {
                        const dateA = typeof a.sessionDate === 'string' ? parseISO(a.sessionDate!) : a.sessionDate!;
                        const dateB = typeof b.sessionDate === 'string' ? parseISO(b.sessionDate!) : b.sessionDate!;
                        return dateA.getTime() - dateB.getTime();
                      })
                      .slice(0, 5)
                      .map((session, index) => {
                        const sessionDate = session.sessionDate ? 
                          (typeof session.sessionDate === 'string' ? parseISO(session.sessionDate) : session.sessionDate) : 
                          null;
                        
                        return (
                          <motion.div 
                            key={session._id} 
                            className="flex items-center justify-between p-4 border border-gridline rounded-lg hover:border-secondary/50 transition-colors"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: 3.0 + (index * 0.1),
                              type: "spring",
                              stiffness: 100
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              y: -2,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <div className="flex-1">
                              <motion.div 
                                className="flex items-center gap-2 mb-1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 3.2 + (index * 0.1) }}
                              >
                                <h4 className="font-heading font-semibold">{session.sessionName}</h4>
                                {session.isDeadline && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 3.4 + (index * 0.1), type: "spring" }}
                                  >
                                    <Badge variant="destructive" className="text-xs">
                                      DEADLINE
                                    </Badge>
                                  </motion.div>
                                )}
                              </motion.div>
                              <motion.p 
                                className="font-paragraph text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3.6 + (index * 0.1) }}
                              >
                                {session.subjectName} • {sessionDate ? format(sessionDate, 'MMM dd, yyyy') : 'No date'}
                                {session.startTime && session.endTime && (
                                  <span> • {session.startTime} - {session.endTime}</span>
                                )}
                              </motion.p>
                              {session.notes && (
                                <motion.p 
                                  className="font-paragraph text-sm text-muted-foreground mt-1"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  transition={{ delay: 3.8 + (index * 0.1) }}
                                >
                                  {session.notes}
                                </motion.p>
                              )}
                            </div>
                            <motion.div 
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 4.0 + (index * 0.1) }}
                            >
                              {session.isDeadline && (
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                >
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                </motion.div>
                              )}
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <Calendar className="h-5 w-5 text-secondary" />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.8 }}
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
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <motion.p 
                    className="font-paragraph text-muted-foreground mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.0 }}
                  >
                    No study sessions scheduled
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      SCHEDULE FIRST SESSION
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