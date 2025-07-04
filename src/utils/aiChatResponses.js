const timeBasedGreetings = {
  morning: "Good morning! Let's make today productive.",
  afternoon: "Good afternoon! How can I help optimize your day?",
  evening: "Good evening! Let's plan for tomorrow or reflect on today."
};

const taskSuggestionTemplates = [
  "Break down your project into smaller, manageable tasks",
  "Start with a quick 15-minute task to build momentum",
  "Focus on your most important task first",
  "Batch similar tasks together for efficiency",
  "Set a specific time limit for each task",
  "Take a 5-minute break between tasks",
  "Review your goals before starting",
  "Eliminate distractions from your workspace"
];

const planningPrompts = [
  "What are your top 3 priorities today?",
  "How much time do you have available?",
  "What's your energy level right now?",
  "Any deadlines approaching?",
  "What would make today feel successful?"
];

// Interactive AI functions that can modify data
export const generateAIResponse = (userPrompt, todos, onAddTodo, onToggleTodo, onDeleteTodo, onStartPomodoro) => {
  const prompt = userPrompt.toLowerCase();
  const now = new Date();
  const hour = now.getHours();
  const incompleteTasks = todos.filter(todo => !todo.completed);
  const highPriorityTasks = incompleteTasks.filter(todo => todo.priority === 'high');
  const completedToday = todos.filter(todo => 
    todo.completed && 
    todo.completedAt && 
    new Date(todo.completedAt).toDateString() === now.toDateString()
  );
  
  let timeOfDay;
  if (hour < 12) timeOfDay = 'morning';
  else if (hour < 17) timeOfDay = 'afternoon';
  else timeOfDay = 'evening';

  // Interactive commands - Add task
  if (prompt.includes('add task') || prompt.includes('create task') || prompt.includes('new task')) {
    const taskMatch = prompt.match(/(?:add|create|new) task[:\s]+(.+)/i);
    if (taskMatch) {
      const taskText = taskMatch[1].trim();
      const priority = prompt.includes('high') ? 'high' : prompt.includes('low') ? 'low' : 'medium';
      
      if (onAddTodo) {
        onAddTodo({
          text: taskText,
          completed: false,
          priority: priority,
          category: 'AI Suggested',
          estimatedTime: 30
        });
      }
      
      return {
        content: `✅ I've added "${taskText}" to your todo list with ${priority} priority! Ready to tackle it?`,
        suggestions: [
          "Start working on this task",
          "Add another task",
          "Show me my priorities",
          "Start a Pomodoro session"
        ],
        action: 'task_added'
      };
    }
  }

  // Interactive commands - Complete task
  if (prompt.includes('complete') || prompt.includes('done') || prompt.includes('finished')) {
    const taskMatch = prompt.match(/(?:complete|done|finished)\s+(.+)/i);
    if (taskMatch && onToggleTodo) {
      const taskText = taskMatch[1].trim().toLowerCase();
      const matchingTask = incompleteTasks.find(todo => 
        todo.text.toLowerCase().includes(taskText) || taskText.includes(todo.text.toLowerCase())
      );
      
      if (matchingTask) {
        onToggleTodo(matchingTask.id);
        return {
          content: `🎉 Awesome! I've marked "${matchingTask.text}" as completed. You're making great progress!`,
          suggestions: [
            "What should I work on next?",
            "Show my progress",
            "Add another task",
            "Take a break"
          ],
          action: 'task_completed'
        };
      }
    }
  }

  // Interactive commands - Start Pomodoro
  if (prompt.includes('start pomodoro') || prompt.includes('focus session') || prompt.includes('start timer')) {
    if (incompleteTasks.length > 0 && onStartPomodoro) {
      const taskToFocus = highPriorityTasks[0] || incompleteTasks[0];
      onStartPomodoro(taskToFocus.id);
      
      return {
        content: `🍅 Starting a Pomodoro session for "${taskToFocus.text}"! Let's focus for 25 minutes. I'll be here when you're done!`,
        suggestions: [
          "Pause the timer",
          "Switch to another task",
          "I need motivation",
          "Take a break"
        ],
        action: 'pomodoro_started'
      };
    } else {
      return {
        content: `You don't have any active tasks to focus on. Would you like to add some tasks first?`,
        suggestions: [
          "Add a new task",
          "Plan my day",
          "Set some goals",
          "Review completed tasks"
        ]
      };
    }
  }

  // Smart analysis of current situation
  if (prompt.includes('analyze') || prompt.includes('status') || prompt.includes('how am i doing')) {
    const totalTasks = todos.length;
    const completionRate = totalTasks > 0 ? Math.round((todos.filter(t => t.completed).length / totalTasks) * 100) : 0;
    const todayCompletionRate = completedToday.length;
    const avgTaskTime = incompleteTasks.reduce((sum, task) => sum + (task.estimatedTime || 30), 0) / Math.max(incompleteTasks.length, 1);
    
    let analysis = `📊 **Your Productivity Analysis:**\n\n`;
    analysis += `• Overall completion rate: ${completionRate}%\n`;
    analysis += `• Tasks completed today: ${todayCompletionRate}\n`;
    analysis += `• Remaining tasks: ${incompleteTasks.length}\n`;
    analysis += `• High priority tasks: ${highPriorityTasks.length}\n`;
    analysis += `• Average task time: ${Math.round(avgTaskTime)} minutes\n\n`;
    
    if (completionRate > 80) {
      analysis += `🌟 Excellent work! You're highly productive!`;
    } else if (completionRate > 60) {
      analysis += `👍 Good progress! Keep up the momentum!`;
    } else if (completionRate > 40) {
      analysis += `💪 You're making progress. Consider focusing on fewer, high-impact tasks.`;
    } else {
      analysis += `🎯 Let's get focused! I recommend starting with your highest priority task.`;
    }

    return {
      content: analysis,
      suggestions: [
        "What should I focus on?",
        "Help me prioritize",
        "Start a Pomodoro session",
        "Add more tasks"
      ],
      action: 'analysis_provided'
    };
  }

  // Smart task recommendations based on current context
  if (prompt.includes('what should i do') || prompt.includes('what to do') || prompt.includes('recommend') || prompt.includes('suggest')) {
    if (incompleteTasks.length === 0) {
      return {
        content: "🎉 Amazing! You've completed all your tasks! Here's what I suggest:\n\n• Take a well-deserved break\n• Plan tomorrow's priorities\n• Reflect on today's achievements\n• Set new goals for the week\n• Learn something new",
        suggestions: [
          "Plan tomorrow",
          "Add weekly goals",
          "Celebrate achievements",
          "Take a break"
        ]
      };
    }

    // Smart prioritization based on time of day and task characteristics
    let recommendedTask;
    let reasoning;

    if (timeOfDay === 'morning' && highPriorityTasks.length > 0) {
      recommendedTask = highPriorityTasks[0];
      reasoning = "Morning is perfect for tackling your most important work when your energy is highest.";
    } else if (timeOfDay === 'afternoon') {
      const mediumTasks = incompleteTasks.filter(t => t.priority === 'medium');
      recommendedTask = mediumTasks[0] || incompleteTasks[0];
      reasoning = "Afternoon is great for medium-priority tasks and collaborative work.";
    } else {
      const quickTasks = incompleteTasks.filter(t => (t.estimatedTime || 30) <= 30);
      recommendedTask = quickTasks[0] || incompleteTasks[0];
      reasoning = "Evening is perfect for quick tasks and planning for tomorrow.";
    }

    return {
      content: `🎯 **My Recommendation:**\n\nWork on: "${recommendedTask.text}"\n\n**Why:** ${reasoning}\n\n**Priority:** ${recommendedTask.priority}\n**Estimated time:** ${recommendedTask.estimatedTime || 30} minutes\n\nWould you like me to start a Pomodoro timer for this task?`,
      suggestions: [
        "Start Pomodoro for this task",
        "Show me other options",
        "I'll do something else",
        "Help me break this down"
      ],
      action: 'recommendation_provided'
    };
  }

  // Task-related queries with smart suggestions
  if (prompt.includes('task') || prompt.includes('priority')) {
    if (incompleteTasks.length === 0) {
      return {
        content: "You don't have any active tasks! Let's add some goals to work towards. What would you like to accomplish?",
        suggestions: [
          "Add a work task",
          "Add a personal goal",
          "Plan my week",
          "Set learning objectives"
        ]
      };
    }

    const taskBreakdown = {
      high: highPriorityTasks.length,
      medium: incompleteTasks.filter(t => t.priority === 'medium').length,
      low: incompleteTasks.filter(t => t.priority === 'low').length
    };

    let content = `📋 **Your Current Tasks:**\n\n`;
    content += `🔴 High Priority: ${taskBreakdown.high} tasks\n`;
    content += `🟡 Medium Priority: ${taskBreakdown.medium} tasks\n`;
    content += `🟢 Low Priority: ${taskBreakdown.low} tasks\n\n`;

    if (highPriorityTasks.length > 3) {
      content += `⚠️ You have many high-priority tasks. Consider if some can be rescheduled or delegated.`;
    } else if (highPriorityTasks.length > 0) {
      content += `💡 Focus on your ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''} first.`;
    } else {
      content += `✨ No urgent tasks! Great time to work on medium-priority items or plan ahead.`;
    }

    return {
      content,
      suggestions: [
        "Start with highest priority",
        "Show me quick tasks",
        "Help me prioritize",
        "Start a focus session"
      ]
    };
  }

  // Productivity queries with personalized advice
  if (prompt.includes('productive') || prompt.includes('productivity') || prompt.includes('tips') || 
      prompt.includes('focus') || prompt.includes('efficient') || prompt.includes('efficiency') ||
      prompt.includes('how to be') || prompt.includes('help me be') || prompt.includes('advice')) {
    
    const completionRate = todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0;
    const personalizedTips = [];

    // Personalized tips based on user's current situation
    if (highPriorityTasks.length > 3) {
      personalizedTips.push("🎯 You have many high-priority tasks. Try the 'Rule of 3' - focus on just 3 important things today.");
    }
    
    if (incompleteTasks.some(t => (t.estimatedTime || 30) > 60)) {
      personalizedTips.push("✂️ Break large tasks into smaller 25-30 minute chunks for better focus.");
    }
    
    if (completedToday.length === 0 && hour > 10) {
      personalizedTips.push("🚀 Start with a quick win! Complete one small task to build momentum.");
    }

    let content = `Here are productivity tips tailored for you:\n\n`;
    
    if (personalizedTips.length > 0) {
      content += `**Personalized for your situation:**\n${personalizedTips.map(tip => `• ${tip}`).join('\n')}\n\n`;
    }
    
    content += `**Universal productivity strategies:**\n`;
    content += `🍅 Use 25-minute Pomodoro sessions for deep focus\n`;
    content += `⚡ Tackle your hardest task when energy is highest\n`;
    content += `📱 Remove distractions from your workspace\n`;
    content += `🎯 Set specific, measurable goals for each session\n`;
    content += `🚶 Take regular breaks to maintain mental clarity\n\n`;
    content += `📊 **Your current completion rate:** ${completionRate}% - `;
    
    if (completionRate > 70) content += `excellent work! 🌟`;
    else if (completionRate > 50) content += `good progress! 👍`;
    else content += `let's boost this together! 💪`;

    return {
      content,
      suggestions: [
        "Start a Pomodoro session",
        "Show me quick wins",
        "Help me prioritize",
        "Clear my workspace"
      ]
    };
  }

  // Planning with smart suggestions
  if (prompt.includes('plan') || prompt.includes('organize') || prompt.includes('schedule')) {
    const totalTime = incompleteTasks.reduce((sum, task) => sum + (task.estimatedTime || 30), 0);
    const workingHours = Math.min(8, Math.max(1, 17 - hour)); // Remaining working hours
    
    let content = `📅 **Smart Planning for your ${timeOfDay}:**\n\n`;
    content += `• ${incompleteTasks.length} tasks remaining\n`;
    content += `• ~${Math.round(totalTime / 60)} hours of estimated work\n`;
    content += `• ~${workingHours} working hours left today\n\n`;
    
    if (totalTime > workingHours * 60) {
      content += `⚠️ You have more work than time today. Let's prioritize:\n`;
      content += `1. Focus on ${Math.min(3, highPriorityTasks.length)} high-priority tasks\n`;
      content += `2. Move less urgent items to tomorrow\n`;
      content += `3. Consider which tasks can be delegated or simplified`;
    } else {
      content += `✅ Your workload is manageable! Here's my suggested approach:\n`;
      content += `1. Start with ${highPriorityTasks.length > 0 ? 'high-priority tasks' : 'your most important work'}\n`;
      content += `2. Use 25-minute focused work sessions\n`;
      content += `3. Take 5-minute breaks between sessions\n`;
      content += `4. Group similar tasks together for efficiency`;
    }

    return {
      content,
      suggestions: [
        "Show me today's priorities",
        "Help me reschedule tasks",
        "Start with most important",
        "Plan tomorrow instead"
      ]
    };
  }

  // Motivation with personal context
  if (prompt.includes('motivat') || prompt.includes('inspire') || prompt.includes('stuck') || prompt.includes('overwhelmed')) {
    let content = `💪 I understand it can be challenging! Let me help:\n\n`;
    
    if (completedToday.length > 0) {
      content += `🎉 **You've already completed ${completedToday.length} task${completedToday.length > 1 ? 's' : ''} today!** That's progress!\n\n`;
    }
    
    content += `**Remember:**\n`;
    content += `• Progress over perfection - small steps count! 🚶\n`;
    content += `• You've overcome challenges before 💪\n`;
    content += `• Every completed task is a victory 🏆\n`;
    content += `• It's okay to start small and build momentum 🌱\n\n`;
    
    if (incompleteTasks.length > 0) {
      const easiestTask = incompleteTasks.reduce((easiest, current) => 
        (current.estimatedTime || 30) < (easiest.estimatedTime || 30) ? current : easiest
      );
      content += `💡 **Quick win suggestion:** Start with "${easiestTask.text}" (${easiestTask.estimatedTime || 30} min). Sometimes starting is the hardest part!`;
    }

    return {
      content,
      suggestions: [
        "Start with easiest task",
        "Take a 5-minute break",
        "Show me quick wins",
        "I need a different approach"
      ]
    };
  }

  // Default response with context awareness
  const greeting = timeBasedGreetings[timeOfDay];
  let content = `${greeting} I'm your interactive AI assistant! I can help you:\n\n`;
  content += `🎯 **Task Management:**\n`;
  content += `• "Add task: [description]" - I'll add it to your list\n`;
  content += `• "Complete [task name]" - Mark tasks as done\n`;
  content += `• "What should I do?" - Get smart recommendations\n\n`;
  content += `⏰ **Focus & Planning:**\n`;
  content += `• "Start pomodoro" - Begin a focused work session\n`;
  content += `• "Analyze my progress" - Get productivity insights\n`;
  content += `• "Help me plan" - Smart scheduling assistance\n\n`;
  
  if (incompleteTasks.length > 0) {
    content += `📋 **Current Status:** ${incompleteTasks.length} active tasks, ${highPriorityTasks.length} high priority`;
  } else {
    content += `✨ **Current Status:** All caught up! Ready to add new goals?`;
  }

  return {
    content,
    suggestions: [
      "What should I work on?",
      "Add a new task",
      "Analyze my progress",
      "Start a focus session"
    ]
  };
};