import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, PlusCircle, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
}

export default function CalendarView({ tasks, onAddTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showAddQuickModal, setShowAddQuickModal] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickCategory, setQuickCategory] = useState<string>('assignment');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of current month (0: Sunday, 1: Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      const d = new Date(t.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || selectedDay === null) return;

    // Create deadline
    const deadlineDate = new Date(year, month, selectedDay, 17, 0, 0); // 5:00 PM standard deadline

    onAddTask({
      title: quickTitle,
      category: quickCategory as any,
      deadline: deadlineDate.toISOString(),
      priority: 'high',
      description: 'Quick added via interactive Calendar',
      estimatedHours: 2,
      status: 'pending'
    });

    setQuickTitle('');
    setShowAddQuickModal(false);
  };

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      {/* Month Grid */}
      <div className="lg:col-span-8 bg-vivid-panel border-2 border-vivid-border p-6">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF3B30]" />
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
              {monthNames[month]} <span className="text-[#FF3B30]">{year}</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-vivid-dark border border-vivid-border text-white/70 hover:text-white hover:border-white transition"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-vivid-dark border border-vivid-border text-white/70 hover:text-white hover:border-white transition"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-mono font-black uppercase tracking-widest text-white/50 border-b border-white/10 pb-3 mb-3">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 aspect-[7/5]">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="bg-transparent border border-transparent" />
          ))}

          {dayNumbers.map((day) => {
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected = day === selectedDay;
            const dayTasks = getTasksForDay(day);
            const pendingTasks = dayTasks.filter(t => t.status === 'pending');

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col justify-between p-3 transition border-2 ${
                  isSelected
                    ? 'bg-white border-white text-black font-black'
                    : isToday
                    ? 'bg-vivid-dark border-[#FF3B30] text-[#FF3B30] font-black'
                    : 'bg-vivid-dark border-vivid-border text-white/80 hover:border-white/50 hover:bg-white/5 font-bold'
                }`}
              >
                <span className="text-xs font-mono">
                  {day}
                </span>

                {/* Dot marker */}
                {pendingTasks.length > 0 && (
                  <div className="flex gap-1 mt-1 justify-end w-full">
                    <span className={`w-2.5 h-2.5 rounded-none ${isSelected ? 'bg-black' : 'bg-[#FF3B30] animate-pulse'}`} title={`${pendingTasks.length} deadlines!`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day details */}
      <div className="lg:col-span-4 bg-vivid-panel border-2 border-vivid-border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">
              {selectedDay ? `${monthNames[month]} ${selectedDay}, ${year}` : 'Select a date'}
            </h4>
            {selectedDay && (
              <button
                onClick={() => setShowAddQuickModal(true)}
                className="text-xs text-[#FF3B30] hover:text-white transition font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Quick Add
              </button>
            )}
          </div>

          {selectedDay && (
            <div className="space-y-3.5">
              {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-4 bg-black border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
                        task.category === 'assignment'
                          ? 'bg-black text-[#5856D6] border-[#5856D6]/40'
                          : task.category === 'meeting'
                          ? 'bg-black text-amber-500 border-amber-500/40'
                          : task.category === 'bill'
                          ? 'bg-black text-purple-400 border-purple-400/40'
                          : 'bg-black text-[#FF3B30] border-[#FF3B30]/40'
                      }`}>
                        {task.category}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        task.status === 'completed'
                          ? 'text-[#34C759]'
                          : task.status === 'missed'
                          ? 'text-[#FF3B30]'
                          : 'text-[#FF9500]'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <h5 className="text-xs font-black uppercase tracking-tight text-white">{task.title}</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono uppercase font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#FF3B30]" />
                      <span>{new Date(task.deadline).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-7 h-7 text-white/25" />
                  <p className="text-xs text-white/40 font-mono uppercase tracking-widest">No deadlines scheduled</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Form modal container */}
        {showAddQuickModal && selectedDay && (
          <div className="border-t border-white/10 pt-5 mt-5">
            <h5 className="text-xs font-black uppercase tracking-widest text-[#FF3B30] mb-3">Quick Add Task</h5>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full bg-vivid-dark border border-vivid-border px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30]"
                required
              />
              <div className="flex flex-col gap-2">
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full bg-vivid-dark border border-vivid-border px-3 py-2.5 text-xs text-white focus:outline-none uppercase font-mono"
                >
                  <option value="assignment">Assignment</option>
                  <option value="meeting">Meeting</option>
                  <option value="bill">Bill Payment</option>
                  <option value="commitment">Commitment</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-[#FF3B30] text-black hover:text-white text-xs font-black uppercase tracking-widest py-2.5 transition border border-transparent"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddQuickModal(false)}
                    className="bg-vivid-dark border border-vivid-border hover:border-white text-white/70 hover:text-white text-xs font-black uppercase tracking-widest py-2.5 px-4 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
