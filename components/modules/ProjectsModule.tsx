'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, CheckCircle2, Clock, Calendar, CheckSquare, Layers } from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { Project, ProjectTask, Timesheet } from '@/lib/types/erp';

interface ProjectsModuleProps {
  state: ERPDatabaseState;
}

export function ProjectsModule({ state }: ProjectsModuleProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'timesheets'>('projects');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const projects = state.projects.filter(p => p.tenantId === state.activeTenantId);
  const tasks = state.tasks.filter(t => t.tenantId === state.activeTenantId);
  const timesheets = state.timesheets.filter(ts => ts.tenantId === state.activeTenantId);
  const customers = state.customers.filter(c => c.tenantId === state.activeTenantId);

  // New Project State
  const [prjCode, setPrjCode] = useState(`PRJ-2026-0${projects.length + 1}`);
  const [prjName, setPrjName] = useState('');
  const [prjCustomerId, setPrjCustomerId] = useState(customers[0]?.id || '');
  const [prjBudget, setPrjBudget] = useState(10000);
  const [prjDeadline, setPrjDeadline] = useState(() => new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prjName.trim()) return;

    const cust = customers.find(c => c.id === prjCustomerId);
    erpDb.addProject({
      code: prjCode,
      name: prjName.trim(),
      customerId: cust?.id,
      customerName: cust?.name,
      status: 'in_progress',
      startDate: new Date().toISOString().split('T')[0],
      deadline: prjDeadline,
      budget: Number(prjBudget) || 0
    });

    setShowAddProjectModal(false);
    setPrjName('');
  };

  // New Task State
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Youssef El-Sayed');
  const [taskPriority, setTaskPriority] = useState<ProjectTask['priority']>('medium');

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjectId) return;

    erpDb.addTask({
      projectId: taskProjectId,
      title: taskTitle.trim(),
      assignedTo: taskAssignee,
      status: 'todo',
      priority: taskPriority,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });

    setShowAddTaskModal(false);
    setTaskTitle('');
  };

  const handleUpdateTaskStatus = (taskId: string, status: ProjectTask['status']) => {
    erpDb.updateTaskStatus(taskId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Projects &amp; Operations
          </h1>
          <p className="text-xs text-zinc-500">
            Client Deliverables, Task Execution Boards &amp; Billable Timesheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'projects' && (
            <button
              type="button"
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}

          {activeTab === 'tasks' && (
            <button
              type="button"
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Active Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Task Kanban ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timesheets')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'timesheets'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Billable Timesheets ({timesheets.length})
        </button>
      </div>

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(prj => {
            const prjTasks = tasks.filter(t => t.projectId === prj.id);
            const completedCount = prjTasks.filter(t => t.status === 'done').length;
            const progress = prjTasks.length > 0 ? Math.round((completedCount / prjTasks.length) * 100) : 0;

            return (
              <div key={prj.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      {prj.code}
                    </span>
                    <h3 className="font-bold text-zinc-900 text-sm mt-1">{prj.name}</h3>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                    {prj.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-zinc-600">
                  Client: <span className="font-semibold text-zinc-800">{prj.customerName || 'Internal Deliverable'}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Task Completion</span>
                    <span className="font-mono font-medium">{completedCount}/{prjTasks.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d39e36]" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">Budget: </span>
                    <span className="font-bold text-zinc-900">${prj.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Deadline: </span>
                    <span className="text-zinc-800">{prj.deadline || 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['todo', 'in_progress', 'review', 'done'] as const).map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            const titles: Record<string, string> = {
              todo: 'To Do',
              in_progress: 'In Progress',
              review: 'Review / QA',
              done: 'Completed'
            };

            return (
              <div key={col} className="bg-zinc-100/70 p-3 rounded-xl border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <span className="font-bold text-xs text-zinc-800">{titles[col]}</span>
                  <span className="text-[10px] font-mono bg-white text-zinc-600 px-1.5 py-0.5 rounded font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colTasks.map(task => (
                    <div key={task.id} className="p-3 bg-white rounded-lg border border-zinc-200 shadow-xs space-y-2 text-xs">
                      <div className="font-semibold text-zinc-900 leading-snug">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{task.assignedTo || 'Unassigned'}</span>
                        <span
                          className={`font-bold uppercase ${
                            task.priority === 'high' ? 'text-red-600' : 'text-zinc-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Transition buttons */}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-zinc-100">
                        {col !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                            className="text-[10px] text-zinc-600 hover:text-black font-medium"
                          >
                            Progress →
                          </button>
                        )}
                        {col !== 'done' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'done')}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                          >
                            Done ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMESHEETS TAB */}
      {activeTab === 'timesheets' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Engineer / Member</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Activity Description</th>
                  <th className="py-2.5 px-4 text-right">Logged Hours</th>
                  <th className="py-2.5 px-4 text-right">Billing Rate</th>
                  <th className="py-2.5 px-4 text-right">Total Billable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {timesheets.map(ts => (
                  <tr key={ts.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono text-zinc-500">{ts.date}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{ts.employeeName}</td>
                    <td className="py-3 px-4 text-zinc-700">{ts.projectName}</td>
                    <td className="py-3 px-4 text-zinc-600">{ts.activity}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">{ts.hours} hrs</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-600">${ts.ratePerHour}/hr</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ${(ts.hours * ts.ratePerHour).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Create Project</h2>
            <form onSubmit={handleSaveProject} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={prjCode}
                    onChange={e => setPrjCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={prjBudget}
                    onChange={e => setPrjBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={prjName}
                  onChange={e => setPrjName(e.target.value)}
                  placeholder="e.g. Enterprise Microservices Architecture"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Customer Client</label>
                <select
                  value={prjCustomerId}
                  onChange={e => setPrjCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Project Task</h2>
            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Project *</label>
                <select
                  value={taskProjectId}
                  onChange={e => setTaskProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Set up Supabase Row Level Security policy for payments"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Assignee</label>
                  <input
                    type="text"
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
