import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Target, BarChart3, PlusCircle, Gamepad2, Zap, Trophy, Shield } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from '@/components/ui/image';

export default function HomePage() {
  // Create refs for scroll-triggered animations
  const featuresRef = useRef(null);
  const contactRef = useRef(null);
  
  // Track when sections come into view
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const contactInView = useInView(contactRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Gaming Theme */}
      <motion.section 
        className="w-full bg-gradient-to-br from-cyber-dark via-primary to-cyber-gray text-primary-foreground relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-20 w-32 h-32 bg-neon-green/20 rounded-full blur-xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-48 h-48 bg-neon-pink/20 rounded-full blur-xl"
            animate={{ 
              x: [0, -80, 0],
              y: [0, 30, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-blue/10 rounded-full blur-2xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-[120rem] mx-auto px-12 py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <motion.div 
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Gamepad2 className="w-12 h-12 text-neon-green" />
                </motion.div>
                <span className="font-heading text-lg uppercase tracking-wider text-neon-green">
                  LEVEL UP YOUR LEARNING
                </span>
              </motion.div>
              
              <motion.h1 
                className="font-heading text-6xl lg:text-8xl font-black uppercase tracking-wider mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >

                <motion.span
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="block bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent"
                >
                  SINENIX
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="font-paragraph text-lg lg:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                EMBARK ON YOUR ULTIMATE LEARNING ADVENTURE. CONQUER KNOWLEDGE, DEFEAT MISTAKES, AND UNLOCK YOUR POTENTIAL.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button asChild size="lg" className="bg-gradient-to-r from-neon-green to-neon-blue text-cyber-dark hover:from-neon-blue hover:to-neon-green border-2 border-neon-green shadow-lg shadow-neon-green/25">
                    <Link to="/dashboard">
                      <Trophy className="w-5 h-5 mr-2" />
                      START QUEST
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button asChild variant="outline" size="lg" className="border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-cyber-dark shadow-lg shadow-neon-pink/25">
                    <Link to="/subjects">
                      <Shield className="w-5 h-5 mr-2" />
                      EXPLORE REALMS
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >

              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              >
                <motion.div 
                  className="w-96 h-96 relative flex items-center justify-center mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Animated background glow */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-neon-green/20 via-neon-pink/20 to-neon-blue/20 rounded-2xl blur-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.5, 0.8, 0.5],
                      scale: [0.8, 1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      delay: 1.0,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Logo container */}
                  <motion.div 
                    className="relative z-10 w-80 h-80 bg-gradient-to-br from-cyber-dark to-cyber-gray rounded-2xl border-2 border-neon-green/50 shadow-2xl shadow-neon-green/25 flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    {/* Logo shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* SineNix Logo */}
                    <motion.div
                      className="relative z-20"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 1,
                        delay: 1.2,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Image src="/Logo.png" alt="SineNix Logo" width={300} className="w-72 h-72 object-contain drop-shadow-2xl" />
                    </motion.div>
                    
                    {/* Corner accents */}
                    <motion.div 
                      className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-green"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    />
                    <motion.div 
                      className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon-blue"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    />
                    <motion.div 
                      className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon-pink"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.7 }}
                    />
                    <motion.div 
                      className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-purple"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 }}
                    />
                  </motion.div>
                  
                  {/* Floating particles around logo */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-neon-green rounded-full"
                      initial={{ 
                        x: Math.cos((i * Math.PI * 2) / 8) * 200,
                        y: Math.sin((i * Math.PI * 2) / 8) * 200,
                        opacity: 0
                      }}
                      animate={{ 
                        x: Math.cos((i * Math.PI * 2) / 8) * (200 + Math.sin(Date.now() * 0.001 + i) * 20),
                        y: Math.sin((i * Math.PI * 2) / 8) * (200 + Math.cos(Date.now() * 0.001 + i) * 20),
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Features Grid - Gaming Theme */}
      <motion.section 
        ref={featuresRef}
        className="max-w-[100rem] mx-auto px-6 py-20"
        initial={{ opacity: 0, y: 100 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h2 
            className="font-heading text-4xl font-bold text-foreground mb-4 uppercase tracking-wide"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={featuresInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
              GAME MODULES
            </span>
          </motion.h2>
          <motion.p 
            className="font-paragraph text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Choose your path and master each learning module to become the ultimate knowledge champion.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Command Center",
              description: "Monitor your learning stats and track your progress like a pro gamer",
              link: "/dashboard",
              buttonText: "ENTER HQ",
              gradient: "from-neon-green to-neon-blue",
              delay: 0
            },
            {
              icon: Calendar,
              title: "Mission Planner",
              description: "Schedule study raids and manage your learning quests with precision",
              link: "/calendar",
              buttonText: "PLAN RAIDS",
              gradient: "from-neon-pink to-neon-purple",
              delay: 0.1
            },
            {
              icon: BookOpen,
              title: "Error Log",
              description: "Document and analyze your mistakes to level up your skills",
              link: "/logbook",
              buttonText: "VIEW LOGS",
              gradient: "from-neon-blue to-neon-green",
              delay: 0.2
            },
            {
              icon: Target,
              title: "Skill Trees",
              description: "Organize and master different subjects across multiple skill branches",
              link: "/subjects",
              buttonText: "UNLOCK SKILLS",
              gradient: "from-neon-purple to-neon-pink",
              delay: 0.3
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={featuresInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.0 + feature.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <Card className="border-2 border-cyber-light hover:border-neon-green transition-all duration-300 bg-card/50 backdrop-blur-sm h-full group">
                <CardHeader className="text-center">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 relative`}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={featuresInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 1.2 + feature.delay,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-cyber-dark" />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 rounded-lg"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.4 + feature.delay }}
                  >
                    <CardTitle className="font-heading text-xl uppercase tracking-wide text-foreground group-hover:text-neon-green transition-colors">{feature.title}</CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.6 + feature.delay }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild className={`w-full bg-gradient-to-r ${feature.gradient} text-cyber-dark hover:shadow-lg hover:shadow-neon-green/25 border-2 border-transparent hover:border-neon-green`}>
                      <Link to={feature.link}>{feature.buttonText}</Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
      {/* Developer Contact Information */}
      <motion.section 
        ref={contactRef}
        className="bg-gradient-to-r from-cyber-dark via-cyber-gray to-cyber-dark py-20 relative overflow-hidden"
        initial={{ opacity: 0, y: 100 }}
        animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Enhanced Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(0,255,136,0.3)_25%,rgba(0,255,136,0.3)_26%,transparent_27%,transparent_74%,rgba(0,255,136,0.3)_75%,rgba(0,255,136,0.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"
            animate={{ 
              x: [0, 50, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,0,128,0.3)_25%,rgba(255,0,128,0.3)_26%,transparent_27%,transparent_74%,rgba(255,0,128,0.3)_75%,rgba(255,0,128,0.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"
            animate={{ 
              y: [0, -50, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-neon-green/30 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-[100rem] mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h2 
              className="font-heading text-3xl font-bold text-foreground mb-4 uppercase tracking-wide"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={contactInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <motion.span 
                className="bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                DEVELOPER CONTACT
              </motion.span>
            </motion.h2>
            <motion.p 
              className="font-paragraph text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              Get in touch with the creator of SineNix
            </motion.p>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <motion.div 
              className="bg-card/50 backdrop-blur-sm border border-gridline rounded-lg p-8 relative overflow-hidden"
              whileHover={{
                boxShadow: "0 25px 50px -12px rgba(0, 255, 136, 0.25)",
                borderColor: "rgba(0, 255, 136, 0.5)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  background: [
                    "linear-gradient(0deg, transparent, rgba(0,255,136,0.1), transparent)",
                    "linear-gradient(90deg, transparent, rgba(255,0,128,0.1), transparent)",
                    "linear-gradient(180deg, transparent, rgba(0,170,255,0.1), transparent)",
                    "linear-gradient(270deg, transparent, rgba(0,255,136,0.1), transparent)"
                  ]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Developer Info */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={contactInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.h3 
                      className="font-heading text-2xl font-bold text-foreground mb-2 uppercase tracking-wide"
                      initial={{ opacity: 0, y: 20 }}
                      animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 1.4 }}
                    >
                      <motion.span 
                        className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent"
                        animate={{ 
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{ backgroundSize: "200% 200%" }}
                      >
                        Pannarat Wattanakraimet
                      </motion.span>
                    </motion.h3>
                    <motion.p 
                      className="font-paragraph text-muted-foreground"
                      initial={{ opacity: 0, y: 20 }}
                      animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 1.6 }}
                      whileHover={{ 
                        color: "#00ff88",
                        transition: { duration: 0.2 }
                      }}
                    >
                      Developer & Student
                    </motion.p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={contactInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 2.0 }}
                  >
                    {[
                      { icon: "✉️", label: "Email", value: "wattanakraimetpannarat@gmail.com", gradient: "from-neon-green to-neon-blue", delay: 0 },
                      { icon: "💻", label: "GitHub", value: "github.com/Qnazter", gradient: "from-neon-pink to-neon-purple", delay: 0.1 },
                      { icon: "🌐", label: "Portfolio", value: "pannarat-portfolio.vercel.app", gradient: "from-neon-blue to-neon-green", delay: 0.2 },
                      { icon: "📷", label: "Instagram", value: "instagram.com/panwptr", gradient: "from-neon-purple to-neon-pink", delay: 0.3 }
                    ].map((contact, index) => (
                      <motion.div 
                        key={contact.label}
                        className="flex items-center gap-3 group cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={contactInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 2.2 + contact.delay }}
                        whileHover={{ 
                          x: 10,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div 
                          className={`w-8 h-8 bg-gradient-to-br ${contact.gradient} rounded-lg flex items-center justify-center relative overflow-hidden`}
                          whileHover={{ 
                            scale: 1.2,
                            rotate: 360,
                            transition: { duration: 0.5 }
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut"
                            }}
                          />
                          <span className="text-cyber-dark font-heading font-bold text-sm relative z-10">{contact.icon}</span>
                        </motion.div>
                        <div>
                          <motion.p 
                            className="font-heading text-sm uppercase tracking-wide text-muted-foreground group-hover:text-secondary transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            {contact.label}
                          </motion.p>
                          <motion.p 
                            className="font-paragraph text-foreground group-hover:text-neon-green transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            {contact.value}
                          </motion.p>
                        </div>
                        
                        {/* Hover particles */}
                        <motion.div
                          className="absolute pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-1 h-1 bg-gradient-to-r ${contact.gradient} rounded-full`}
                              initial={{ 
                                x: 0,
                                y: 0,
                                scale: 0
                              }}
                              animate={{ 
                                x: Math.random() * 60 - 30,
                                y: Math.random() * 60 - 30,
                                scale: [0, 1, 0]
                              }}
                              transition={{ 
                                duration: 1,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Contact Form */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: 30 }}
                  animate={contactInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <motion.h4 
                    className="font-heading text-lg font-semibold text-foreground uppercase tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.6 }}
                    whileHover={{ 
                      scale: 1.05,
                      color: "#00ff88",
                      transition: { duration: 0.2 }
                    }}
                  >
                    Send a Message
                  </motion.h4>
                  
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={contactInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    {[
                      { label: "Your Name", type: "text", placeholder: "Enter your name", delay: 0 },
                      { label: "Email Address", type: "email", placeholder: "your.email@example.com", delay: 0.1 },
                      { label: "Message", type: "textarea", placeholder: "Tell me about your experience with SineNix...", delay: 0.2 }
                    ].map((field, index) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 2.0 + field.delay }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <motion.label 
                          className="font-heading text-sm uppercase tracking-wide text-muted-foreground block mb-2"
                          whileHover={{ color: "#00ff88" }}
                        >
                          {field.label}
                        </motion.label>
                        {field.type === "textarea" ? (
                          <motion.textarea 
                            rows={4}
                            className="w-full px-4 py-2 bg-background border border-gridline rounded-lg font-paragraph text-foreground focus:border-secondary focus:outline-none transition-all duration-300 resize-none"
                            placeholder={field.placeholder}
                            whileFocus={{ 
                              scale: 1.02,
                              boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                              borderColor: "#00ff88"
                            }}
                          />
                        ) : (
                          <motion.input 
                            type={field.type}
                            className="w-full px-4 py-2 bg-background border border-gridline rounded-lg font-paragraph text-foreground focus:border-secondary focus:outline-none transition-all duration-300"
                            placeholder={field.placeholder}
                            whileFocus={{ 
                              scale: 1.02,
                              boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                              borderColor: "#00ff88"
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                    
                    <motion.button
                      className="w-full bg-gradient-to-r from-neon-green to-neon-blue text-cyber-dark font-heading font-bold uppercase tracking-wide py-3 rounded-lg relative overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 2.4 }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(0, 255, 136, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Button shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Button pulse effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <span className="relative z-10">Send Message</span>
                      
                      {/* Click particles */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileTap={{ opacity: 1 }}
                      >
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            initial={{ 
                              x: "50%",
                              y: "50%",
                              scale: 0
                            }}
                            animate={{ 
                              x: `${50 + (Math.random() - 0.5) * 200}%`,
                              y: `${50 + (Math.random() - 0.5) * 200}%`,
                              scale: [0, 1, 0]
                            }}
                            transition={{ 
                              duration: 0.6,
                              delay: i * 0.05
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}