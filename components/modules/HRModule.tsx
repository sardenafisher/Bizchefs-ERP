'use client';

import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, Clock, Calendar, Briefcase, FileCheck, XCircle } from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { Employee, AttendanceRecord, LeaveRequest } from '@/lib/types/erp';

interface HRModuleProps {
  state: ERPDatabaseState;
}

export function HRModule({ state }: HRModuleProps) {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves'>('employees');
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showLogAttendanceModal, setShowLogAttendanceModal] = useState(false);

  const employees = state.employees.filter(e => e.tenantId === state.activeTenantId);
  const attendance = state.attendance.filter(a => a.tenantId === state.activeTenantId);
  const leaveRequests = state.leaveRequests.filter(l => l.tenantId === state.activeTenantId);

  // New Employee State
  const [empCode, setEmpCode] = useState(`EMP-00${employees.length + 1}`);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering & Tech');
  const [position, setPosition] = useState('Full-Stack Software Engineer');
  const [salary, setSalary] = useState(2500);

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    erpDb.addEmployee({
      employeeCode: empCode,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      position,
      joiningDate: new Date().toISOString().split('T')[0],
      salary: Number(salary) || 0,
      status: 'active'
    });

    setShowAddEmpModal(false);
    setFullName('');
    setEmail('');
  };

  // Log Attendance State
  const [attEmployeeId, setAttEmployeeId] = useState(employees[0]?.id || '');
  const [attStatus, setAttStatus] = useState<AttendanceRecord['status']>('present');
  const [attCheckIn, setAttCheckIn] = useState('09:00 AM');
  const [attCheckOut, setAttCheckOut] = useState('05:30 PM');

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attEmployeeId) return;

    erpDb.recordAttendance(attEmployeeId, attStatus, attCheckIn, attCheckOut);
    setShowLogAttendanceModal(false);
  };

  const handleUpdateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => {
    erpDb.updateLeaveStatus(leaveId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Human Resources &amp; Personnel
          </h1>
          <p className="text-xs text-zinc-500">
            Employee Directory, Daily Shift Attendance &amp; Leave Request Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'employees' && (
            <button
              type="button"
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}

          {activeTab === 'attendance' && (
            <button
              type="button"
              onClick={() => setShowLogAttendanceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Log Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Employees ({employees.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Attendance Roster ({attendance.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'leaves'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Leave Applications ({leaveRequests.length})
        </button>
      </div>

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Position</th>
                  <th className="py-2.5 px-4">Email / Phone</th>
                  <th className="py-2.5 px-4 text-right">Base Salary</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800">{emp.employeeCode}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{emp.fullName}</td>
                    <td className="py-3 px-4 text-zinc-600">{emp.department}</td>
                    <td className="py-3 px-4 text-zinc-700 font-medium">{emp.position}</td>
                    <td className="py-3 px-4 text-zinc-600">
                      <div>{emp.email}</div>
                      <div className="text-[10px] text-zinc-400">{emp.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${emp.salary.toLocaleString()}/mo
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Check-In</th>
                  <th className="py-2.5 px-4">Check-Out</th>
                  <th className="py-2.5 px-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {attendance.map(att => (
                  <tr key={att.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono text-zinc-500">{att.date}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{att.employeeName}</td>
                    <td className="py-3 px-4 font-mono text-zinc-600">{att.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-mono text-zinc-600">{att.checkOut || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          att.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVES TAB */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Leave Type</th>
                  <th className="py-2.5 px-4">Start Date</th>
                  <th className="py-2.5 px-4">End Date</th>
                  <th className="py-2.5 px-4 text-center">Days</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leaveRequests.map(req => (
                  <tr key={req.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-semibold text-zinc-900">{req.employeeName}</td>
                    <td className="py-3 px-4 capitalize text-zinc-700">{req.leaveType}</td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">{req.startDate}</td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">{req.endDate}</td>
                    <td className="py-3 px-4 text-center font-bold">{req.days}</td>
                    <td className="py-3 px-4 text-zinc-600">{req.reason}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateLeaveStatus(req.id, 'approved')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLeaveStatus(req.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Staff Employee</h2>
            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={empCode}
                    onChange={e => setEmpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Karim Soliman"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Position / Job Title *</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="e.g. Solutions Architect"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="emp@bizchefs.com"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG ATTENDANCE MODAL */}
      {showLogAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Log Shift Attendance</h2>
            <form onSubmit={handleSaveAttendance} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Employee *</label>
                <select
                  value={attEmployeeId}
                  onChange={e => setAttEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Status</label>
                <select
                  value={attStatus}
                  onChange={e => setAttStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  <option value="present">Present on Shift</option>
                  <option value="absent">Unexcused Absence</option>
                  <option value="half_day">Half-Day Shift</option>
                  <option value="leave">Authorized Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Check-In Time</label>
                  <input
                    type="text"
                    value={attCheckIn}
                    onChange={e => setAttCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    value={attCheckOut}
                    onChange={e => setAttCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogAttendanceModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
